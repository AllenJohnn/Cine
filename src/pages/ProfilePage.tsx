import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Film, Heart, Star, Edit2, Save, X } from "lucide-react";

interface UserStats {
  watchlistCount: number;
  likesCount: number;
  reviewsCount: number;
}

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats>({
    watchlistCount: 0,
    likesCount: 0,
    reviewsCount: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    avatar_url: profile?.avatar_url || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [watchlistRes, likesRes, reviewsRes] = await Promise.all([
        supabase.from("watchlist").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("likes").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("reviews").select("id", { count: "exact" }).eq("user_id", user.id),
      ]);

      // Check for errors
      if (watchlistRes.error) throw watchlistRes.error;
      if (likesRes.error) throw likesRes.error;
      if (reviewsRes.error) throw reviewsRes.error;

      setStats({
        watchlistCount: watchlistRes.count || 0,
        likesCount: likesRes.count || 0,
        reviewsCount: reviewsRes.count || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast({
        title: "Error",
        description: "Failed to load profile statistics",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await updateProfile(editForm);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setEditForm({
      username: profile?.username || "",
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      avatar_url: profile?.avatar_url || "",
    });
    setIsEditing(false);
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 bg-gray-800/50 border-gray-700 backdrop-blur">
            <CardHeader className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-amber-500/30">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-amber-500 to-orange-600">
                  {profile.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl text-amber-500">
                {profile.username || "Anonymous User"}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {user.email}
              </CardDescription>
              {profile.bio && !isEditing && (
                <p className="text-sm text-gray-300 mt-4">{profile.bio}</p>
              )}
            </CardHeader>
            <CardContent>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Stats and Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="w-full bg-gray-800/50 border border-gray-700">
                <TabsTrigger value="stats" className="flex-1">Statistics</TabsTrigger>
                {isEditing && <TabsTrigger value="edit" className="flex-1">Edit Profile</TabsTrigger>}
              </TabsList>

              <TabsContent value="stats" className="space-y-4 mt-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-blue-400">Watchlist</CardTitle>
                        <Film className="w-5 h-5 text-blue-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-white">{stats.watchlistCount}</p>
                      <p className="text-sm text-gray-400">Items saved</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-pink-900/40 to-pink-800/20 border-pink-700/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-pink-400">Likes</CardTitle>
                        <Heart className="w-5 h-5 text-pink-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-white">{stats.likesCount}</p>
                      <p className="text-sm text-gray-400">Movies liked</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-700/30">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-amber-400">Reviews</CardTitle>
                        <Star className="w-5 h-5 text-amber-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-white">{stats.reviewsCount}</p>
                      <p className="text-sm text-gray-400">Reviews written</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Info */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-400">Full Name</p>
                      <p className="text-white">{profile.full_name || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Username</p>
                      <p className="text-white">{profile.username || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="text-white">
                        {new Date((profile as any).created_at || new Date()).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {isEditing && (
                <TabsContent value="edit" className="mt-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle>Edit Your Profile</CardTitle>
                      <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          className="bg-gray-900/50 border-gray-600"
                          placeholder="Enter username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="bg-gray-900/50 border-gray-600"
                          placeholder="Enter full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                          className="bg-gray-900/50 border-gray-600 min-h-[100px]"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatar_url">Avatar URL</Label>
                        <Input
                          id="avatar_url"
                          value={editForm.avatar_url}
                          onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                          className="bg-gray-900/50 border-gray-600"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleSave}
                          disabled={loading}
                          className="flex-1 bg-amber-500 hover:bg-amber-600"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="flex-1 border-gray-600"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
