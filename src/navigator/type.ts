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
  SearchMovieScreen = 'SearchMovieScreen',
  NotificationsScreen = 'NotificationsScreen',
}

export type RootStackParamsList = {
  HomeScreen: undefined;
  MainScreen: undefined;
  ComingSoonScreen: undefined;
  DiaryScreen: undefined;
  ListMovieScreen: {type: TypeList};
  MovieScreen: undefined;
  SettingsScreen: undefined;
  NotificationsScreen: undefined;
  AddMovieScreen: {movie?: MyMovie} | undefined;
  SearchMovieScreen: {type: TypeList};
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
  vote_average: number;
  release_date: string;
  overview: string;
  poster_path: string | null;
  id: string;
}
export interface RateMovie {
  movie: MyMovie;
  star: number;
  review: string;
  date: string;
}
export enum TypeList {
  POPULAR = 'popular',
  MYLIST = 'myList',
}
export interface DiaryEntry {
  id: string;
  movieId: string;
  title: string;
  year: string;
  posterPath: string;
  rating: number;
  review: string;
  date: Date;
}

export interface DayItem {
  id: string;
  day: string;
  date: number;
  month: number;
  year: number;
  fullDate: Date;
  isSelected: boolean;
}
