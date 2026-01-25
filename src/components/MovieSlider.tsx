import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";
import { Link } from "react-router-dom";

interface MovieSliderProps {
  title: string;
  movies: Movie[];
  mediaType?: "movie" | "tv";
  viewMoreLink?: string;
  loading?: boolean;
}

export default function MovieSlider({
  title,
  movies,
  mediaType,
  viewMoreLink,
  loading = false,
}: MovieSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.offsetWidth * 0.8;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 bg-muted rounded skeleton-shimmer" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-44 shrink-0">
              <div className="aspect-[2/3] bg-muted rounded-xl skeleton-shimmer" />
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-muted rounded skeleton-shimmer" />
                <div className="h-3 w-20 bg-muted rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
        <div className="flex items-center gap-3">
          {viewMoreLink && (
            <Link
              to={viewMoreLink}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors tracking-wide hidden sm:block"
            >
              View All →
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
      >
        {movies.map((movie, index) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            mediaType={mediaType}
            index={index}
          />
        ))}
      </div>
    </motion.section>
  );
}
