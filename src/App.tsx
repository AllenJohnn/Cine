import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import DetailsPage from "./pages/DetailsPage";
import NotFound from "./pages/NotFound";

const PersonPage = lazy(() => import("./pages/PersonPage"));

// Lazy load heavy components
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
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
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/movie/:id" element={<DetailsPage />} />
            <Route path="/tv/:id" element={<DetailsPage />} />
            <Route
              path="/person/:id"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <PersonPage />
                </Suspense>
              }
            />
            <Route
              path="/genre/:id"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <GenrePage />
                </Suspense>
              }
            />
            <Route
              path="/explore"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ExplorePage />
                </Suspense>
              }
            />
            <Route
              path="/search"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <SearchPage />
                </Suspense>
              }
            />
            <Route
              path="/watchlist"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <WatchlistPage />
                </Suspense>
              }
            />
            <Route
              path="/profile"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ProfilePage />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <AdminPage />
                </Suspense>
              }
            />
            <Route
              path="/login"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <LoginPage />
                </Suspense>
              }
            />
            <Route
              path="/signup"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <SignupPage />
                </Suspense>
              }
            />
            <Route
              path="/collections"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <CollectionsPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
