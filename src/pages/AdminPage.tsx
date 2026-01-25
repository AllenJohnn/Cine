import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Film,
  Heart,
  Star,
  TrendingUp,
  Search,
  Trash2,
  Shield,
  CheckCircle,
} from "lucide-react";
import { tmdb } from "@/lib/tmdb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DashboardStats {
  totalUsers: number;
  totalReviews: number;
  totalWatchlist: number;
  totalLikes: number;
}

interface User {
  id: string;
  email: string;
  username: string | null;
  created_at: string;
  role?: string;
}

interface FeaturedMovie {
  id: string;
  tmdb_id: number;
  title: string;
  media_type: string;
  backdrop_path: string | null;
}

interface MovieSearchResult {
  id: number;
  title?: string;
  name?: string;
  backdrop_path: string;
  media_type?: string;
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalReviews: 0,
    totalWatchlist: 0,
    totalLikes: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [featuredMovie, setFeaturedMovie] = useState<FeaturedMovie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
  const [selectedMediaType, setSelectedMediaType] = useState<"movie" | "tv">("movie");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardStats();
      fetchUsers();
      fetchFeaturedMovie();
    }
  }, [user, isAdmin]);

  const fetchDashboardStats = async () => {
    const [usersRes, reviewsRes, watchlistRes, likesRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("reviews").select("id", { count: "exact" }),
      supabase.from("watchlist").select("id", { count: "exact" }),
      supabase.from("likes").select("id", { count: "exact" }),
    ]);

    setStats({
      totalUsers: usersRes.count || 0,
      totalReviews: reviewsRes.count || 0,
      totalWatchlist: watchlistRes.count || 0,
      totalLikes: likesRes.count || 0,
    });
  };

  const fetchUsers = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, created_at")
      .order("created_at", { ascending: false });

    if (profiles) {
      const usersWithDetails = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .maybeSingle();

          return {
            ...profile,
            email: "user@example.com", // Note: actual email requires admin API
            role: roleData?.role || "user",
          };
        })
      );
      setUsers(usersWithDetails as User[]);
    }
  };

  const fetchFeaturedMovie = async () => {
    const { data } = await supabase
      .from("featured_movie")
      .select("*")
      .maybeSingle();

    if (data) {
      setFeaturedMovie(data);
    }
  };

  const handleSearchMovies = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await tmdb.searchMulti(searchQuery);
      const filtered = results.results
        .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
        .slice(0, 10);
      setSearchResults(filtered);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search movies",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSetFeaturedMovie = async (movie: MovieSearchResult) => {
    setLoading(true);
    try {
      await supabase.from("featured_movie").delete().neq("id", "");

      const { error } = await supabase.from("featured_movie").insert({
        tmdb_id: movie.id,
        title: movie.title || movie.name || "",
        media_type: movie.media_type || selectedMediaType,
        backdrop_path: movie.backdrop_path,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Featured movie updated successfully",
      });

      fetchFeaturedMovie();
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update featured movie",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.from("user_roles").upsert(
        {
          user_id: userId,
          role: "admin",
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "User promoted to admin",
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Delete user data first
      await Promise.all([
        supabase.from("watchlist").delete().eq("user_id", userToDelete),
        supabase.from("likes").delete().eq("user_id", userToDelete),
        supabase.from("reviews").delete().eq("user_id", userToDelete),
        supabase.from("user_roles").delete().eq("user_id", userToDelete),
        supabase.from("profiles").delete().eq("id", userToDelete),
      ]);

      // Note: Deleting auth user requires Admin API or Edge Function
      // This only deletes the profile data. To delete the auth user:
      // 1. Use Supabase Admin API in a secure Edge Function
      // 2. Or use the Supabase Dashboard

      toast({
        title: "Success",
        description: "User profile data deleted successfully",
      });

      fetchUsers();
      fetchDashboardStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }

    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-900/20 border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>You must be an administrator to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-amber-500" />
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-blue-400">Total Users</CardTitle>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-700/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-amber-400">Total Reviews</CardTitle>
                <Star className="w-5 h-5 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalReviews}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border-purple-700/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-purple-400">Watchlist Items</CardTitle>
                <Film className="w-5 h-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalWatchlist}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-900/40 to-pink-800/20 border-pink-700/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-pink-400">Total Likes</CardTitle>
                <Heart className="w-5 h-5 text-pink-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalLikes}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="featured">Featured Movie</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          {/* Featured Movie Tab */}
          <TabsContent value="featured" className="space-y-4 mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Featured Movie Manager
                </CardTitle>
                <CardDescription>
                  Select a movie or TV show to feature on the home page hero banner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Featured Movie */}
                {featuredMovie && (
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Current Featured:</p>
                    <div className="flex items-center gap-4">
                      {featuredMovie.backdrop_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${featuredMovie.backdrop_path}`}
                          alt={featuredMovie.title}
                          className="w-32 h-18 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-lg">{featuredMovie.title}</p>
                        <p className="text-sm text-gray-400 capitalize">
                          {featuredMovie.media_type}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search for new featured movie */}
                <div className="space-y-2">
                  <Label>Search for Movie or TV Show</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedMediaType}
                      onValueChange={(value: "movie" | "tv") => setSelectedMediaType(value)}
                    >
                      <SelectTrigger className="w-[120px] bg-gray-900/50 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="movie">Movie</SelectItem>
                        <SelectItem value="tv">TV Show</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Search for a movie or TV show..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchMovies()}
                      className="flex-1 bg-gray-900/50 border-gray-600"
                    />
                    <Button
                      onClick={handleSearchMovies}
                      disabled={loading}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((movie) => (
                      <div
                        key={movie.id}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-amber-500/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {movie.backdrop_path && (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${movie.backdrop_path}`}
                              alt={movie.title || movie.name}
                              className="w-16 h-9 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{movie.title || movie.name}</p>
                            <p className="text-sm text-gray-400 capitalize">
                              {movie.media_type || selectedMediaType}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSetFeaturedMovie(movie)}
                          className="bg-amber-500 hover:bg-amber-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Set as Featured
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage users and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Username</TableHead>
                      <TableHead className="text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-300">Joined</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="border-gray-700">
                        <TableCell>{u.username || "Anonymous"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              u.role === "admin"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {u.role !== "admin" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMakeAdmin(u.id)}
                                className="border-gray-600"
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Make Admin
                              </Button>
                            )}
                            {u.id !== user.id && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setUserToDelete(u.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all user data including watchlist, likes, and reviews.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 border-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
