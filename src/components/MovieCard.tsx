import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, Play } from "lucide-react";
import { Movie, getImageUrl, getTitle, getReleaseYear, getRuntime } from "@/lib/tmdb";

interface MovieCardProps {
  movie: Movie;
  mediaType?: "movie" | "tv";
  index?: number;
  size?: "sm" | "md" | "lg";
}

export default function MovieCard({ movie, mediaType, index = 0, size = "md" }: MovieCardProps) {
  const type = mediaType || movie.media_type || "movie";
  const title = getTitle(movie);
  const year = getReleaseYear(movie);
  const runtime = getRuntime(movie);

  const sizeClasses = {
    sm: "w-28 sm:w-32",
    md: "w-36 sm:w-40 md:w-44",
    lg: "w-44 sm:w-52 md:w-56",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={`${sizeClasses[size]} shrink-0`}
    >
      <Link to={`/${type}/${movie.id}`} className="block group">
        <div className="movie-card aspect-[2/3] bg-white/5 rounded-lg overflow-hidden relative border border-white/10 transform-gpu will-change-transform">
          <img
            src={getImageUrl(movie.poster_path, "w342")}
            srcSet={`${getImageUrl(movie.poster_path, "w185")} 185w, ${getImageUrl(movie.poster_path, "w342")} 342w, ${getImageUrl(movie.poster_path, "w500")} 500w`}
            sizes="(max-width: 640px) 112px, (max-width: 768px) 160px, 176px"
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 will-change-transform"
            loading="lazy"
            decoding="async"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white flex items-center justify-center shadow-2xl backdrop-blur-sm scale-0 rotate-[-45deg] md:group-hover:scale-100 md:group-hover:rotate-0 transition-transform duration-300 will-change-transform">
              <Play className="h-4 w-4 sm:h-6 sm:w-6 text-black fill-black ml-0.5 sm:ml-1" />
            </div>
          </div>

          {movie.vote_average != null && movie.vote_average > 0 && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/80 backdrop-blur-sm border border-white/20 flex items-center gap-1 text-xs font-medium">
              <Star className="h-3 w-3 fill-white text-white" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          )}

          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-black text-xs font-bold uppercase tracking-wider">
            {type === "tv" ? "TV" : "Film"}
          </div>
        </div>

        <div className="mt-3 space-y-1 px-1">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-1 group-hover:text-white transition-colors duration-200 tracking-tight">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-white/50 font-light">
            {year && <span>{year}</span>}
            {runtime && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 line-clamp-1">
                  {runtime}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
