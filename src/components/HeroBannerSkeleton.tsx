import { Skeleton } from "@/components/ui/skeleton";

export default function HeroBannerSkeleton() {
  return (
    <section className="relative min-h-[90vh] flex items-end overflow-hidden bg-muted">
      <div className="absolute inset-0">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="relative z-10 container mx-auto px-4 pb-16">
        <div className="max-w-2xl space-y-6">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    </section>
  );
}
