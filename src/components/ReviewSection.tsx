import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface ReviewSectionProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
}

export default function ReviewSection({ tmdbId, mediaType }: ReviewSectionProps) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("tmdb_id", tmdbId)
      .eq("media_type", mediaType)
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch profiles separately
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const reviewsWithProfiles = data.map(review => ({
        ...review,
        profiles: profileMap.get(review.user_id) || null
      }));
      
      setReviews(reviewsWithProfiles as Review[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();

    // Realtime subscription
    const channel = supabase
      .channel(`reviews_${tmdbId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
          filter: `tmdb_id=eq.${tmdbId}`,
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tmdbId, mediaType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to write a review");
      return;
    }
    if (!newReview.trim() || rating === 0) {
      toast.error("Please provide a rating and review");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      tmdb_id: tmdbId,
      media_type: mediaType,
      rating,
      review_text: newReview.trim(),
    });

    if (error) {
      toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted!");
      setNewReview("");
      setRating(0);
    }
    setSubmitting(false);
  };

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-bold">Reviews</h2>

      {/* Write Review */}
      {user ? (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>
                {profile?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{profile?.username || "User"}</p>
              <p className="text-sm text-muted-foreground">Write a review</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Your rating:</span>
            {[...Array(10)].map((_, i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoveredRating(i + 1)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(i + 1)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
                    i < (hoveredRating || rating)
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-medium">{rating}/10</span>
          </div>

          <Textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Share your thoughts about this movie..."
            className="min-h-[100px] resize-none"
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="gap-2">
              <Send className="h-4 w-4" />
              {submitting ? "Posting..." : "Post Review"}
            </Button>
          </div>
        </motion.form>
      ) : (
        <div className="glass-card p-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Sign in to write a review</p>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted skeleton-shimmer" />
                  <div className="h-4 w-32 bg-muted rounded skeleton-shimmer" />
                </div>
                <div className="h-16 bg-muted rounded skeleton-shimmer" />
              </div>
            ))
          ) : reviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-muted-foreground"
            >
              No reviews yet. Be the first to write one!
            </motion.div>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-6"
              >
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {review.profiles?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {review.profiles?.username || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 badge-gold">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{review.rating}/10</span>
                      </div>
                    </div>
                    <p className="mt-3 text-muted-foreground">{review.review_text}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
