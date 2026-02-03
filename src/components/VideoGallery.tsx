import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Film } from "lucide-react";

interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

interface VideoGalleryProps {
  videos: Video[];
}

export default function VideoGallery({ videos }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const trailers = videos.filter((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
  const clips = videos.filter((v) => v.site === "YouTube" && v.type !== "Trailer" && v.type !== "Teaser");

  if (trailers.length === 0 && clips.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Trailers */}
      {trailers.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Film className="h-5 w-5" />
            Trailers & Teasers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trailers.map((video) => (
              <motion.button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="relative group aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                  alt={video.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <Play className="h-5 w-5 text-black fill-black ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                  <p className="text-xs font-medium line-clamp-2">{video.name}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Clips */}
      {clips.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Clips & Behind the Scenes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clips.slice(0, 8).map((video) => (
              <motion.button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="relative group aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                  alt={video.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-4 w-4 text-black fill-black ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                  <p className="text-xs line-clamp-1">{video.name}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl aspect-video"
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1`}
                title={selectedVideo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
