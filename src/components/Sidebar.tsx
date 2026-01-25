import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Clock, Eye } from "lucide-react";
import { Movie, getImageUrl, getTitle, getReleaseYear } from "@/lib/tmdb";

interface SidebarProps {
  trendingMovies: Movie[];
  topTvShows: Movie[];
  loading?: boolean;
}

function SidebarSection({
  title,
  items,
  viewMoreLink,
  loading,
  mediaType,
}: {
  title: string;
  items: Movie[];
  viewMoreLink: string;
  loading?: boolean;
  mediaType: "movie" | "tv";
}) {
  if (loading) {
    return (
      <div className="glass-card p-4 space-y-4">
        <div className="h-6 w-32 bg-muted rounded skeleton-shimmer" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-muted rounded-lg skeleton-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        <Link to={viewMoreLink} className="text-sm text-primary hover:underline">
          View More
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.slice(0, 6).map((item, index) => (
          <SidebarCard key={item.id} item={item} index={index} mediaType={mediaType} />
        ))}
      </div>
    </motion.div>
  );
}

function SidebarCard({
  item,
  index,
  mediaType,
}: {
  item: Movie;
  index: number;
  mediaType: "movie" | "tv";
}) {
  const title = getTitle(item);
  const year = getReleaseYear(item);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/${mediaType}/${item.id}`} className="block group">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
          <img
            src={getImageUrl(item.poster_path, "w300")}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Badge */}
          <span className="absolute top-1.5 left-1.5 badge-gold text-[10px]">
            {mediaType === "tv" ? "TV" : "Movie"}
          </span>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Stats on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-[10px] text-foreground">
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {year}
              </span>
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-primary text-primary" />
                {item.vote_average.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <h4 className="mt-2 text-xs font-medium line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h4>
      </Link>
    </motion.div>
  );
}

export default function Sidebar({ trendingMovies, topTvShows, loading }: SidebarProps) {
  return (
    <aside className="space-y-6">
      <SidebarSection
        title="Trending"
        items={trendingMovies}
        viewMoreLink="/explore?type=movie&sort=trending"
        loading={loading}
        mediaType="movie"
      />
      <SidebarSection
        title="Top TV Shows"
        items={topTvShows}
        viewMoreLink="/explore?type=tv&sort=top_rated"
        loading={loading}
        mediaType="tv"
      />
    </aside>
  );
}
