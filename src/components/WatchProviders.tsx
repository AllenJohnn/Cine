import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { tmdb, getImageUrl } from "@/lib/tmdb";
import { ExternalLink } from "lucide-react";

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WatchProvidersProps {
  movieId: number;
  mediaType: "movie" | "tv";
}

interface ProviderData {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export default function WatchProviders({ movieId, mediaType }: WatchProvidersProps) {
  const [providers, setProviders] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [externalLink, setExternalLink] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await tmdb.getWatchProviders(movieId, mediaType);
        if (data.results) {
          const countryCode = "US";
          const countryData = data.results[countryCode];
          if (countryData) {
            setProviders(countryData);
            setExternalLink(countryData.link || null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch watch providers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [movieId, mediaType]);

  if (loading || !providers) return null;

  const allProviders = [
    ...(providers.flatrate || []),
    ...(providers.rent || []),
    ...(providers.buy || []),
  ];

  // Remove duplicates by provider_id
  const uniqueProviders = Array.from(
    new Map(allProviders.map((p) => [p.provider_id, p])).values()
  );

  if (uniqueProviders.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 rounded-lg bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-md"
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-white/80">Watch On</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {uniqueProviders.slice(0, 6).map((provider) => (
          <motion.a
            key={provider.provider_id}
            href={externalLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => !externalLink && e.preventDefault()}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
            title={provider.provider_name}
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors shadow-lg group-hover:shadow-xl group-hover:shadow-white/20">
              <img
                src={getImageUrl(provider.logo_path, "w342")}
                alt={provider.provider_name}
                className="w-10 h-10 object-cover"
              />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {provider.provider_name}
            </div>
          </motion.a>
        ))}
        {externalLink && (
          <motion.a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-2"
          >
            View on JustWatch
            <ExternalLink className="h-3 w-3" />
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}
