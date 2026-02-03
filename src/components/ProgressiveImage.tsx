import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProgressiveImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
}

export default function ProgressiveImage({
  src,
  srcSet,
  sizes,
  alt,
  className = "",
  placeholderSrc = "/placeholder.svg"
}: ProgressiveImageProps) {
  const [imgSrc, setImgSrc] = useState(placeholderSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImgSrc(placeholderSrc);

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      setImgSrc(placeholderSrc);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholderSrc]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-white/5 skeleton-shimmer"
          />
        )}
      </AnimatePresence>
      
      <motion.img
        src={imgSrc}
        srcSet={!hasError ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        className={`${className} ${isLoading ? 'blur-sm scale-110' : 'blur-0 scale-100'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: hasError ? 0.3 : 1 }}
        transition={{ duration: 0.3 }}
        loading="lazy"
        decoding="async"
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
          <div className="text-center text-white/30 text-xs">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            No Image
          </div>
        </div>
      )}
    </div>
  );
}
