import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import {MovieType, RootStackParamsList, Screens} from '#/navigator/type';
import {fetchPopularMovies} from '#/api/tmdbApi';
import MovieCard from '#/components/MovieCard';
import {colors} from '#/themes/colors';
import {IconButton} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';

const {width} = Dimensions.get('window');
const numColumns = 3;
const itemWidth = (width - 40 - (numColumns - 1) * 10) / numColumns;
type PopularMoviesScreenProps = {
  navigation: StackNavigationProp<RootStackParamsList>;
};

export const PopularMoviesScreen: React.FC<PopularMoviesScreenProps> = ({
  navigation,
}) => {
  const [movies, setMovies] = useState<MovieType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async (refresh = false) => {
    try {
      setLoading(true);
      const newMovies = await fetchPopularMovies();

      if (refresh) {
        setMovies(newMovies);
        setRefreshing(false);
        setPage(2);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
        setPage(prev => prev + 1);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading popular movies:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMovies(true);
  };

  const handleLoadMore = () => {
    if (!loading) {
      loadMovies();
    }
  };

  const handleMoviePress = (movie: MovieType) => {
    navigation.navigate(Screens.MovieDetailScreen, {movie});
  };

  const renderMovieItem = ({item}: {item: MovieType}) => (
    <MovieCard
      id={item.id || ''}
      title={item.title || ''}
      posterPath={item.poster_path}
      size="small"
      onPress={() => handleMoviePress(item)}
    />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.Primary2} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{uri: 'blobBackground'}}
        style={{flex: 1}}
        resizeMode="cover">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={styles.header}>
          <IconButton
            onPress={() => navigation.goBack()}
            icon="chevron-left"
            size={28}
            iconColor={colors.Primary2}
            style={{margin: 0}}
          />
          <Text style={styles.headerTitle}>Popular Movies</Text>
          <View style={{width: 28}} />
        </View>

        <FlatList
          data={movies}
          renderItem={renderMovieItem}
          keyExtractor={(item, index) => `movie-${item.id}-${index}`}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
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
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F4C3A',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  movieItem: {
    width: itemWidth,
    marginBottom: 10,
  },
  posterContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  poster: {
    width: '100%',
    height: itemWidth * 1.5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  titleContainer: {
    backgroundColor: '#0F4C3A',
    padding: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
