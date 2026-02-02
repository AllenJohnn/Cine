import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import MovieCard from "@/components/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { tmdb, Movie } from "@/lib/tmdb";

const genreNames: Record<string, string> = {
  "28": "Action",
  "12": "Adventure",
  "16": "Animation",
  "35": "Comedy",
  "80": "Crime",
  "99": "Documentary",
  "18": "Drama",
  "10751": "Family",
  "14": "Fantasy",
  "36": "History",
  "27": "Horror",
  "10402": "Music",
  "9648": "Mystery",
  "10749": "Romance",
  "878": "Science Fiction",
  "10770": "TV Movie",
  "53": "Thriller",
  "10752": "War",
  "37": "Western",
};

export default function GenrePage() {
  const { id } = useParams<{ id: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const genreName = id ? genreNames[id] || "Movies" : "Movies";

  const fetchMovies = useCallback(async (pageNum: number) => {
    if (!id) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await tmdb.discover("movie", {
        genre: id,
        page: pageNum,
        sortBy: "popularity.desc",
      });
      
      if (pageNum === 1) {
        setMovies(data.results);
      } else {
        setMovies((prev) => [...prev, ...data.results]);
      }
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to fetch movies.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    fetchMovies(1);
  }, [id, fetchMovies]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchMovies(page);
    }
  }, [page, fetchMovies]);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${genreName} Movies`}
        description={`Discover the best ${genreName.toLowerCase()} movies.`}
      />
      <Navbar />

      <section className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{genreName} Movies</h1>
          <p className="text-muted-foreground">Discover the best {genreName.toLowerCase()} movies</p>
        </motion.div>

        {errorMessage && !loading ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-destructive mb-8">
            <p className="font-semibold">Genre error</p>
            <p className="text-sm text-destructive/90 mb-4">{errorMessage}</p>
            <Button type="button" variant="outline" onClick={() => fetchMovies(1)}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} mediaType="movie" />
            ))}
            
            {loading &&
              Array.from({ length: 12 }).map((_, i) => (
                <MovieCardSkeleton key={`skeleton-${i}`} />
              ))}
          </div>
        )}

        {hasMore && <div ref={observerTarget} className="h-20" />}

        {!loading && movies.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No movies found in this genre
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
