import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';
import {API_KEY} from '#/api/tmdbApi';
import notifee, {
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import {useIsNotificationSetList} from '#/useLocalStorageSWR';
import {MovieType} from '#/navigator/type';
import uuid from 'react-native-uuid';

const {width} = Dimensions.get('window');

const ComingSoonScreen: React.FC = () => {
  const navigation = useNavigation();
  const [movies, setMovies] = useState<MovieType[]>([]);
  const [loading, setLoading] = useState(true);
  const {data: dataNotificationList, saveData: saveDataNotificationList} =
    useIsNotificationSetList();

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
          poster_path: item.poster_path || '',
          backdrop_path: item.backdrop_path || '',
          overview: item.overview || '',
          release_date: item.release_date || '',
          vote_average: item.vote_average || 0,
          vote_count: item.vote_count || 0,
          genre_ids: item.genre_ids || [],
        }));
        setMovies(movies);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching coming soon movies:', error);
        setLoading(false);
      }
    };

    fetchComingSoonMovies();
  }, []);

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
    await notifee.requestPermission();
    const movieFind = (dataNotificationList || []).find(
      item => item.id === movie.id,
    );
    if (movieFind) {
      await notifee.cancelNotification(movieFind.id.toString());
      const updateData = (dataNotificationList || []).filter(
        item => item.id !== movie.id,
      );
      saveDataNotificationList(updateData);
    } else {
      const newId = uuid.v4().toString();
      const releaseDate = new Date(movie.release_date);
      if (isNaN(releaseDate.getTime())) {
        console.warn(`Invalid release date for ${movie.title}`);
        return;
      }
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: releaseDate.getTime(),
        repeatFrequency: RepeatFrequency.NONE,
      };
      await notifee.createTriggerNotification(
        {
          id: newId,
          title: `${movie?.title} is out now, watch it now!`,
          body: '',
        },
        trigger,
      );
      const updateData = [
        ...(dataNotificationList || []),
        {...movie, id: newId},
      ];
      saveDataNotificationList(updateData);
    }
  };

  const renderMovieItem = ({item, index}: {item: MovieType; index: number}) => {
    return (
      <TouchableOpacity
        style={styles.movieCard}
        onPress={() => {}}
        activeOpacity={0.8}>
        <Image
          source={{
            uri: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/movie%20info-B7KFqipXWPoxaSNv9jRcP1oOuuuCpY.png',
          }}
          style={styles.poster}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => toggleSwitch(item)}>
          <IconButton
            icon="bell-outline"
            size={20}
            iconColor="#0F4C3A"
            style={{margin: 0}}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.title || 'When Life Gives You Tangerines'}
          </Text>
          <Text style={styles.releaseDate}>
            {formatDate(item.release_date) || '20/04/2025'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
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
              iconColor="#999999"
              style={{margin: 0}}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#999999"
            />
          </View>

          <Carousel
            width={width * 0.7}
            height={500}
            data={movies}
            renderItem={renderMovieItem}
            style={styles.carousel}
            loop
            autoPlay
            autoPlayInterval={3000}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50,
            }}
          />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 8,
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
});

export default ComingSoonScreen;
