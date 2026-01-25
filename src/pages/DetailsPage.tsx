import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Heart, Plus, Share2, Star, Clock, Calendar, ArrowLeft, Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import MovieSlider from "@/components/MovieSlider";
import TrailerModal from "@/components/TrailerModal";
import ReviewSection from "@/components/ReviewSection";
import WatchProviders from "@/components/WatchProviders";
import AnimatedCounter from "@/components/AnimatedCounter";
import { tmdb, Movie, getBackdropUrl, getImageUrl, getTitle, getReleaseYear, getRuntime, getTrailerKey } from "@/lib/tmdb";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function DetailsPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const mediaType = type as "movie" | "tv";
  const movieId = parseInt(id || "0");

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareNote, setShareNote] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await tmdb.getDetails(movieId, mediaType);
        setMovie(data);

        // Fetch likes count
        const { count } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("tmdb_id", movieId)
          .eq("media_type", mediaType);
        
        setLikesCount(count || 0);

        if (user) {
          // Check if user has liked
          const { data: likeData } = await supabase
            .from("likes")
            .select("id")
            .eq("user_id", user.id)
            .eq("tmdb_id", movieId)
            .eq("media_type", mediaType)
            .maybeSingle();
          
          setIsLiked(!!likeData);

          // Check if in watchlist
          const { data: watchlistData } = await supabase
            .from("watchlist")
            .select("id")
            .eq("user_id", user.id)
            .eq("tmdb_id", movieId)
            .eq("media_type", mediaType)
            .maybeSingle();
          
          setIsInWatchlist(!!watchlistData);
        }
      } catch (error) {
        console.error("Failed to fetch details:", error);
        toast.error("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchDetails();
    }
  }, [movieId, mediaType, user]);

  // Realtime likes subscription
  useEffect(() => {
    const channel = supabase
      .channel(`likes_${movieId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
          filter: `tmdb_id=eq.${movieId}`,
        },
        async () => {
          const { count } = await supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("tmdb_id", movieId)
            .eq("media_type", mediaType);
          setLikesCount(count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [movieId, mediaType]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like");
      return;
    }

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("tmdb_id", movieId)
        .eq("media_type", mediaType);
      setIsLiked(false);
      setLikesCount((c) => c - 1);
    } else {
      await supabase.from("likes").insert({
        user_id: user.id,
        tmdb_id: movieId,
        media_type: mediaType,
      });
      setIsLiked(true);
      setLikesCount((c) => c + 1);
      toast.success("Added to your likes!");
    }
  };

  const handleWatchlist = async () => {
    if (!user) {
      toast.error("Please sign in to add to watchlist");
      return;
    }

    if (!movie) return;

    if (isInWatchlist) {
      await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("tmdb_id", movieId)
        .eq("media_type", mediaType);
      setIsInWatchlist(false);
      toast.success("Removed from watchlist");
    } else {
      await supabase.from("watchlist").insert({
        user_id: user.id,
        tmdb_id: movieId,
        media_type: mediaType,
        title: getTitle(movie),
        poster_path: movie.poster_path,
      });
      setIsInWatchlist(true);
      toast.success("Added to watchlist!");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: movie ? getTitle(movie) : "Movie",
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const title = getTitle(movie);
  const year = getReleaseYear(movie);
  const runtime = getRuntime(movie);
  const trailerKey = getTrailerKey(movie);
  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const similar = movie.similar?.results?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Backdrop */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            src={getBackdropUrl(movie.backdrop_path)}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        {/* Back button */}
        <div className="absolute top-20 left-4">
          <Button variant="ghost" size="icon" asChild className="bg-background/30 backdrop-blur-sm">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 -mt-64 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img
              src={getImageUrl(movie.poster_path, "w500")}
              alt={title}
              className="w-full rounded-2xl shadow-2xl"
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-wider">
                {title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {movie.genres?.map((genre) => (
                  <span key={genre.id} className="badge-gold">
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-foreground font-semibold">
                    <AnimatedCounter to={movie.vote_average} decimals={1} />
                  </span>
                  / 10
                </span>
                {year && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {year}
                  </span>
                )}
                {runtime && (
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {runtime}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  {likesCount} likes
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
              {movie.overview}
            </p>

            {/* Watch Providers */}
            <WatchProviders movieId={movieId} mediaType={mediaType} />

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              {trailerKey && (
                <Button size="lg" onClick={() => setTrailerOpen(true)} className="gap-2">
                  <Play className="h-5 w-5 fill-current" />
                  Watch Trailer
                </Button>
              )}
              <Button
                size="lg"
                variant={isLiked ? "default" : "outline"}
                onClick={handleLike}
                className={`gap-2 ${isLiked ? "bg-red-600 hover:bg-red-700" : ""}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Liked" : "Like"}
              </Button>
              <Button
                size="lg"
                variant={isInWatchlist ? "default" : "outline"}
                onClick={handleWatchlist}
                className="gap-2"
              >
                {isInWatchlist ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="h-5 w-5" />
                Share
              </Button>
            </div>

            {/* Cast */}
            {cast.length > 0 && (
              <div className="pt-8">
                <h3 className="text-xl font-bold mb-4">Cast</h3>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {cast.map((actor) => (
                    <motion.div
                      key={actor.id}
                      whileHover={{ scale: 1.05 }}
                      className="shrink-0 w-24 text-center cursor-pointer"
                      onClick={() => navigate(`/person/${actor.id}`)}
                    >
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-muted ring-2 ring-transparent hover:ring-primary transition-all">
                        <img
                          src={getImageUrl(actor.profile_path, "w185")}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <p className="mt-2 text-sm font-medium line-clamp-1 hover:text-primary transition-colors">{actor.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{actor.character}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <ReviewSection tmdbId={movieId} mediaType={mediaType} />
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-16">
            <MovieSlider title="Similar" movies={similar} mediaType={mediaType} />
          </div>
        )}
      </section>

      {/* Footer space */}
      <div className="h-24" />

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerKey={trailerKey}
      />
    </div>
  );
}
