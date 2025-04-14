import {API_KEY} from '#/api/tmdbApi';
import {MovieType, Screens, TypeList} from '#/navigator/type';
import {colors} from '#/themes/colors';
import {useIsNotificationSetList} from '#/useLocalStorageSWR';
import notifee, {
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
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
import Carousel from 'react-native-reanimated-carousel';

const {width} = Dimensions.get('window');

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ComingSoonScreen: React.FC = () => {
  const isTablet = width > 768;
  const navigation = useNavigation();
  const [movies, setMovies] = useState<MovieType[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<MovieType[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const {data: dataNotificationList, saveData: saveDataNotificationList} =
    useIsNotificationSetList();
  const currentDate = new Date();
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchComingSoonMovies = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const movies: MovieType[] = (data.results || []).map((item: any) => ({
          id: String(item.id),
          title: item.title || '',
          poster_path: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '',
          backdrop_path: item.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
            : '',
          overview: item.overview || '',
          release_date: item.release_date || '',
          vote_average: item.vote_average || 0,
          vote_count: item.vote_count || 0,
          genre_ids: item.genre_ids || [],
        }));

        setMovies(movies);
        setFilteredMovies(movies);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching coming soon movies:', error);
        setLoading(false);
      }
    };

    fetchComingSoonMovies();
  }, []);

  const debouncedFilterMovies = useCallback(
    debounce(() => {
      if (searchQuery.trim() === '') {
        setFilteredMovies(movies);
      } else {
        const filtered = movies.filter(movie =>
          movie.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        );
        setFilteredMovies(filtered);
      }
    }, 300),
    [movies, searchQuery],
  );

  useEffect(() => {
    debouncedFilterMovies();
  }, [searchQuery, movies, debouncedFilterMovies]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.blur();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      .replace(/\//g, '/');
  };

  const toggleSwitch = async (movie: MovieType) => {
    try {
      await notifee.requestPermission();
      const movieFind = (dataNotificationList || []).find(
        item => item.id === movie.id,
      );
      if (movieFind) {
        await notifee.cancelNotification(movieFind.id.toString());
        const updateData = (dataNotificationList || []).filter(
          item => item.id !== movie.id,
        );
        await saveDataNotificationList(updateData);
      } else {
        const releaseDate = new Date(movie.release_date);
        if (isNaN(releaseDate.getTime())) {
          console.warn(`Invalid release date for ${movie.title}`);
          return;
        }
        if (movie.release_date && new Date(movie.release_date) > currentDate) {
          const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: releaseDate.getTime(),
            repeatFrequency: RepeatFrequency.NONE,
          };
          await notifee.createTriggerNotification(
            {
              id: movie.id.toString(),
              title: `${movie?.title} is out now, watch it now!`,
              body: '',
            },
            trigger,
          );
        }
        const updateData = [
          ...(dataNotificationList || []),
          {...movie, id: movie.id},
        ];
        await saveDataNotificationList(updateData);
      }
    } catch (error) {
      console.error('Error toggling notification:', error);
    }
  };

  const renderMovieItem = ({item, index}: {item: MovieType; index: number}) => {
    const movieNotife = (dataNotificationList || []).find(
      notification => notification.id === item.id,
    );

    return (
      <TouchableOpacity
        style={styles.movieCard}
        onPress={() =>
          navigation.navigate(Screens.MovieDetailScreen, {
            movie: item,
            type: TypeList.POPULAR,
          })
        }
        activeOpacity={0.8}
        accessibilityLabel={`View details for ${item.title}`}>
        <Image
          source={{
            uri: item.poster_path
              ? item.poster_path
              : 'https://via.placeholder.com/500x750?text=No+Poster',
          }}
          style={styles.poster}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => toggleSwitch(item)}
          accessibilityLabel={
            movieNotife
              ? `Turn off notification for ${item.title}`
              : `Turn on notification for ${item.title}`
          }>
          <IconButton
            icon={movieNotife ? 'bell' : 'bell-outline'}
            size={20}
            iconColor="#0F4C3A"
            style={{margin: 0}}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.title || 'Untitled Movie'}
          </Text>
          <Text style={styles.releaseDate}>
            {formatDate(item.release_date) || 'Unknown Date'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0F4C3A" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D8F3E9" />
      <ImageBackground
        source={{uri: 'gridBg'}}
        style={{flex: 1}}
        resizeMode="cover">
        <View style={styles.background}>
          <Text style={styles.headerTitle}>Coming Soon</Text>

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

          {filteredMovies.length === 0 && searchQuery.trim() !== '' ? (
            <Text style={styles.emptyText}>No results found.</Text>
          ) : (
            <Carousel
              width={width * 0.7}
              height={500}
              data={filteredMovies}
              renderItem={renderMovieItem}
              style={styles.carousel}
              loop
              autoPlay={filteredMovies.length > 1}
              autoPlayInterval={3000}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.9,
                parallaxScrollingOffset: 50,
              }}
            />
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D8F3E9',
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
    width: width,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F4C3A',
    marginBottom: 15,
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  clearIcon: {
    margin: 0,
    marginLeft: 10,
  },
  carousel: {
    alignItems: 'center',
  },
  movieCard: {
    width: width * 0.7,
    height: 500,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  notificationButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
  },
  titleContainer: {
    backgroundColor: '#0F4C3A',
    padding: 10,
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
  },
  movieTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  releaseDate: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  loadingText: {
    color: '#0F4C3A',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#0F4C3A',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  searchIcon: {
    margin: 0,
    marginRight: 10,
  },
});

export default ComingSoonScreen;
