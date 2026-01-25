import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Filter, Film, Tv, Clock, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getImageUrl } from "@/lib/tmdb";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface WatchlistItem {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  created_at: string;
}

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "movie" | "tv">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWatchlist = async () => {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: sort === "oldest" });

      if (data) {
        setItems(data as WatchlistItem[]);
      }
      setLoading(false);
    };

    fetchWatchlist();
  }, [user, sort]);

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("watchlist").delete().eq("id", id);

    if (!error) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Removed from watchlist");
    } else {
      toast.error("Failed to remove item");
    }
  };

  const filteredItems = items.filter((item) =>
    filter === "all" ? true : item.media_type === filter
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center py-24"
          >
            <Film className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-4">Sign in to view your watchlist</h1>
            <p className="text-muted-foreground mb-8">
              Keep track of movies and TV shows you want to watch
            </p>
            <Button asChild size="lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold font-display tracking-wider"
          >
            My Watchlist
          </motion.h1>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="movie">Movies</SelectItem>
                  <SelectItem value="tv">TV Shows</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-full">
                <div className="aspect-[2/3] bg-muted rounded-xl skeleton-shimmer" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-muted rounded skeleton-shimmer" />
                  <div className="h-3 w-20 bg-muted rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Film className="h-20 w-20 mx-auto mb-6 text-muted-foreground" />
            </motion.div>
            <h2 className="text-2xl font-semibold mb-2">Your watchlist is empty</h2>
            <p className="text-muted-foreground mb-8">
              Start adding movies and TV shows to keep track of what you want to watch
            </p>
            <Button asChild size="lg">
              <Link to="/explore">Explore Content</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  className="group"
                >
                  <Link
                    to={`/${item.media_type}/${item.tmdb_id}`}
                    className="block"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted movie-card">
                      <img
                        src={getImageUrl(item.poster_path)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Badge */}
                      <span className="absolute top-2 left-2 badge-gold text-xs">
                        {item.media_type === "tv" ? "TV" : "Movie"}
                      </span>

                      {/* Remove button */}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          removeItem(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Link>

                  <div className="mt-3">
                    <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Added {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
