import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { tmdb, Movie } from "@/lib/tmdb";
import { Input } from "@/components/ui/input";
import { SecureStorage } from "@/lib/security";

const secureStorage = new SecureStorage('cineview');

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: "movie" | "tv" | "person";
}

interface AdvancedSearchProps {
  onClose?: () => void;
}

export default function AdvancedSearch({ onClose }: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();

  useEffect(() => {
    const history = secureStorage.getItem<string[]>("searchHistory") || [];
    setSearchHistory(history.slice(0, 5));
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await tmdb.searchMulti(query, 1);
        setSuggestions(results.results.slice(0, 5));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to history
    const history = secureStorage.getItem<string[]>("searchHistory") || [];
    const newHistory = [searchQuery, ...history.filter((h) => h !== searchQuery)].slice(0, 10);
    secureStorage.setItem("searchHistory", newHistory);

    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    onClose?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  const clearHistory = () => {
    secureStorage.removeItem("searchHistory");
    setSearchHistory([]);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
        <Input
          type="text"
          placeholder="Search movies, TV shows, people..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          className="w-full pl-12 pr-12 py-6 text-base bg-white/10 border-white/20 rounded-full focus:bg-white/15 focus:border-white/30"
          autoFocus
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-white/60" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && (query.length > 0 || searchHistory.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
          >
            {/* Search Suggestions */}
            {query.length >= 2 && (
              <div className="p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs text-white/40 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" />
                      Suggestions
                    </div>
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const type = item.media_type === "person" ? "person" : item.media_type || "movie";
                          navigate(`/${type}/${item.id}`);
                          onClose?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg transition-colors text-left group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-white/5 shrink-0">
                          {item.poster_path || item.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                              <Search className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium group-hover:text-white transition-colors line-clamp-1">
                            {item.title || item.name}
                          </div>
                          <div className="text-sm text-white/40 line-clamp-1">
                            {item.media_type === "person"
                              ? "Person"
                              : `${item.media_type === "tv" ? "TV Show" : "Movie"} • ${
                                  item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || "N/A"
                                }`}
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-white/40 text-sm">No results found</div>
                )}
              </div>
            )}

            {/* Search History */}
            {query.length === 0 && searchHistory.length > 0 && (
              <div className="p-2 border-t border-white/10">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-white/40 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg transition-colors text-left group"
                  >
                    <Clock className="h-4 w-4 text-white/30" />
                    <span className="flex-1 group-hover:text-white transition-colors">{term}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
