import {MovieType} from '#/navigator/type';

export const API_KEY = '12f0a7725ac014190a233fab588d3be5';
export const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchTrendingMovies = async (): Promise<MovieType[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`,
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

export const fetchPopularMovies = async (): Promise<MovieType[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

export const fetchMovieDetails = async (movieId: number): Promise<any> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos,similar`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};
export const targetGenres = [12, 10402, 16, 37];
export const searchMovies = async (query: string): Promise<MovieType[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        query,
      )}`,
    );
    const data = await response.json();

    const filteredResults = data.results.filter((movie: MovieType) =>
      movie.genre_ids?.some((genreId: number) =>
        targetGenres.includes(genreId),
      ),
    );

    return filteredResults;
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};
