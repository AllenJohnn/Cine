import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Plus, Star, Clock, Info, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Movie, getBackdropUrl, getTitle, getReleaseYear, getRuntime, getTrailerKey } from "@/lib/tmdb";
import TrailerModal from "./TrailerModal";

interface HeroBannerProps {
  movie: Movie;
  mediaType?: "movie" | "tv";
  trailers?: Movie[];
  progress?: number;
  onNext?: () => void;
}

export default function HeroBanner({ movie, mediaType = "movie", trailers = [], progress = 0, onNext }: HeroBannerProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const latestScrollYRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const title = getTitle(movie);
  const year = getReleaseYear(movie);
  const runtime = getRuntime(movie);

  useEffect(() => {
    setImageLoaded(false);
  }, [movie.id]);

  useEffect(() => {
    const handleScroll = () => {
      latestScrollYRef.current = window.scrollY;
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          setScrollY(latestScrollYRef.current);
          rafIdRef.current = null;
        });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handlePlayTrailer = (trailerKey?: string) => {
    const key = trailerKey || getTrailerKey(movie);
    if (key) {
      setSelectedTrailer(key);
      setTrailerOpen(true);
    }
  };

  const genres = movie.genres?.slice(0, 3) || [];

  return (
    <>
      <section className="relative min-h-[90vh] flex items-end overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <motion.img
            key={movie.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 1.1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            src={getBackdropUrl(movie.backdrop_path)}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            className="w-full h-full object-cover"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 hero-sheen" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />

          {/* Progress Bar */}
          {progress > 0 && (
            <motion.div 
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-white via-white/70 to-white/40 transition-all duration-100"
              style={{ width: `${progress}%` }}
              initial={false}
            />
          )}
        </div>

        <div className="relative container mx-auto px-4 pb-32 pt-32 lg:w-2/3">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="hero-label"
            >
              Curated Spotlight
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight text-shadow-glow"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white/80 max-w-2xl line-clamp-3 text-lg md:text-xl leading-relaxed font-light"
            >
              {movie.overview}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap items-center gap-4 text-sm"
            >
              {genres.map((genre, index) => (
                <motion.span
                  key={genre.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="badge-gold"
                >
                  {genre.name}
                </motion.span>
              ))}
              {year && (
                <span className="flex items-center gap-2 text-white/60 font-light">
                  {year}
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-2 text-white/60 font-light">
                  <Clock className="h-4 w-4" />
                  {runtime}
                </span>
              )}
              <span className="flex items-center gap-2 text-white/60 font-light">
                <Star className="h-4 w-4 fill-white text-white" />
                {Number.isFinite(movie.vote_average) ? movie.vote_average.toFixed(1) : "N/A"}
              </span>
            </motion.div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => handlePlayTrailer()}
                className="play-button-static group"
              >
                <Play className="h-5 w-5 fill-current mr-2 group-hover:scale-110 transition-transform" />
                Watch Trailer
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-foreground/20 hover:bg-foreground/10"
              >
                <Link to={`/${mediaType}/${movie.id}`}>
                  <Info className="h-5 w-5 mr-2" />
                  More Info
                </Link>
              </Button>
              {onNext && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onNext}
                  className="border-foreground/20 hover:bg-foreground/10 ml-auto"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>

          {/* Trailers Row */}
          {trailers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-12"
            >
              <h3 className="text-lg font-semibold mb-4">Trailers</h3>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                {trailers.slice(0, 4).map((trailer, index) => (
                  <motion.button
                    key={trailer.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handlePlayTrailer(getTrailerKey(trailer) || undefined)}
                    className="relative w-32 md:w-40 shrink-0 aspect-video rounded-xl overflow-hidden group"
                  >
                    <img
                      src={getBackdropUrl(trailer.backdrop_path)}
                      alt={getTitle(trailer)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center group-hover:bg-primary transition-colors">
                        <Play className="h-4 w-4 text-primary-foreground fill-current ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 left-2 text-xs font-bold">
                      0{index + 1}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Animated Play Button - Side */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          onClick={() => handlePlayTrailer()}
          className="absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 hidden lg:flex play-button"
        >
          <Play className="h-7 w-7 text-primary-foreground fill-current ml-1" />
        </motion.button>
      </section>

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerKey={selectedTrailer}
      />
    </>
  );
}
