import {API_KEY} from '#/api/tmdbApi';
import {
  MovieType,
  MyMovie,
  RootStackParamsList,
  Screens,
  TypeList,
  VideoType,
} from '#/navigator/type';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {IconButton} from 'react-native-paper';
import WebView from 'react-native-webview';

const {width} = Dimensions.get('window');
type MovieDetailScreenProps = {
  navigation: StackNavigationProp<RootStackParamsList>;
  route: RouteProp<RootStackParamsList, Screens.MovieDetailScreen>;
};

export const MovieDetailScreen: React.FC<MovieDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const {movie, type} = route.params;

  const [movieDetails, setMovieDetails] = useState<MovieType | MyMovie | null>(
    null,
  );
  const [video, setVideo] = useState<VideoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const loadMovieData = async () => {
      try {
        setLoading(true);
        if (type === TypeList.POPULAR) {
          const detailsResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=en-US`,
          );
          const details = await detailsResponse.json();
          setMovieDetails(details);
          const videoData = await fetchMovieVideos(Number(movie.id));
          const trailer = videoData.find(
            v => v.type === 'Trailer' && v.site === 'YouTube',
          );
          setVideo(trailer || videoData[0] || null);
        } else {
          setMovieDetails(movie);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading movie data:', error);
        setLoading(false);
      }
    };

    loadMovieData();
  }, [movie, movie.id, type]);

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = () => {};

  const handlePlayTrailer = () => {
    if (video) {
      setShowTrailer(true);
    }
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
  const getPosterUrl = () => {
    if (movie.poster_path) {
      if (
        movie.poster_path.startsWith('http') ||
        movie.poster_path.startsWith('file')
      ) {
        return movie.poster_path;
      }
      return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    } else {
      return '';
    }
  };
  async function fetchMovieVideos(id: number): Promise<VideoType[]> {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=en-US`,
      );
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching movie videos:', error);
      return [];
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }
  console.log(movie.poster_path);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D8F3E9" />

      <ImageBackground source={{uri: 'gridBg'}} style={{flex: 1}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <IconButton
              icon="chevron-left"
              size={28}
              iconColor="#0F4C3A"
              style={{margin: 0}}
            />
          </TouchableOpacity>

          <View style={styles.posterCard}>
            <Image
              source={{
                uri: getPosterUrl(),
              }}
              style={styles.posterImage}
              resizeMode="cover"
            />
            <View style={styles.titleBanner}>
              <Text style={styles.movieTitle}>
                {movieDetails?.title ||
                  movie.title ||
                  'When Life Gives You Tangerines'}
              </Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {movieDetails?.release_date?.slice(0, 4) || '2025'} •{' '}
              {movieDetails &&
              'vote_average' in movieDetails &&
              movieDetails.vote_average
                ? `${movieDetails.vote_average.toFixed(1)}/10`
                : 'T13'}{' '}
              •{' '}
            </Text>
            <Text style={styles.dateText}>
              {formatDate(movieDetails?.release_date || movie.release_date) ||
                '20/04/2025'}
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>The Plot</Text>
              <View style={styles.actionButtons}>
                <IconButton
                  icon="pencil-outline"
                  size={24}
                  iconColor="#0F4C3A"
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate(Screens.RateScreen, {movie})
                  }
                />
                <IconButton
                  icon="share-outline"
                  size={24}
                  iconColor="#0F4C3A"
                  style={styles.actionButton}
                  onPress={handleShare}
                />
              </View>
            </View>
            <Text style={styles.plotText}>
              {movieDetails?.overview ||
                movie.overview ||
                "In Jeju, a spirited girl and a steadfast boy's island story blossoms into a lifelong tale of setbacks and triumphs - proving love endures across time."}
            </Text>
          </View>

          {video && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Trailer</Text>
              {showTrailer ? (
                <WebView
                  source={{
                    uri: `https://www.youtube.com/embed/${video.key}?autoplay=1`,
                  }}
                  style={styles.trailerWebView}
                  allowsFullscreenVideo
                  javaScriptEnabled
                  domStorageEnabled
                />
              ) : (
                <TouchableOpacity
                  style={styles.trailerContainer}
                  onPress={handlePlayTrailer}
                  activeOpacity={0.9}>
                  <Image
                    source={{
                      uri:
                        'backdrop_path' in movie && movie.backdrop_path
                          ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
                          : 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/movie%20info-B7KFqipXWPoxaSNv9jRcP1oOuuuCpY.png',
                    }}
                    style={styles.trailerThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.playButtonContainer}>
                    <View style={styles.playButton}>
                      <IconButton
                        icon="play"
                        size={30}
                        iconColor="#0F4C3A"
                        style={{margin: 0}}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              <Text style={styles.trailerTitle}>
                Trailer:
                {video?.name || movie.title || 'When Life Gives You Tangerines'}
              </Text>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D8F3E9',
  },
  backButton: {
    padding: 15,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  posterCard: {
    width: width - 40,
    height: width * 1.2,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  titleBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4E9F80',
    padding: 15,
  },
  movieTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  infoText: {
    color: '#0F4C3A',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  dateText: {
    color: '#0F4C3A',
    fontSize: 14,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0F4C3A',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {},
  plotText: {
    color: '#0F4C3A',
    fontSize: 16,
    lineHeight: 24,
  },
  trailerContainer: {
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 10,
    position: 'relative',
  },
  trailerThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  trailerWebView: {
    height: 200,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  trailerTitle: {
    color: '#0F4C3A',
    fontSize: 14,
    marginTop: 5,
  },
  loadingText: {
    color: '#0F4C3A',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});
