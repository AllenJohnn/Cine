import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { getImageUrl } from "@/lib/tmdb";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface CastCarouselProps {
  cast: CastMember[];
}

export default function CastCarousel({ cast }: CastCarouselProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.offsetWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const checkScrollPosition = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  if (cast.length === 0) return null;

  return (
    <div className="pt-8 relative group">
      <h3 className="text-2xl font-bold mb-6">Top Cast</h3>
      
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center"
          >
            <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end"
          >
            <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </div>
          </button>
        )}

        {/* Cast Grid */}
        <div
          ref={scrollRef}
          onScroll={checkScrollPosition}
          className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-2"
        >
          {cast.map((actor, index) => (
            <motion.button
              key={actor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/person/${actor.id}`)}
              className="shrink-0 w-32 group/card cursor-pointer"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5 ring-2 ring-transparent group-hover/card:ring-primary transition-all mb-3">
                {actor.profile_path ? (
                  <img
                    src={getImageUrl(actor.profile_path, "w185")}
                    alt={actor.name}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                    <svg className="w-16 h-16 text-white/20" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
              </div>
              <div className="text-left space-y-1">
                <p className="font-semibold text-sm line-clamp-2 group-hover/card:text-primary transition-colors">
                  {actor.name}
                </p>
                <p className="text-xs text-white/50 line-clamp-2">{actor.character}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
