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
  TextInput,
} from 'react-native';
import {
  MovieType,
  MyMovie,
  RootStackParamsList,
  Screens,
  TypeList,
} from '#/navigator/type';
import {searchMovies} from '#/api/tmdbApi';
import MovieCard from '#/components/MovieCard';
import {colors} from '#/themes/colors';
import {IconButton} from 'react-native-paper';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useInitializeMovie} from '#/useLocalStorageSWR';

const numColumns = 3;

type SearchMovieScreenProps = {
  navigation: StackNavigationProp<RootStackParamsList>;
  route: RouteProp<RootStackParamsList, Screens.SearchMovieScreen>;
};

export const SearchMovieScreen: React.FC<SearchMovieScreenProps> = ({
  navigation,
  route,
}) => {
  const {type} = route.params;
  const [movies, setMovies] = useState<(MovieType | MyMovie)[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {data, saveData} = useInitializeMovie();
  const loadMovies = useCallback<
    (query: string, refresh?: boolean) => Promise<void>
  >(async (query, refresh = false) => {
    if (!query) {
      setMovies([]);
      return;
    }
    try {
      setLoading(true);
      const newMovies = await searchMovies(query);
      if (refresh) {
        setMovies(newMovies);
      } else {
        setMovies(prev => [...prev, ...newMovies]);
      }
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error searching movies:', error);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        loadMovies(searchQuery, true);
      } else {
        setMovies([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, loadMovies]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMovies(searchQuery, true);
  };

  const handleLoadMore = () => {
    if (!loading && searchQuery) {
      loadMovies(searchQuery);
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
      onPress={() => {
        if (type === TypeList.MYLIST) {
          saveData(item);
          navigation.goBack();
        } else {
          handleMoviePress(item);
        }
      }}
      type="show"
    />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <Text>Loading....</Text>
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
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies..."
            placeholderTextColor={colors.Gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
        </View>

        {searchQuery === '' && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Enter a movie title to search</Text>
          </View>
        )}

        {searchQuery !== '' && movies.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No movies found</Text>
          </View>
        )}

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
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: colors.Gray,
    textAlign: 'center',
  },
});
