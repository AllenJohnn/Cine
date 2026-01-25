import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY not configured');
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    const query = url.searchParams.get('query');
    const page = url.searchParams.get('page') || '1';
    const id = url.searchParams.get('id');
    const mediaType = url.searchParams.get('media_type') || 'movie';

    if (!endpoint) {
      throw new Error('Endpoint parameter is required');
    }

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
        if (!id) throw new Error('ID parameter is required for details');
        tmdbUrl = `${baseUrl}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,similar`;
        break;
      case 'search':
        if (!query) throw new Error('Query parameter is required for search');
        tmdbUrl = `${baseUrl}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
        break;
      case 'discover':
        const genre = url.searchParams.get('genre') || '';
        const year = url.searchParams.get('year') || '';
        const sortBy = url.searchParams.get('sort_by') || 'popularity.desc';
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
      case 'genres':
        tmdbUrl = `${baseUrl}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}`;
        break;
      default:
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    const response = await fetch(tmdbUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('TMDB API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
