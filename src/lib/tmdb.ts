export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const getImageUrl = (path: string | null, size: string = "w500") => {
  if (!path) return "/placeholder.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null) => {
  return getImageUrl(path, "original");
};

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  episode_run_time?: number[];
  media_type?: "movie" | "tv";
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
  similar?: {
    results: Movie[];
  };
  watch_providers?: {
    results?: {
      [key: string]: {
        link: string;
        flatrate?: { logo_path: string; provider_id: number; provider_name: string }[];
        rent?: { logo_path: string; provider_id: number; provider_name: string }[];
        buy?: { logo_path: string; provider_id: number; provider_name: string }[];
      };
    };
  };
}

export interface TMDBResponse {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

async function tmdbFetch<T>(params: Record<string, string>): Promise<T> {
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const endpoint = params.endpoint;
  const query = params.query;
  const page = params.page || '1';
  const id = params.id;
  const mediaType = params.media_type || 'movie';
  
  let tmdbUrl = '';
  const baseUrl = 'https://api.themoviedb.org/3';

  switch (endpoint) {
    case 'trending':
      tmdbUrl = `${baseUrl}/trending/${mediaType}/week?api_key=${TMDB_API_KEY}&page=${page}`;
      break;
    case 'popular':
      tmdbUrl = `${baseUrl}/${mediaType}/popular?api_key=${TMDB_API_KEY}&page=${page}`;
      break;
    case 'top_rated':
      tmdbUrl = `${baseUrl}/${mediaType}/top_rated?api_key=${TMDB_API_KEY}&page=${page}`;
      break;
    case 'now_playing':
      tmdbUrl = `${baseUrl}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`;
      break;
    case 'on_the_air':
      tmdbUrl = `${baseUrl}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}`;
      break;
    case 'details':
      tmdbUrl = `${baseUrl}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,similar,watch/providers`;
      break;
    case 'search':
      tmdbUrl = `${baseUrl}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query || '')}&page=${page}`;
      break;
    case 'discover':
      const genre = params.genre || '';
      const year = params.year || '';
      const sortBy = params.sort_by || 'popularity.desc';
      let discoverUrl = `${baseUrl}/discover/${mediaType}?api_key=${TMDB_API_KEY}&page=${page}&sort_by=${sortBy}`;
      if (genre) discoverUrl += `&with_genres=${genre}`;
      if (year) {
        if (mediaType === 'movie') {
          discoverUrl += `&primary_release_year=${year}`;
        } else {
          discoverUrl += `&first_air_date_year=${year}`;
        }
      }
      tmdbUrl = discoverUrl;
      break;
    case 'watch_providers':
      if (!id) throw new Error('ID parameter is required for watch_providers');
      tmdbUrl = `${baseUrl}/${mediaType}/${id}/watch/providers?api_key=${TMDB_API_KEY}`;
      break;
    case 'genres':
      tmdbUrl = `${baseUrl}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}`;
      break;
    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  const response = await fetch(tmdbUrl);
  
  if (!response.ok) {
    throw new Error('Failed to fetch from TMDB');
  }
  
  return response.json();
}

export const tmdb = {
  getTrending: (mediaType: "movie" | "tv" | "all" = "movie", page = 1) =>
    tmdbFetch<TMDBResponse>({ endpoint: "trending", media_type: mediaType, page: String(page) }),

  getPopular: (mediaType: "movie" | "tv" = "movie", page = 1) =>
    tmdbFetch<TMDBResponse>({ endpoint: "popular", media_type: mediaType, page: String(page) }),

  getTopRated: (mediaType: "movie" | "tv" = "movie", page = 1) =>
    tmdbFetch<TMDBResponse>({ endpoint: "top_rated", media_type: mediaType, page: String(page) }),

  getNowPlaying: (page = 1) =>
    tmdbFetch<TMDBResponse>({ endpoint: "now_playing", page: String(page) }),

  getOnTheAir: (page = 1) =>
    tmdbFetch<TMDBResponse>({ endpoint: "on_the_air", page: String(page) }),

  getDetails: (id: number, mediaType: "movie" | "tv" = "movie") =>
    tmdbFetch<Movie>({ endpoint: "details", id: String(id), media_type: mediaType }),

  search: (query: string, page = 1) =>
    tmdbFetch<TMDBResponse>({ endpoint: "search", query, page: String(page) }),

  searchMulti: (query: string, page = 1) =>
    tmdbFetch<TMDBResponse>({ endpoint: "search", query, page: String(page) }),

  discover: (
    mediaType: "movie" | "tv" = "movie",
    options: { genre?: string; year?: string; sortBy?: string; page?: number } = {}
  ) =>
    tmdbFetch<TMDBResponse>({
      endpoint: "discover",
      media_type: mediaType,
      page: String(options.page || 1),
      ...(options.genre && { genre: options.genre }),
      ...(options.year && { year: options.year }),
      ...(options.sortBy && { sort_by: options.sortBy }),
    }),

  getGenres: (mediaType: "movie" | "tv" = "movie") =>
    tmdbFetch<{ genres: Genre[] }>({ endpoint: "genres", media_type: mediaType }),

  getWatchProviders: (id: number, mediaType: "movie" | "tv" = "movie") =>
    tmdbFetch<{ results?: { [key: string]: any } }>({ 
      endpoint: "watch_providers", 
      id: String(id), 
      media_type: mediaType 
    }),
};

export const getTitle = (item: Movie) => item.title || item.name || "Unknown";

export const getReleaseYear = (item: Movie) => {
  const date = item.release_date || item.first_air_date;
  return date ? new Date(date).getFullYear() : null;
};

export const getRuntime = (item: Movie) => {
  if (item.runtime) {
    const hours = Math.floor(item.runtime / 60);
    const minutes = item.runtime % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
  if (item.episode_run_time && item.episode_run_time.length > 0) {
    return `${item.episode_run_time[0]}m per episode`;
  }
  return null;
};

export const getTrailerKey = (item: Movie) => {
  if (!item.videos?.results) return null;
  const trailer = item.videos.results.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );
  return trailer?.key || null;
};
