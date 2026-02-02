import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import MovieCard from "@/components/MovieCard";
import Footer from "@/components/Footer";
import { getImageUrl } from "@/lib/tmdb";

interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  gender: number;
  popularity: number;
  homepage: string | null;
  imdb_id: string | null;
}

interface PersonCredits {
  cast: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    character: string;
    media_type: "movie" | "tv";
    overview: string;
    genre_ids?: number[];
  }>;
  crew: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    job: string;
    department: string;
    media_type: "movie" | "tv";
    overview: string;
    genre_ids?: number[];
  }>;
}

export default function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [credits, setCredits] = useState<PersonCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"movies" | "tv">("movies");
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    const fetchPersonData = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
        const baseUrl = 'https://api.themoviedb.org/3';
        
        // Fetch with timeout and retry
        const fetchWithTimeout = async (url: string, timeout = 10000) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          try {
            const response = await fetch(url, { 
              signal: controller.signal,
              headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            clearTimeout(timeoutId);
            throw error;
          }
        };

        const [personResponse, creditsResponse] = await Promise.all([
          fetchWithTimeout(`${baseUrl}/person/${id}?api_key=${TMDB_API_KEY}`),
          fetchWithTimeout(`${baseUrl}/person/${id}/combined_credits?api_key=${TMDB_API_KEY}`)
        ]);

        if (!personResponse.ok || !creditsResponse.ok) {
          throw new Error('Failed to fetch person data');
        }

        const personData = await personResponse.json();
        const creditsData = await creditsResponse.json();

        setPerson(personData);
        setCredits(creditsData);
      } catch (error) {
        console.error("Failed to fetch person data:", error);
        if (error instanceof Error && error.name === 'AbortError') {
          console.error("Request timed out - check your internet connection");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-3xl font-bold">Person not found</h1>
        </div>
      </div>
    );
  }

  const age = person.birthday ? 
    Math.floor(
      ((person.deathday ? new Date(person.deathday) : new Date()).getTime() - new Date(person.birthday).getTime()) / 
      (1000 * 60 * 60 * 24 * 365.25)
    ) : null;

  const movieCredits = credits?.cast.filter(c => c.media_type === "movie")
    .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)) || [];
  
  const tvCredits = credits?.cast.filter(c => c.media_type === "tv")
    .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)) || [];

  const displayedCredits = activeTab === "movies" ? movieCredits : tvCredits;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container mx-auto px-4 pt-24 pb-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-[300px_1fr] gap-8 mb-12"
        >
          {/* Profile Image */}
          <div className="flex flex-col items-center md:items-start">
            <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-muted mb-4">
              <img
                src={getImageUrl(person.profile_path, "h632")}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Social Links */}
            {person.imdb_id && (
              <a
                href={`https://www.imdb.com/name/${person.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>IMDb Profile</span>
              </a>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{person.name}</h1>
            
            <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
              {person.known_for_department && (
                <span className="text-primary font-medium">{person.known_for_department}</span>
              )}
              {person.birthday && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(person.birthday).toLocaleDateString()} 
                    {age && ` (${age} years old)`}
                  </span>
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{person.place_of_birth}</span>
                </div>
              )}
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3">Biography</h2>
                <div className={`text-muted-foreground leading-relaxed ${!showFullBio && 'line-clamp-6'}`}>
                  {person.biography}
                </div>
                {person.biography.length > 500 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-2 text-primary hover:underline text-sm"
                  >
                    {showFullBio ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Credits Section */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold">Known For</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("movies")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "movies" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Movies ({movieCredits.length})
              </button>
              <button
                onClick={() => setActiveTab("tv")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "tv" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                TV Shows ({tvCredits.length})
              </button>
            </div>
          </div>

          {displayedCredits.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {displayedCredits.map((credit) => (
                <MovieCard
                  key={`${credit.media_type}-${credit.id}`}
                  movie={{
                    ...credit,
                    title: credit.title || credit.name,
                  }}
                  mediaType={credit.media_type}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No {activeTab === "movies" ? "movies" : "TV shows"} found
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
