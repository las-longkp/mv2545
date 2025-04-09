export enum Screens {
  MainScreen = 'MainScreen',
  HomeScreen = 'HomeScreen',
  MovieScreen = 'MovieScreen',
  DiaryScreen = 'DiaryScreen',
  ComingSoonScreen = 'ComingSoonScreen',
  SettingsScreen = 'SettingsScreen',
  MovieDetailScreen = 'MovieDetailScreen',
  RateScreen = 'RateScreen',
  PopularMoviesScreen = 'PopularMoviesScreen',
  AddMovieScreen = 'AddMovieScreen',
}

export type RootStackParamsList = {
  HomeScreen: undefined;
  MainScreen: undefined;
  ComingSoonScreen: undefined;
  DiaryScreen: undefined;
  PopularMoviesScreen: undefined;
  MovieScreen: undefined;
  SettingsScreen: undefined;
  AddMovieScreen: undefined;
  MovieDetailScreen: {movie: MovieType};
  RateScreen: {movie: MovieType};
};
export interface MovieType {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}
export interface VideoType {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}
