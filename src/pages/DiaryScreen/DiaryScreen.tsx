import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {colors} from '#/themes/colors';
import {useRateMovieList} from '#/useLocalStorageSWR';
import DiaryEntryCard from '#/components/DiaryEntryCard';
import {DayItem, DiaryEntry, RateMovie, Screens} from '#/navigator/type';

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const MovieDiaryScreen = () => {
  const {width} = Dimensions.get('window');
  const isTablet = width > 768;
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [days, setDays] = useState<DayItem[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const {data, saveData} = useRateMovieList();
  const searchInputRef = useRef<TextInput>(null);

  const generateDays = useCallback(
    (refDate: Date) => {
      const daysArray: DayItem[] = [];
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      for (let i = -3; i <= 3; i++) {
        const date = new Date(refDate);
        date.setDate(refDate.getDate() + i);

        daysArray.push({
          id: `day-${date.toISOString()}`,
          day: dayNames[date.getDay()],
          date: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
          fullDate: date,
          isSelected: date.toDateString() === selectedDate.toDateString(),
        });
      }

      setDays(daysArray);
    },
    [selectedDate],
  );

  const loadDiaryEntries = useCallback(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setDiaryEntries([]);
      setFilteredEntries([]);
      setIsSearching(false);
      return;
    }

    const entries: DiaryEntry[] = data.map((item: RateMovie) => {
      const releaseYear = item.movie.release_date
        ? new Date(item.movie.release_date).getFullYear().toString()
        : new Date().getFullYear().toString();
      return {
        id: item.movie.id,
        movieId: item.movie.id,
        title: item.movie.title || 'Unknown',
        year: releaseYear,
        posterPath:
          item.movie.poster_path ||
          'https://via.placeholder.com/100x140.png?text=No+Poster',
        rating: item.star || 1,
        review: item.review || '',
        date: new Date(item.date),
      };
    });

    setDiaryEntries(entries);

    const filtered = entries.filter(
      entry =>
        entry.date.toDateString() === selectedDate.toDateString() &&
        (searchQuery.trim() === '' ||
          entry.title.toLowerCase().includes(searchQuery.trim().toLowerCase())),
    );
    setFilteredEntries(filtered);
    setIsSearching(false);
  }, [data, selectedDate, searchQuery]);

  const debouncedLoadDiaryEntries = useCallback(
    debounce(() => {
      loadDiaryEntries();
    }, 300),
    [loadDiaryEntries],
  );

  useEffect(() => {
    generateDays(referenceDate);
    debouncedLoadDiaryEntries();
  }, [referenceDate, data, generateDays, debouncedLoadDiaryEntries]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setIsSearching(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    searchInputRef.current?.blur();
  };

  const moveWeekBackward = useCallback(() => {
    const newRefDate = new Date(referenceDate);
    newRefDate.setDate(referenceDate.getDate() - 7);
    setReferenceDate(newRefDate);
    setSelectedDate(newRefDate);
  }, [referenceDate]);

  const moveWeekForward = useCallback(() => {
    const newRefDate = new Date(referenceDate);
    newRefDate.setDate(referenceDate.getDate() + 7);
    setReferenceDate(newRefDate);
    setSelectedDate(newRefDate);
  }, [referenceDate]);

  const handleDaySelect = useCallback(
    (day: DayItem) => {
      const updatedDays = days.map(d => ({
        ...d,
        isSelected: d.id === day.id,
      }));
      setDays(updatedDays);
      setSelectedDate(day.fullDate);
    },
    [days],
  );

  const handleDeleteEntry = useCallback(
    (entryId: string) => {
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
              const filtered = updatedEntries.filter(
                entry =>
                  entry.date.toDateString() === selectedDate.toDateString() &&
                  (searchQuery.trim() === '' ||
                    entry.title
                      .toLowerCase()
                      .includes(searchQuery.trim().toLowerCase())),
              );
              setFilteredEntries(filtered);
              saveData(
                updatedEntries.map(entry => ({
                  movie: {
                    id: entry.movieId,
                    title: entry.title,
                    vote_average: 0,
                    release_date: `${entry.year}-01-01`,
                    overview: '',
                    poster_path: entry.posterPath,
                  },
                  star: entry.rating,
                  review: entry.review,
                  date: entry.date.toISOString(),
                })),
              );
            },
          },
        ],
      );
    },
    [diaryEntries, selectedDate, searchQuery, saveData],
  );

  const getMonthYearDisplay = useCallback(() => {
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
    }
    return `${monthNames[firstDay.month]} ${firstDay.year} - ${
      monthNames[lastDay.month]
    } ${lastDay.year}`;
  }, [days]);

  const renderDayItem = useCallback(
    ({item}: {item: DayItem}) => {
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
          style={[
            styles.dayItem,
            item.isSelected && styles.selectedDayItem,
            {
              width: isTablet ? 120 : 60,
              height: isTablet ? 130 : 80,
            },
          ]}
          onPress={() => handleDaySelect(item)}
          accessibilityLabel={`Select ${item.day}, ${item.date} ${
            monthNames[item.month]
          }`}>
          <Text
            style={[styles.dayText, item.isSelected && styles.selectedDayText]}>
            {item.day}
          </Text>
          <Text
            style={[
              styles.dateText,
              item.isSelected && styles.selectedDayText,
            ]}>
            {item.date}
          </Text>
          <Text
            style={[
              styles.monthText,
              item.isSelected && styles.selectedDayText,
            ]}>
            {monthNames[item.month]}
          </Text>
        </TouchableOpacity>
      );
    },
    [handleDaySelect],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{uri: 'blobBackground'}}
        style={{flex: 1}}
        resizeMode="cover">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor="#0F4C3A"
            onPress={navigation.goBack}
            accessibilityLabel="Go back"
          />
          <Text style={styles.headerTitle}>Movie Diary</Text>
          <View style={{width: 24}} />
        </View>

        <View style={styles.searchContainer}>
          <IconButton
            icon="magnify"
            size={20}
            iconColor={colors.Primary}
            style={styles.searchIcon}
            accessibilityLabel="Search"
          />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search by title"
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={handleSearchChange}
            accessibilityLabel="Search movie titles"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <IconButton
              icon="close"
              size={20}
              iconColor={colors.Primary}
              style={styles.clearIcon}
              onPress={handleClearSearch}
              accessibilityLabel="Clear search"
            />
          )}
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
              accessibilityLabel="Previous week"
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
              accessibilityLabel="Next week"
            />
          </View>
        </View>

        <FlatList
          data={filteredEntries}
          renderItem={({item}) => (
            <DiaryEntryCard
              item={item}
              onDelete={handleDeleteEntry}
              onClick={movie => {
                navigation.navigate(Screens.RateScreen, {
                  movie: {
                    title: movie.title,
                    vote_average: 0,
                    release_date: movie.year || '2025',
                    overview: movie.review,
                    poster_path: movie.posterPath || '',
                    id: movie.id,
                  },
                });
              }}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.entriesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery.trim() && filteredEntries.length === 0
                ? 'No results found.'
                : 'No diary entries for this date.'}
            </Text>
          }
          ListFooterComponent={
            isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.Primary2} />
              </View>
            ) : null
          }
        />
      </ImageBackground>
    </SafeAreaView>
  );
};
//Hello
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F4C3A',
    flex: 1,
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
  clearIcon: {
    margin: 0,
    marginLeft: 10,
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
  emptyText: {
    textAlign: 'center',
    color: '#333333',
    fontSize: 16,
    marginTop: 20,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default MovieDiaryScreen;
