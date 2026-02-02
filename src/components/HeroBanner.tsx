import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Movie, getBackdropUrl, getTitle, getReleaseYear, getTrailerKey } from "@/lib/tmdb";
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
  const title = getTitle(movie);
  const year = getReleaseYear(movie);

  useEffect(() => {
    setImageLoaded(false);
  }, [movie.id]);

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
      <section className="relative w-full h-[80vh] md:h-[85vh] lg:h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Smooth Fade */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={movie.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={getBackdropUrl(movie.backdrop_path)}
              alt={title}
              onLoad={() => setImageLoaded(true)}
              className="w-full h-full object-cover object-center"
            />
            {/* Vignette and Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
            
            {/* Progress Bar */}
            {progress > 0 && (
              <motion.div 
                className="absolute top-0 left-0 h-0.5 bg-red-600"
                style={{ width: `${progress}%` }}
                initial={false}
                transition={{ duration: 0.1 }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 w-full px-4 md:px-8 lg:px-16 max-w-screen-2xl mx-auto">
          <div className="max-w-2xl space-y-4 md:space-y-6">
            {/* Netflix-style Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="h-8 w-1 bg-red-600" />
              <span className="text-xs md:text-sm font-semibold tracking-widest uppercase text-white/90">
                Featured
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight drop-shadow-2xl"
            >
              {title}
            </motion.h1>

            {/* Meta Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 text-sm md:text-base"
            >
              {year && (
                <span className="text-green-400 font-semibold">{year}</span>
              )}
              {movie.vote_average && (
                <span className="flex items-center gap-1 text-white/90 font-medium">
                  <span className="text-yellow-400">★</span>
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              {genres.map((genre, index) => (
                <span
                  key={genre.id}
                  className="text-white/70"
                >
                  {genre.name}
                  {index < genres.length - 1 && <span className="mx-2">•</span>}
                </span>
              ))}
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-base md:text-lg text-white/80 leading-relaxed line-clamp-3 md:line-clamp-4 font-light drop-shadow-lg"
            >
              {movie.overview}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap items-center gap-3 pt-2"
            >
              <Button
                size="lg"
                onClick={() => handlePlayTrailer()}
                className="bg-white text-black hover:bg-white/90 transition-all duration-300 text-base md:text-lg font-semibold px-6 md:px-8 h-12 md:h-14 rounded-md shadow-xl hover:scale-105 group"
              >
                <Play className="h-5 w-5 md:h-6 md:w-6 mr-2 fill-current group-hover:scale-110 transition-transform" />
                Play
              </Button>
              
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 text-base md:text-lg font-semibold px-6 md:px-8 h-12 md:h-14 rounded-md border-0 shadow-xl hover:scale-105"
              >
                <Link to={`/${mediaType}/${movie.id}`}>
                  <Info className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                  More Info
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Next Button - Bottom Right */}
        {onNext && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            onClick={onNext}
            className="absolute bottom-8 right-8 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 group"
          >
            <span className="text-sm font-medium hidden md:inline">Next</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        )}
      </section>

      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerKey={selectedTrailer || ""}
      />
    </>
  );
}
