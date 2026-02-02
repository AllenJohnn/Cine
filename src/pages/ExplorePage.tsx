import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import MovieCard from "@/components/MovieCard";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tmdb, Movie, Genre } from "@/lib/tmdb";

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filters from URL
  const type = (searchParams.get("type") as "movie" | "tv") || "movie";
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") || "";
  const sort = searchParams.get("sort") || "popularity.desc";

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setPage(1);
    setMovies([]);
  };

  const fetchMovies = useCallback(async (pageNum: number, reset = false) => {
    setLoading(true);
    try {
      const data = await tmdb.discover(type, {
        genre,
        year,
        sortBy: sort,
        page: pageNum,
      });
      
      if (reset) {
        setMovies(data.results);
      } else {
        setMovies((prev) => [...prev, ...data.results]);
      }
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
    } finally {
      setLoading(false);
    }
  }, [type, genre, year, sort]);

  useEffect(() => {
    fetchMovies(1, true);
  }, [type, genre, year, sort, fetchMovies]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await tmdb.getGenres(type);
        setGenres(data.genres);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };
    fetchGenres();
  }, [type]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchMovies(nextPage);
            return nextPage;
          });
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
  }, [hasMore, loading, page, fetchMovies]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const sortOptions = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "popularity.asc", label: "Least Popular" },
    { value: "vote_average.desc", label: "Highest Rated" },
    { value: "vote_average.asc", label: "Lowest Rated" },
    { value: "release_date.desc", label: "Newest" },
    { value: "release_date.asc", label: "Oldest" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold font-display tracking-wider"
          >
            Explore {type === "tv" ? "TV Shows" : "Movies"}
          </motion.h1>
          <Button
            variant="outline"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-4 mb-8 ${filtersOpen ? "block" : "hidden md:block"}`}
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Type Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-border">
              <Button
                variant={type === "movie" ? "default" : "ghost"}
                onClick={() => updateFilter("type", "movie")}
                className="rounded-none"
              >
                Movies
              </Button>
              <Button
                variant={type === "tv" ? "default" : "ghost"}
                onClick={() => updateFilter("type", "tv")}
                className="rounded-none"
              >
                TV Shows
              </Button>
            </div>

            {/* Genre */}
            <Select value={genre || "all"} onValueChange={(v) => updateFilter("genre", v === "all" ? "" : v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year */}
            <Select value={year || "all"} onValueChange={(v) => updateFilter("year", v === "all" ? "" : v)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Any Year" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="all">Any Year</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sort} onValueChange={(v) => updateFilter("sort", v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(genre || year || sort !== "popularity.desc") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchParams({ type });
                }}
                className="gap-1 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies
            .filter((movie) => movie.id && movie.poster_path) // Filter out invalid movies
            .map((movie, index) => (
              <MovieCard key={`${movie.id}-${index}`} movie={movie} mediaType={type} index={index} />
            ))}
          
          {/* Loading skeletons */}
          {loading &&
            Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={`skeleton-${i}`} />
            ))}
        </div>

        {/* Infinite scroll trigger */}
        {hasMore && <div ref={observerTarget} className="h-20" />}

        {/* No Results */}
        {!loading && movies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-2xl font-semibold mb-2">No results found</p>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
