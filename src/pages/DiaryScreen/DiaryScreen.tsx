import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Alert,
  ImageBackground,
} from 'react-native';
import {IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {colors} from '#/themes/colors';
import {useRateMovieList} from '#/useLocalStorageSWR';

interface DiaryEntry {
  id: string;
  movieId: string; // Changed to string to match idMovie
  title: string;
  year: string;
  posterPath: string;
  rating: number;
  review: string;
  date: Date;
}

interface DayItem {
  id: string;
  day: string;
  date: number;
  month: number;
  year: number;
  fullDate: Date;
  isSelected: boolean;
}

const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // Replace with your TMDb API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const MovieDiaryScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [days, setDays] = useState<DayItem[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const {data, saveData} = useRateMovieList();

  console.log(data);

  const generateDays = (refDate: Date) => {
    const daysArray: DayItem[] = [];

    for (let i = -3; i <= 3; i++) {
      const date = new Date(refDate);
      date.setDate(refDate.getDate() + i);

      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      daysArray.push({
        id: `day-${date.toISOString()}`,
        day: dayNames[date.getDay()],
        date: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        fullDate: date,
        isSelected:
          i === 0 && date.toDateString() === selectedDate.toDateString(),
      });
    }

    setDays(daysArray);
  };

  const fetchMovieDetails = async (
    movieId: string,
  ): Promise<Partial<DiaryEntry>> => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`,
      );
      if (!response.ok) throw new Error('Movie not found');
      const movie = await response.json();
      return {
        title: movie.title || 'Unknown Title',
        year: movie.release_date
          ? movie.release_date.split('-')[0]
          : 'Unknown Year',
        posterPath: movie.poster_path
          ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
          : 'https://via.placeholder.com/100x140.png?text=No+Poster',
      };
    } catch (error) {
      console.error(`Failed to fetch movie ${movieId}:`, error);
      return {
        title: 'Unknown Title',
        year: 'Unknown Year',
        posterPath: 'https://via.placeholder.com/100x140.png?text=No+Poster',
      };
    }
  };

  const loadDiaryEntries = async () => {
    if (!data || !Array.isArray(data)) {
      setDiaryEntries([]);
      setFilteredEntries([]);
      return;
    }

    const entries: DiaryEntry[] = await Promise.all(
      data.map(async (item: any) => {
        const movieDetails = await fetchMovieDetails(item.idMovie);
        return {
          id: item.idMovie,
          movieId: item.idMovie,
          title: movieDetails.title,
          year: movieDetails.year,
          posterPath: movieDetails.posterPath,
          rating: item.star,
          review: item.review,
          date: new Date(item.date),
        };
      }),
    );

    setDiaryEntries(entries);
    // Initially filter for the selected date
    const filtered = entries.filter(
      entry => entry.date.toDateString() === selectedDate.toDateString(),
    );
    setFilteredEntries(filtered);
  };

  useEffect(() => {
    generateDays(referenceDate);
    loadDiaryEntries();
  }, [referenceDate, data]);

  useEffect(() => {
    // Update filtered entries when selectedDate changes
    const filtered = diaryEntries.filter(
      entry => entry.date.toDateString() === selectedDate.toDateString(),
    );
    setFilteredEntries(filtered);
  }, [selectedDate, diaryEntries]);

  const moveWeekBackward = () => {
    const newRefDate = new Date(referenceDate);
    newRefDate.setDate(referenceDate.getDate() - 7);
    setReferenceDate(newRefDate);
    setSelectedDate(newRefDate);
  };

  const moveWeekForward = () => {
    const newRefDate = new Date(referenceDate);
    newRefDate.setDate(referenceDate.getDate() + 7);
    setReferenceDate(newRefDate);
    setSelectedDate(newRefDate);
  };

  const handleDaySelect = (day: DayItem) => {
    const updatedDays = days.map(d => ({
      ...d,
      isSelected: d.id === day.id,
    }));
    setDays(updatedDays);
    setSelectedDate(day.fullDate);
    // Filtering is handled by useEffect
  };

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this diary entry?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedEntries = diaryEntries.filter(
              entry => entry.id !== entryId,
            );
            setDiaryEntries(updatedEntries);
            // Update filtered entries
            const filtered = updatedEntries.filter(
              entry =>
                entry.date.toDateString() === selectedDate.toDateString(),
            );
            setFilteredEntries(filtered);
            // Update local storage
            saveData(
              updatedEntries.map(entry => ({
                idMovie: entry.movieId,
                star: entry.rating,
                review: entry.review,
                date: entry.date.toISOString(),
              })),
            );
          },
        },
      ],
    );
  };

  const getMonthYearDisplay = () => {
    if (days.length === 0) return '';
    const firstDay = days[0];
    const lastDay = days[days.length - 1];
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    if (firstDay.month === lastDay.month && firstDay.year === lastDay.year) {
      return `${monthNames[days[3].month]} ${days[3].year}`;
    } else {
      return `${monthNames[firstDay.month]} ${firstDay.year} - ${
        monthNames[lastDay.month]
      } ${lastDay.year}`;
    }
  };

  const renderDayItem = ({item}: {item: DayItem}) => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return (
      <TouchableOpacity
        style={[styles.dayItem, item.isSelected && styles.selectedDayItem]}
        onPress={() => handleDaySelect(item)}>
        <Text
          style={[styles.dayText, item.isSelected && styles.selectedDayText]}>
          {item.day}
        </Text>
        <Text
          style={[styles.dateText, item.isSelected && styles.selectedDayText]}>
          {item.date}
        </Text>
        <Text
          style={[styles.monthText, item.isSelected && styles.selectedDayText]}>
          {monthNames[item.month]}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDiaryEntry = ({item}: {item: DiaryEntry}) => (
    <View style={styles.entryContainer}>
      <View style={styles.entryCard}>
        <Image
          source={{uri: item.posterPath}}
          style={styles.entryPoster}
          resizeMode="cover"
        />
        <View style={styles.entryContent}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>
              {item.title} ({item.year})
            </Text>
            <TouchableOpacity
              onPress={() => handleDeleteEntry(item.id)}
              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
              <IconButton
                icon="close"
                size={20}
                iconColor="#0F4C3A"
                style={{margin: 0}}
                onPress={() => handleDeleteEntry(item.id)}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <IconButton
                key={`star-${star}`}
                icon={star <= item.rating ? 'star' : 'star-outline'}
                size={24}
                iconColor={colors.Primary}
                style={styles.starIcon}
              />
            ))}
          </View>

          <Text style={styles.reviewText} numberOfLines={4}>
            {item.review}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{uri: 'blobBackground'}}
        style={{flex: 1}}
        resizeMode="cover">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Movie Diary</Text>
        </View>

        <View style={styles.searchContainer}>
          <IconButton
            icon="magnify"
            size={20}
            iconColor={colors.Primary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.calendarHeader}>
          <Text style={styles.monthYearText}>{getMonthYearDisplay()}</Text>
        </View>

        <View style={styles.calendarContainer}>
          <View style={styles.calendarNavigation}>
            <IconButton
              icon="chevron-left"
              size={24}
              iconColor="#0F4C3A"
              style={styles.navButton}
              onPress={moveWeekBackward}
            />
            <FlatList
              data={days}
              renderItem={renderDayItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.calendarList}
              style={styles.calendarFlatList}
            />
            <IconButton
              icon="chevron-right"
              size={24}
              iconColor="#0F4C3A"
              style={styles.navButton}
              onPress={moveWeekForward}
            />
          </View>
        </View>

        <FlatList
          data={filteredEntries}
          renderItem={renderDiaryEntry}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.entriesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No diary entries for this date.
            </Text>
          }
        />

        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <IconButton
              icon="movie-outline"
              size={24}
              iconColor="#FFFFFF"
              style={styles.tabIcon}
            />
            <Text style={styles.tabText}>Movie</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
            <IconButton
              icon="book-outline"
              size={24}
              iconColor="#FFFFFF"
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, styles.activeTabText]}>Diary</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('ComingSoon')}>
            <IconButton
              icon="calendar"
              size={24}
              iconColor="#FFFFFF"
              style={styles.tabIcon}
            />
            <Text style={styles.tabText}>Coming Soon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('Settings')}>
            <IconButton
              icon="cog-outline"
              size={24}
              iconColor="#FFFFFF"
              style={styles.tabIcon}
            />
            <Text style={styles.tabText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F4C3A',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 45,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    marginBottom: 15,
  },
  searchIcon: {
    margin: 0,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  calendarHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F4C3A',
    textAlign: 'center',
  },
  calendarContainer: {
    marginBottom: 15,
  },
  calendarNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navButton: {
    margin: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  calendarFlatList: {
    flex: 1,
  },
  calendarList: {
    paddingHorizontal: 5,
  },
  dayItem: {
    width: 60,
    height: 80,
    backgroundColor: '#6BBB9A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedDayItem: {
    backgroundColor: '#0F4C3A',
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  entriesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  entryContainer: {
    marginBottom: 15,
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  entryPoster: {
    width: 100,
    height: 140,
  },
  entryContent: {
    flex: 1,
    padding: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F4C3A',
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starIcon: {
    margin: 0,
  },
  reviewText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#0F4C3A',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  activeTab: {
    backgroundColor: '#0D3F31',
  },
  tabIcon: {
    margin: 0,
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 2,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#333333',
    fontSize: 16,
    marginTop: 20,
  },
});

export default MovieDiaryScreen;
