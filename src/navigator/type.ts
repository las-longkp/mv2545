export enum Screens {
  MainScreen = 'MainScreen',
  HomeScreen = 'HomeScreen',
  MovieScreen = 'MovieScreen',
  DiaryScreen = 'DiaryScreen',
  ComingSoonScreen = 'ComingSoonScreen',
  SettingsScreen = 'SettingsScreen',
  MovieDetailScreen = 'MovieDetailScreen',
  RateScreen = 'RateScreen',
  ListMovieScreen = 'ListMovieScreen',
  AddMovieScreen = 'AddMovieScreen',
}

export type RootStackParamsList = {
  HomeScreen: undefined;
  MainScreen: undefined;
  ComingSoonScreen: undefined;
  DiaryScreen: undefined;
  ListMovieScreen: {type: TypeList};
  MovieScreen: undefined;
  SettingsScreen: undefined;
  AddMovieScreen: undefined;
  MovieDetailScreen: {movie: MovieType | MyMovie; type: TypeList};
  RateScreen: {movie: MovieType | MyMovie};
};
export interface MovieType {
  id: number | string;
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
export interface MyMovie {
  title: string;
  genre: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  id: string;
}
export enum TypeList {
  POPULAR = 'popular',
  MYLIST = 'myList',
}
export interface RateMovie {
  idMovie: string;
  star: number;
  review: string;
  date: string;
}
