export const getPosterUrl = (url: string) => {
  if (url) {
    if (url.startsWith('http') || url.startsWith('file')) {
      return url;
    }
    return `https://image.tmdb.org/t/p/w500${url}`;
  } else {
    return '';
  }
};
