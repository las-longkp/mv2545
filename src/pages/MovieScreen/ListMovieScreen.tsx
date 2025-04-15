import React, {useState, useEffect, useCallback} from 'react';
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
import {
  MovieType,
  MyMovie,
  RootStackParamsList,
  Screens,
  TypeList,
} from '#/navigator/type';
import {fetchPopularMovies} from '#/api/tmdbApi';
import MovieCard from '#/components/MovieCard';
import {colors} from '#/themes/colors';
import {IconButton} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useMyMovieList} from '#/useLocalStorageSWR';

const {width} = Dimensions.get('window');
const numColumns = 3;
const itemWidth = (width - 40 - (numColumns - 1) * 10) / numColumns;

type ListMovieScreenProps = {
  navigation: StackNavigationProp<RootStackParamsList>;
  route: RouteProp<RootStackParamsList, Screens.ListMovieScreen>;
};

export const ListMovieScreen: React.FC<ListMovieScreenProps> = ({
  navigation,
  route,
}) => {
  const {type} = route.params;
  const [movies, setMovies] = useState<(MovieType | MyMovie)[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {data: dataMyMovieList, saveData: saveDataMyMovieList} =
    useMyMovieList();

  const loadMovies = useCallback<(refresh?: boolean) => Promise<void>>(
    async (refresh = false) => {
      try {
        setLoading(true);
        if (type === TypeList.POPULAR) {
          const newMovies = await fetchPopularMovies();
          if (refresh) {
            setMovies(newMovies);
            setRefreshing(false);
            setPage(2);
          } else {
            setMovies(prev => [...prev, ...newMovies]);
            setPage(prev => prev + 1);
          }
        } else {
          setMovies(dataMyMovieList || []);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading popular movies:', error);
        setLoading(false);
        setRefreshing(false);
      }
    },
    [type, dataMyMovieList],
  );

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMovies(true);
  };

  const handleLoadMore = () => {
    if (!loading) {
      loadMovies();
    }
  };

  const handleMoviePress = (movie: MovieType | MyMovie) => {
    navigation.navigate(Screens.MovieDetailScreen, {
      movie,
      type: TypeList.POPULAR,
    });
  };

  const renderMovieItem = ({item}: {item: MovieType | MyMovie}) => (
    <MovieCard
      id={item.id || ''}
      title={item.title || ''}
      posterPath={item.poster_path || ''}
      size="small"
      onPress={() => handleMoviePress(item)}
      type="show"
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
          <Text style={styles.headerTitle}>
            {type === TypeList.POPULAR ? 'Popular Movies' : 'My List'}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate(Screens.SearchMovieScreen, {
                type: TypeList.POPULAR,
              })
            }>
            {type === TypeList.POPULAR && (
              <Image
                style={{height: 20, width: 20}}
                source={{uri: 'searchIcon'}}
              />
            )}
          </TouchableOpacity>
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
    justifyContent: 'flex-start',
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
