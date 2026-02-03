import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import HeroBanner from "@/components/HeroBanner";
import HeroBannerSkeleton from "@/components/HeroBannerSkeleton";
import MovieSlider from "@/components/MovieSlider";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { tmdb, Movie } from "@/lib/tmdb";

// Filter out animes and non-English content
const filterContent = (movies: Movie[]) => {
  return movies.filter((m: Movie) => {
    const genres = m.genres?.map((g) => g.name) || [];
    const genreIds = m.genre_ids || [];
    // Exclude anime genre (id: 16)
    if (genreIds.includes(16)) return false;
    if (genres.includes("Animation") && !genres.includes("Comedy") && !genres.includes("Family")) return false;
    return true;
  });
};

// Filter for famous movies only (high popularity + good rating)
const filterFamousMovies = (movies: Movie[]) => {
  return filterContent(movies)
    .filter((m: Movie) => m.popularity && m.popularity > 50)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
};

export default function Index() {
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [popularTv, setPopularTv] = useState<Movie[]>([]);
  const [trendingTv, setTrendingTv] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [tmdbError, setTmdbError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Starting data fetch...");
        console.log("Environment:", {
          apiBase: import.meta.env.VITE_TMDB_API_BASE,
          hasKey: Boolean(import.meta.env.VITE_TMDB_API_KEY),
          userAgent: navigator.userAgent
        });
        
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn("Data fetch timeout - setting loading to false");
          setLoading(false);
        }, 20000); // Increased to 20 seconds

        let trendingData, popularData, topRatedData, tvPopularData, tvTrendingData;

        // Fetch with individual error handling to prevent total failure
        try {
          trendingData = await tmdb.getTrending("movie");
        } catch (e) {
          console.error("Trending fetch failed:", e);
          trendingData = { results: [] };
        }

        try {
          popularData = await tmdb.getPopular("movie");
        } catch (e) {
          console.error("Popular fetch failed:", e);
          popularData = { results: [] };
        }

        try {
          topRatedData = await tmdb.getTopRated("movie");
        } catch (e) {
          console.error("Top rated fetch failed:", e);
          topRatedData = { results: [] };
        }

        try {
          tvPopularData = await tmdb.getPopular("tv");
        } catch (e) {
          console.error("TV popular fetch failed:", e);
          tvPopularData = { results: [] };
        }

        try {
          tvTrendingData = await tmdb.getTrending("tv");
        } catch (e) {
          console.error("TV trending fetch failed:", e);
          tvTrendingData = { results: [] };
        }

        console.log("API calls completed, setting data...");

        // Use trending as fallback if popular is empty
        const trendingResults = trendingData?.results || [];
        const popularResults = popularData?.results || [];
        const allMovies = [...trendingResults, ...popularResults];
        
        if (allMovies.length === 0) {
          console.warn("No movies found, showing fallback UI");
          setTmdbError(true);
          clearTimeout(timeoutId);
          setLoading(false);
          return;
        }

        const uniqueMovies = Array.from(
          new Map(allMovies.map((m) => [m.id, m])).values()
        ).sort((a, b) => {
          const ratingDiff = b.vote_average - a.vote_average;
          return ratingDiff !== 0 ? ratingDiff : (b.popularity || 0) - (a.popularity || 0);
        });

        const filteredMovies = filterFamousMovies(uniqueMovies);
        const topMovies = filteredMovies
          .filter((m: Movie) => m.vote_average >= 7.5 && m.backdrop_path && (m.popularity || 0) > 50)
          .slice(0, 5);

        const featured = topMovies[0] || trendingResults[0];
        const heroMoviesList = topMovies.length > 0 ? topMovies.slice(0, 5) : trendingResults.slice(0, 5);

        if (featured) {
          setFeaturedMovie(featured);
          setHeroMovies(heroMoviesList);
        }

        console.log("Setting movies data...");
        setTrendingMovies(filterContent(trendingResults));
        setPopularMovies(filterContent(popularResults));
        setTopRatedMovies(filterContent(topRatedData?.results || []));
        setPopularTv(filterContent(tvPopularData?.results || []));
        setTrendingTv(filterContent(tvTrendingData?.results || []));
        
        clearTimeout(timeoutId);
        console.log("Data fetch complete");
      } catch (error) {
        console.error("Unexpected error during fetch:", error);
        setTmdbError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (heroMovies.length > 1) {
      setProgress(0);
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setCurrentMovieIndex((prevIdx) => (prevIdx + 1) % heroMovies.length);
            return 0;
          }
          return prev + 1; // Increment by 1 every 70ms (70ms * 100 = 7000ms)
        });
      }, 70);

      return () => clearInterval(progressInterval);
    }
  }, [heroMovies.length]);

  const handleNextMovie = () => {
    setProgress(0);
    setCurrentMovieIndex((prev) => (prev + 1) % heroMovies.length);
  };

  useEffect(() => {
    if (heroMovies[currentMovieIndex]) {
      setFeaturedMovie(heroMovies[currentMovieIndex]);
    }
  }, [currentMovieIndex, heroMovies]);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Home"
        description="Discover trending movies and TV shows with a premium cinema experience."
      />
      <Navbar />

      {loading && <HeroBannerSkeleton />}

      {!loading && featuredMovie && (
        <>
          {/* Hero */}
          <HeroBanner
            movie={featuredMovie}
            mediaType="movie"
            trailers={trendingMovies.slice(1, 5)}
            progress={progress}
            onNext={handleNextMovie}
          />

          {/* Main Content */}
          <main className="w-full bg-gradient-to-b from-background/50 to-background">
            <div className="max-w-full px-0 sm:px-4 md:px-8 py-12 space-y-16">
              {/* Trending Section */}
              {trendingMovies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="px-4 sm:px-0"
                >
                  <MovieSlider
                    title="Trending Now"
                    movies={trendingMovies}
                    mediaType="movie"
                    loading={loading}
                  />
                </motion.div>
              )}

              {/* Popular Section */}
              {popularMovies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="px-4 sm:px-0"
                >
                  <MovieSlider
                    title="Popular on CineView"
                    movies={popularMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))}
                    mediaType="movie"
                    loading={loading}
                  />
                </motion.div>
              )}

              {/* Top Rated Movies */}
              {topRatedMovies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="px-4 sm:px-0"
                >
                  <MovieSlider
                    title="Top Rated Movies"
                    movies={topRatedMovies}
                    mediaType="movie"
                    loading={loading}
                  />
                </motion.div>
              )}

              {/* Trending TV */}
              {trendingTv.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="px-4 sm:px-0"
                >
                  <MovieSlider
                    title="Trending TV Shows"
                    movies={trendingTv}
                    mediaType="tv"
                    loading={loading}
                  />
                </motion.div>
              )}

              {/* Popular TV */}
              {popularTv.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="px-4 sm:px-0"
                >
                  <MovieSlider
                    title="Popular TV Shows"
                    movies={popularTv}
                    mediaType="tv"
                    loading={loading}
                  />
                </motion.div>
              )}
            </div>
          </main>

          <Footer />
        </>
      )}

      {!loading && !featuredMovie && (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4 p-4">
            <h2 className="text-2xl font-bold text-white">Unable to Load Content</h2>
            <p className="text-white/70">
              {tmdbError
                ? "TMDB is unreachable from this network. Please check your connection or try a VPN."
                : "Please check your internet connection or try again."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
