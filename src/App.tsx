import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AnimatePresence } from "framer-motion";
import LoadingBar from "@/components/LoadingBar";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import DetailsPage from "./pages/DetailsPage";
import NotFound from "./pages/NotFound";

const PersonPage = lazy(() => import("./pages/PersonPage"));

// Lazy load heavy components
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const GenrePage = lazy(() => import("./pages/GenrePage"));
const CollectionsPage = lazy(() => import("./pages/CollectionsPage"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <>
      <LoadingBar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/movie/:id" element={<PageTransition><DetailsPage /></PageTransition>} />
          <Route path="/tv/:id" element={<PageTransition><DetailsPage /></PageTransition>} />
          <Route
            path="/person/:id"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <PageTransition><PersonPage /></PageTransition>
              </Suspense>
            }
          />
          <Route
            path="/genre/:id"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <PageTransition><GenrePage /></PageTransition>
              </Suspense>
            }
          />
          <Route
            path="/explore"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <PageTransition><ExplorePage /></PageTransition>
              </Suspense>
            }
          />
          <Route
            path="/search"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <PageTransition><SearchPage /></PageTransition>
              </Suspense>
            }
          />
          <Route
            path="/collections"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <PageTransition><CollectionsPage /></PageTransition>
              </Suspense>
            }
          />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Analytics />
          <SpeedInsights />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
