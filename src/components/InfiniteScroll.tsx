import { useEffect, useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";

interface InfiniteScrollProps {
  children: ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
}

export default function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  loading,
  threshold = 300,
}: InfiniteScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          setIsVisible(true);
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loading, onLoadMore, threshold]);

  return (
    <>
      {children}
      
      {hasMore && (
        <div ref={loaderRef} className="w-full py-8">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-4"
            >
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white/60 text-sm">Loading more...</p>
            </motion.div>
          ) : (
            <motion.button
              onClick={onLoadMore}
              className="mx-auto block px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Load More
            </motion.button>
          )}
        </div>
      )}
    </>
  );
}
