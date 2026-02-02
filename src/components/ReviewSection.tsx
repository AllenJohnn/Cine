import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewSectionProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
}

export default function ReviewSection({ tmdbId, mediaType }: ReviewSectionProps) {
  return (
    <Card className="backdrop-blur-lg bg-card/50 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Reviews feature coming soon!
        </p>
      </CardContent>
    </Card>
  );
}
