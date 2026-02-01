import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import HeroBanner from "@/components/HeroBanner";
import HeroBannerSkeleton from "@/components/HeroBannerSkeleton";
import MovieSlider from "@/components/MovieSlider";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { tmdb, Movie } from "@/lib/tmdb";
import { supabase } from "@/integrations/supabase/client";

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
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Starting data fetch...");
        
        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn("Data fetch timeout - setting loading to false");
          setLoading(false);
        }, 15000);

        const [trending, popular, topRated, tvPopular, tvTrending] = await Promise.all([
          tmdb.getTrending("movie"),
          tmdb.getPopular("movie"),
          tmdb.getTopRated("movie"),
          tmdb.getPopular("tv"),
          tmdb.getTrending("tv"),
        ]);

        console.log("API calls successful, fetching featured data...");

        const { data: featuredData } = await supabase
          .from("featured_movie")
          .select("*")
          .maybeSingle();

        // Combine and sort by popularity + rating
        const allMovies = [...trending.results, ...popular.results];
        const uniqueMovies = Array.from(
          new Map(allMovies.map((m) => [m.id, m])).values()
        ).sort((a, b) => {
          // Prioritize by vote_average (rating) first, then popularity
          const ratingDiff = b.vote_average - a.vote_average;
          return ratingDiff !== 0 ? ratingDiff : (b.popularity || 0) - (a.popularity || 0);
        });

        const filteredMovies = filterFamousMovies(uniqueMovies);
        const topMovies = filteredMovies
          .filter((m: Movie) => m.vote_average >= 7.5 && m.backdrop_path && (m.popularity || 0) > 50)
          .slice(0, 5);

        if (featuredData) {
          const featured = await tmdb.getDetails(
            featuredData.tmdb_id,
            featuredData.media_type as "movie" | "tv"
          );
          setHeroMovies([featured, ...topMovies.slice(0, 4)]);
          setFeaturedMovie(featured);
        } else {
          // If we don't have a featured movie, just use the first top movie
          if (topMovies.length > 0) {
            setFeaturedMovie(topMovies[0]);
            setHeroMovies(topMovies.slice(0, 5));
          } else {
            // Fallback: use first trending movie
            const firstMovie = trending.results[0];
            if (firstMovie) {
              setFeaturedMovie(firstMovie);
              setHeroMovies([firstMovie, ...trending.results.slice(1, 5)]);
            }
          }
        }

        console.log("Setting movies...");
        setTrendingMovies(filterContent(trending.results));
        setPopularMovies(filterContent(popular.results));
        setTopRatedMovies(filterContent(topRated.results));
        setPopularTv(filterContent(tvPopular.results));
        setTrendingTv(filterContent(tvTrending.results));
        
        clearTimeout(timeoutId);
        console.log("Data fetch complete");
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Set default movies from error state
        setLoading(false);
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
          <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Left - Main Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <MovieSlider
              title="Popular Now"
              movies={popularMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))}
              mediaType="movie"
              viewMoreLink="/explore?type=movie&sort=popular"
              loading={loading}
            />

            <MovieSlider
              title="Trending This Week"
              movies={trendingMovies}
              mediaType="movie"
              viewMoreLink="/explore?type=movie&sort=trending"
              loading={loading}
            />

            <MovieSlider
              title="Top Rated Movies"
              movies={topRatedMovies}
              mediaType="movie"
              viewMoreLink="/explore?type=movie&sort=top_rated"
              loading={loading}
            />

            <MovieSlider
              title="Trending TV Shows"
              movies={trendingTv}
              mediaType="tv"
              viewMoreLink="/explore?type=tv&sort=trending"
              loading={loading}
            />

            <MovieSlider
              title="Popular TV Shows"
              movies={popularTv}
              mediaType="tv"
              viewMoreLink="/explore?type=tv&sort=popular"
              loading={loading}
            />
          </motion.div>

          {/* Right - Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Sidebar
                trendingMovies={trendingMovies}
                topTvShows={trendingTv}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </main>
        </>
      )}

      {!loading && !featuredMovie && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Unable to Load Content</h2>
            <p className="text-white/60">Please refresh the page to try again</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
