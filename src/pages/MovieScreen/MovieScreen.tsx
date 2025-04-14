import {fetchPopularMovies, fetchTrendingMovies} from '#/api/tmdbApi';
import MovieCard from '#/components/MovieCard';
import {
  MovieType,
  MyMovie,
  RootStackParamsList,
  Screens,
  TypeList,
} from '#/navigator/type';
import {useMyMovieList} from '#/useLocalStorageSWR';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
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
import Carousel from 'react-native-reanimated-carousel';

const {width} = Dimensions.get('window');

type MovieScreenProps = {
  navigation: StackNavigationProp<RootStackParamsList>;
};

export const MovieScreen: React.FC<MovieScreenProps> = ({navigation}) => {
  const isTablet = width > 768;
  const {data: dataMyMovieList, saveData: saveDataMyMovieList} =
    useMyMovieList();
  const [trendingMovies, setTrendingMovies] = useState<MovieType[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieType[]>([]);
  const [myList, setMyList] = useState<MovieType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const trending = await fetchTrendingMovies();
        setTrendingMovies(trending);

        const popular = await fetchPopularMovies();
        setPopularMovies(popular);

        if (trending.length > 0) {
          setMyList([trending[0], trending[1], trending[2]]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading movies:', error);
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  const handleMoviePress = (movie: MovieType | MyMovie, type: TypeList) => {
    navigation.navigate(Screens.MovieDetailScreen, {
      movie,
      type: type,
    });
  };

  const handleAddMovie = () => {
    navigation.navigate(Screens.AddMovieScreen);
  };

  const getPosterUrl = (posterPath?: string) => {
    if (posterPath) {
      if (posterPath.startsWith('http') || posterPath.startsWith('file')) {
        return posterPath;
      }
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    }
    return 'https://via.placeholder.com/500x750?text=No+Poster';
  };

  const renderMovieCard = ({item}: {item: MovieType}) => (
    <MovieCard
      id={item.id || ''}
      title={item.title || ''}
      posterPath={item.poster_path}
      size="small"
      onPress={() => handleMoviePress(item, TypeList.POPULAR)}
      type="show"
    />
  );

  const renderFeaturedMovie = ({item}: {item: MovieType}) => {
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => handleMoviePress(item, TypeList.POPULAR)}
        activeOpacity={0.9}
        accessibilityLabel={`View details for ${item.title}`}>
        <Image
          source={{
            uri: getPosterUrl(item.poster_path),
          }}
          style={styles.featuredPoster}
          resizeMode="cover"
        />
        <View style={styles.featuredTitleContainer}>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.ratingContainer}>
            <IconButton
              icon="star"
              size={16}
              iconColor="#FFFFFF"
              style={{margin: 0}}
            />
            <Text style={styles.ratingText}>
              {Math.round(item.vote_average * 10)}%
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeaturedCarousel = () => {
    if (loading || trendingMovies.length === 0) {
      return (
        <View style={styles.featuredContainer}>
          <Text style={styles.sectionTitle}>
            Movie <Text style={styles.releasedText}>RELEASED</Text>
          </Text>
          <Text style={styles.releasedYear}>in 2025</Text>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    return (
      <View style={styles.featuredContainer}>
        <Text style={styles.sectionTitle}>
          Movie <Text style={styles.releasedText}>RELEASED</Text>
        </Text>
        <Text style={styles.releasedYear}>in 2025</Text>
        <Carousel
          width={width - 20}
          height={isTablet ? 700 : 250}
          data={trendingMovies.slice(0, 5)}
          renderItem={renderFeaturedMovie}
          loop
          autoPlay
          autoPlayInterval={3000}
          scrollAnimationDuration={1000}
          style={styles.carousel}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D8F3E9" />
      <ImageBackground
        source={{uri: 'gridBg'}}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.header}>
          <View style={{width: 24}} />
          <Text style={styles.headerTitle}>My Movie</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(Screens.NotificationsScreen)}
            style={styles.notificationButton}>
            <IconButton
              icon="bell"
              size={24}
              iconColor="#0F4C3A"
              style={{margin: 0}}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {renderFeaturedCarousel()}

          <View style={styles.listSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>My List</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(Screens.ListMovieScreen, {
                    type: TypeList.MYLIST,
                  })
                }>
                <View style={styles.seeAllContainer}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <IconButton
                    icon="chevron-right"
                    size={16}
                    iconColor="#0F4C3A"
                    style={{margin: 0}}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={[styles.horizontalListContent, {flexDirection: 'row'}]}>
              <MovieCard
                id={''}
                title={''}
                posterPath={''}
                size="small"
                onPress={handleAddMovie}
                type={'add'}
              />
              <FlatList
                data={dataMyMovieList || []}
                renderItem={({item}) => (
                  <MovieCard
                    id={item.id || ''}
                    title={item.title || ''}
                    posterPath={item.poster_path || ''}
                    size="small"
                    onPress={() => handleMoviePress(item, TypeList.MYLIST)}
                    type="show"
                  />
                )}
                keyExtractor={(item, index) => `mylist-${item.id}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </View>

          <View style={styles.listSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>Popular Movies</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(Screens.ListMovieScreen, {
                    type: TypeList.POPULAR,
                  })
                }>
                <View style={styles.seeAllContainer}>
                  <Text style={styles.seeAllText}>See all</Text>
                  <IconButton
                    icon="chevron-right"
                    size={16}
                    iconColor="#0F4C3A"
                    style={{margin: 0}}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <FlatList
              data={popularMovies}
              renderItem={renderMovieCard}
              keyExtractor={item => `popular-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalListContent}
            />
          </View>
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
  backgroundImage: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F4C3A',
  },
  notificationButton: {
    padding: 5,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  featuredContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#0F4C3A',
    marginBottom: 5,
  },
  releasedText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  releasedYear: {
    fontSize: 24,
    fontWeight: '500',
    color: '#0F4C3A',
    textAlign: 'right',
    marginTop: -10,
    marginBottom: 15,
  },
  featuredCard: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  featuredPoster: {
    width: '100%',
    height: '100%',
  },
  featuredTitleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(78, 159, 128, 0.8)',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  listSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F4C3A',
  },
  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#0F4C3A',
    fontSize: 16,
    fontWeight: '500',
  },
  horizontalListContent: {
    paddingHorizontal: 15,
  },
  carousel: {
    marginHorizontal: -10,
  },
  loadingText: {
    fontSize: 16,
    color: '#0F4C3A',
    textAlign: 'center',
    marginTop: 20,
  },
});
