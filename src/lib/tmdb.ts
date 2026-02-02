export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const TMDB_CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const tmdbCache = new Map<string, { expiresAt: number; data: unknown }>();

// Helper to get base URL with optional proxy
const getTMDBBaseURL = () => {
  const apiBase = import.meta.env.VITE_TMDB_API_BASE;
  if (apiBase) return apiBase.replace(/\/$/, "");
  const proxy = import.meta.env.VITE_CORS_PROXY;
  const baseUrl = "https://api.themoviedb.org/3";
  return proxy ? `${proxy}${baseUrl}` : baseUrl;
};

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

export interface WatchProvidersResponse {
  results?: Record<string, {
    link: string;
    flatrate?: { logo_path: string; provider_id: number; provider_name: string }[];
    rent?: { logo_path: string; provider_id: number; provider_name: string }[];
    buy?: { logo_path: string; provider_id: number; provider_name: string }[];
  }>;
}

// Timeout wrapper for fetch
async function fetchWithTimeout(url: string, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Retry logic with exponential backoff
async function fetchWithRetry(url: string, retries = 3, timeout = 10000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, timeout);
      return response;
    } catch (error) {
      const isLastAttempt = i === retries - 1;
      if (isLastAttempt) {
        throw error;
      }
      // Exponential backoff: wait 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

async function tmdbFetch<T>(params: Record<string, string>): Promise<T> {
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const hasProxy = Boolean(import.meta.env.VITE_TMDB_API_BASE);
  const endpoint = params.endpoint;
  const query = params.query;
  const page = params.page || '1';
  const id = params.id;
  const mediaType = params.media_type || 'movie';

  if (!TMDB_API_KEY && !hasProxy) {
    throw new Error('TMDB API key is missing. Set VITE_TMDB_API_KEY in your environment.');
  }
  
  let tmdbUrl = '';
  const baseUrl = getTMDBBaseURL();
  const apiKeyQuery = hasProxy ? '' : `api_key=${TMDB_API_KEY}`;
  const joinQuery = (path: string, extraQuery: string) => {
    const queryString = [apiKeyQuery, extraQuery].filter(Boolean).join('&');
    return queryString ? `${baseUrl}${path}?${queryString}` : `${baseUrl}${path}`;
  };

  switch (endpoint) {
    case 'trending':
      tmdbUrl = joinQuery(`/trending/${mediaType}/week`, `page=${page}`);
      break;
    case 'popular':
      tmdbUrl = joinQuery(`/${mediaType}/popular`, `page=${page}`);
      break;
    case 'top_rated':
      tmdbUrl = joinQuery(`/${mediaType}/top_rated`, `page=${page}`);
      break;
    case 'now_playing':
      tmdbUrl = joinQuery(`/movie/now_playing`, `page=${page}`);
      break;
    case 'on_the_air':
      tmdbUrl = joinQuery(`/tv/on_the_air`, `page=${page}`);
      break;
    case 'details':
      tmdbUrl = joinQuery(`/${mediaType}/${id}`, `append_to_response=videos,credits,similar,watch_providers`);
      break;
    case 'search':
      tmdbUrl = joinQuery(`/search/multi`, `query=${encodeURIComponent(query || '')}&page=${page}`);
      break;
    case 'discover': {
      const genre = params.genre || '';
      const year = params.year || '';
      const sortBy = params.sort_by || 'popularity.desc';
      let discoverUrl = joinQuery(`/discover/${mediaType}`, `page=${page}&sort_by=${sortBy}`);
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
    }
    case 'watch_providers':
      if (!id) throw new Error('ID parameter is required for watch_providers');
      tmdbUrl = joinQuery(`/${mediaType}/${id}/watch/providers`, ``);
      break;
    case 'genres':
      tmdbUrl = joinQuery(`/genre/${mediaType}/list`, ``);
      break;
    case 'person_details':
      if (!id) throw new Error('ID parameter is required for person_details');
      tmdbUrl = joinQuery(`/person/${id}`, ``);
      break;
    case 'person_credits':
      if (!id) throw new Error('ID parameter is required for person_credits');
      tmdbUrl = joinQuery(`/person/${id}/combined_credits`, ``);
      break;
    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  try {
    const cached = tmdbCache.get(tmdbUrl);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    const response = await fetchWithRetry(tmdbUrl, 3, 10000);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();

    if (
      data &&
      typeof data === 'object' &&
      'status_code' in data &&
      'status_message' in data
    ) {
      const message = String((data as { status_message?: string }).status_message || 'Unknown TMDB error');
      throw new Error(message);
    }

    tmdbCache.set(tmdbUrl, { expiresAt: Date.now() + TMDB_CACHE_TTL, data });
    return data as T;
  } catch (error) {
    // Log for debugging
    console.error('TMDB API error:', error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('TMDB API request timed out. Please check your internet connection.');
      }
      throw new Error(`TMDB API request failed: ${error.message}`);
    }
    throw error;
  }
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
    tmdbFetch<WatchProvidersResponse>({ 
      endpoint: "watch_providers", 
      id: String(id), 
      media_type: mediaType 
    }),

  getPersonDetails: (id: number) =>
    tmdbFetch<Record<string, unknown>>({ endpoint: "person_details", id: String(id) }),

  getPersonCredits: (id: number) =>
    tmdbFetch<Record<string, unknown>>({ endpoint: "person_credits", id: String(id) }),
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
