import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X, Film, Tv, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tmdb, Movie, getImageUrl, getTitle, getReleaseYear } from "@/lib/tmdb";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/explore?type=movie", icon: Film },
  { label: "TV Shows", href: "/explore?type=tv", icon: Tv },
  { label: "Collections", href: "/collections", icon: Sparkles },
  { label: "Explore", href: "/explore", icon: Compass },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const searchMovies = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const data = await tmdb.searchMulti(searchQuery.trim());
        if (!controller.signal.aborted) {
          setSearchResults(data.results.slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Search error:", error);
        }
      }
    };

    const debounce = setTimeout(searchMovies, 300);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleResultClick = (movie: Movie) => {
    const mediaType = movie.media_type || (movie.title ? "movie" : "tv");
    navigate(`/${mediaType}/${movie.id}`);
    setShowSearch(false);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          : "bg-gradient-to-b from-black/70 via-black/30 to-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="brand-logo"
          >
            <span className="text-white">CINE</span>
            <span className="text-gradient">VIEW</span>
          </motion.div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`nav-link ${
                location.pathname === link.href.split("?")[0]
                  ? "nav-link-active"
                  : "nav-link-inactive"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <AnimatePresence>
            {showSearch ? (
              <motion.div
                ref={searchRef}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="relative"
              >
                <form onSubmit={handleSearch}>
                  <Input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search movies, TV shows..."
                    className="pr-8 bg-muted border-border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>

                {/* Search Suggestions */}
                {showSuggestions && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl overflow-hidden z-50"
                  >
                    {searchResults.map((result) => {
                      const title = getTitle(result);
                      const year = getReleaseYear(result);
                      const mediaType = result.media_type || (result.title ? "movie" : "tv");
                      
                      return (
                        <button
                          key={`${mediaType}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-0"
                        >
                          <img
                            src={getImageUrl(result.poster_path, "w92")}
                            alt={title}
                            className="w-10 h-14 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{mediaType}</span>
                              {year && <span>• {year}</span>}
                              {result.vote_average > 0 && (
                                <span className="flex items-center gap-1">
                                  • <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                  {result.vote_average.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                        setShowSearch(false);
                        setSearchQuery("");
                        setShowSuggestions(false);
                      }}
                      className="w-full p-3 text-center text-sm text-primary hover:bg-muted/50 transition-colors font-medium"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}          </AnimatePresence>

          {/* Mobile Menu Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-lg border-b border-border"
          >
            <div className="container px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                >
                  {link.icon && <link.icon className="h-5 w-5 text-muted-foreground" />}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
