import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";

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
  loading = false,
}: MovieSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const isMobile = window.innerWidth < 768;
    const scrollAmount = sliderRef.current.offsetWidth * (isMobile ? 0.85 : 0.75);
    const newScrollLeft = sliderRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
    
    sliderRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });

    // Update arrow visibility after scroll
    setTimeout(() => {
      checkScrollPosition();
    }, 300);
  };

  const checkScrollPosition = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-16">
          <div className="h-7 w-48 bg-muted rounded skeleton-shimmer" />
        </div>
        <div className="flex gap-4 overflow-hidden px-4 md:px-8 lg:px-16">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-36 sm:w-44 shrink-0">
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="group/slider relative"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-8 lg:px-16">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">{title}</h2>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 md:w-16 bg-gradient-to-r from-background to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 flex items-center justify-start pl-2 md:pl-4"
            aria-label="Scroll left"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 hover:scale-110 transition-all duration-300">
              <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" />
            </div>
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 md:w-16 bg-gradient-to-l from-background to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 flex items-center justify-end pr-2 md:pr-4"
            aria-label="Scroll right"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 hover:scale-110 transition-all duration-300">
              <ChevronRight className="h-6 w-6 md:h-7 md:w-7" />
            </div>
          </button>
        )}

        {/* Movies Grid */}
        <div
          ref={sliderRef}
          onScroll={checkScrollPosition}
          className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar scroll-smooth px-4 md:px-8 lg:px-16 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies
            .filter((movie) => movie.id && movie.poster_path)
            .map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                className="shrink-0 w-36 sm:w-44 md:w-48"
              >
                <MovieCard movie={movie} mediaType={mediaType} index={index} />
              </motion.div>
            ))}
        </div>
      </div>
    </motion.section>
  );
}
