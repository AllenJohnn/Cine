import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import MovieCard from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { tmdb, Movie } from "@/lib/tmdb";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await tmdb.search(query, 1);
        const filtered = data.results.filter(
          (r) => r.media_type === "movie" || r.media_type === "tv"
        );
        setResults(filtered);
        setHasMore(data.page < data.total_pages);
        setPage(1);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  const loadMore = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await tmdb.search(query, nextPage);
      const filtered = data.results.filter(
        (r) => r.media_type === "movie" || r.media_type === "tv"
      );
      setResults((prev) => [...prev, ...filtered]);
      setHasMore(data.page < data.total_pages);
      setPage(nextPage);
    } catch (error) {
      console.error("Load more failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search movies and TV shows..."
              className="pl-12 h-14 text-lg bg-muted border-border"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              Search
            </Button>
          </div>
        </motion.form>

        {/* Results */}
        {query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-xl font-semibold mb-6">
              {loading && results.length === 0
                ? "Searching..."
                : `Results for "${query}"`}
            </h2>

            {results.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.map((item, index) => (
                    <MovieCard
                      key={`${item.id}-${item.media_type}`}
                      movie={item}
                      mediaType={item.media_type}
                      index={index}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-12">
                    <Button type="button" size="lg" onClick={loadMore} disabled={loading}>
                      {loading ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            ) : !loading ? (
              <div className="text-center py-24">
                <p className="text-2xl font-semibold mb-2">No results found</p>
                <p className="text-muted-foreground mb-6">
                  Try searching with different keywords
                </p>
                <Button variant="outline" asChild>
                  <Link to="/explore">Browse All</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-full">
                    <div className="aspect-[2/3] bg-muted rounded-xl skeleton-shimmer" />
                    <div className="mt-3 space-y-2">
                      <div className="h-4 bg-muted rounded skeleton-shimmer" />
                      <div className="h-3 w-20 bg-muted rounded skeleton-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Empty state */}
        {!query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <SearchIcon className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <p className="text-2xl font-semibold mb-2">Search for movies & TV shows</p>
            <p className="text-muted-foreground">
              Find your favorite content from our extensive library
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
