import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import { tmdb, Movie } from "@/lib/tmdb";

interface Collection {
  id: string;
  name: string;
  keywords: string[];
  description: string;
}

const collections: Collection[] = [
  { id: "mcu", name: "Marvel Cinematic Universe", keywords: ["Marvel", "Avengers", "Iron Man", "Thor", "Captain America"], description: "The interconnected Marvel superhero saga" },
  { id: "dc", name: "DC Extended Universe", keywords: ["DC", "Batman", "Superman", "Wonder Woman", "Justice League"], description: "DC's cinematic superhero universe" },
  { id: "harry-potter", name: "Harry Potter", keywords: ["Harry Potter"], description: "The magical wizarding world" },
  { id: "star-wars", name: "Star Wars", keywords: ["Star Wars"], description: "A long time ago in a galaxy far, far away" },
  { id: "lotr", name: "Lord of the Rings", keywords: ["Lord of the Rings", "Hobbit"], description: "The epic Middle-earth saga" },
  { id: "fast-furious", name: "Fast & Furious", keywords: ["Fast"], description: "High-octane action and family" },
  { id: "jurassic", name: "Jurassic Park", keywords: ["Jurassic"], description: "Dinosaurs brought back to life" },
  { id: "mission-impossible", name: "Mission: Impossible", keywords: ["Mission: Impossible"], description: "Tom Cruise's death-defying stunts" },
];

export default function CollectionsPage() {
  const [selectedCollection, setSelectedCollection] = useState<Collection>(collections[0]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCollectionMovies = async () => {
      setLoading(true);
      try {
        const searchPromises = selectedCollection.keywords.map(keyword =>
          tmdb.search(keyword, 1)
        );
        
        const results = await Promise.all(searchPromises);
        
        if (!controller.signal.aborted) {
          const allMovies = results.flatMap(r => r.results);
          
          // Deduplicate and filter
          const uniqueMovies = Array.from(
            new Map(allMovies.map(m => [m.id, m])).values()
          ).filter(m => m.vote_average > 6);
          
          setMovies(uniqueMovies.slice(0, 18));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch collection:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCollectionMovies();
    return () => controller.abort();
  }, [selectedCollection]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Collections</h1>
          </div>
          <p className="text-muted-foreground">Explore iconic movie franchises and universes</p>
        </motion.div>

        {/* Collection Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 hide-scrollbar">
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => setSelectedCollection(collection)}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCollection.id === collection.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {collection.name}
            </button>
          ))}
        </div>

        {/* Collection Header */}
        <motion.div
          key={selectedCollection.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">{selectedCollection.name}</h2>
          <p className="text-muted-foreground">{selectedCollection.description}</p>
        </motion.div>

        {/* Movies Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            key={selectedCollection.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                mediaType={movie.media_type || "movie"}
              />
            ))}
          </motion.div>
        )}

        {!loading && movies.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No movies found in this collection
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
