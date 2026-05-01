import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  User,
  Building2,
  Phone,
  MapPin,
  Briefcase,
  Edit,
  Lock,
  Save,
  TrendingUp,
  FileText,
  BarChart3,
  Trophy,
  Loader2,
  BookOpen,
  Image as ImageIcon,
  Mail,
  Star,
  CheckCircle2,
} from "lucide-react";
import { SavedAdsSection } from "@/components/profile/SavedAdsSection";

interface UserProfile {
  full_name: string;
  phone: string;
  business_name: string;
  industry: string;
  business_stage: string;
  location: string;
  preferred_category: string;
}

interface UserProgress {
  plans_created: number;
  marketing_campaigns_generated: number;
  dashboard_updates: number;
  budget_optimization_count: number;
  revenue_growth: number;
}

interface UserPoints {
  total_points: number;
  rank: number;
}

const ProfileInfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium truncate">{value || <span className="text-muted-foreground italic text-sm">Not set</span>}</p>
    </div>
  </div>
);

const StatCard = ({
  icon: Icon,
  value,
  label,
  color = "primary",
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color?: string;
}) => {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-500/10 text-green-600",
    blue: "bg-blue-500/10 text-blue-600",
    amber: "bg-amber-500/10 text-amber-600",
  };
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-background/40 backdrop-blur-sm shadow-sm hover:border-primary/30 transition-colors">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadProfileData();
  }, [user, navigate]);

  const loadProfileData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);

      const [profileRes, progressRes, pointsRes, plansRes] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_points").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("saved_business_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (progressRes.data) setProgress(progressRes.data);
      if (pointsRes.data) setPoints(pointsRes.data);
      if (plansRes.data) setSavedPlans(plansRes.data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setEditedProfile(profile);
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user || !editedProfile) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/update-user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          full_name: editedProfile.full_name,
          phone: editedProfile.phone,
          business_name: editedProfile.business_name,
          industry: editedProfile.industry,
          location: editedProfile.location,
          business_stage: editedProfile.business_stage,
        }),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      setProfile(editedProfile);
      setEditDialogOpen(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please ensure the backend server is running.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordDialogOpen(false);
      setNewPassword("");
      toast.success("Password changed successfully!");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPlan = (plan: any) => {
    const businessWithCustomName = {
      ...(plan.business_idea || {}),
      name: plan.plan_name,
    };
    sessionStorage.setItem("selectedBusiness", JSON.stringify(businessWithCustomName));
    sessionStorage.setItem("userProfile", JSON.stringify(plan.user_profile));
    sessionStorage.setItem("loadedPlan", JSON.stringify(plan.business_plan));
    navigate("/plan");
  };

  // Completeness score
  const profileFields = profile
    ? [profile.full_name, profile.phone, profile.business_name, profile.location, profile.business_stage]
    : [];
  const filledCount = profileFields.filter(Boolean).length;
  const completeness = Math.round((filledCount / 5) * 100);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-6xl">

          {/* ── Page Header ── */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your account and track your progress</p>
            </div>
            {points && (
              <Badge variant="secondary" className="text-base px-5 py-2 self-start sm:self-auto">
                <Trophy className="w-4 h-4 mr-2 text-amber-500" />
                {points.total_points} Points
                {points.rank ? ` · Rank #${points.rank}` : ""}
              </Badge>
            )}
          </div>

          {/* ── Main Grid: Sidebar + Content ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">

            {/* ── LEFT SIDEBAR ── */}
            <div className="space-y-4">
              {/* Avatar card */}
              <Card variant="glass" className="border-border/50 shadow-sm">
                <CardContent className="pt-6 pb-4 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-3xl font-bold text-primary-foreground">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold">{profile?.full_name || "Your Name"}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                  {profile?.business_stage && (
                    <Badge variant="outline" className="mt-2">{profile.business_stage}</Badge>
                  )}

                  {/* Profile completeness */}
                  <div className="w-full mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Profile Completeness</span>
                      <span>{completeness}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                    {completeness < 100 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Complete your profile to unlock all features
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 w-full">
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleEditProfile}>
                      <Edit className="w-3 h-3 mr-1.5" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setPasswordDialogOpen(true)}>
                      <Lock className="w-3 h-3 mr-1.5" />
                      Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info card */}
              <Card variant="glass" className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Business Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <ProfileInfoRow icon={Mail} label="Email" value={user?.email} />
                  <ProfileInfoRow icon={Phone} label="Phone" value={profile?.phone} />
                  <ProfileInfoRow icon={Building2} label="Business Name" value={profile?.business_name} />
                  <ProfileInfoRow icon={Briefcase} label="Industry" value={profile?.industry} />
                  <ProfileInfoRow icon={TrendingUp} label="Business Stage" value={profile?.business_stage} />
                  <ProfileInfoRow icon={MapPin} label="Location" value={profile?.location} />
                </CardContent>
              </Card>

              {/* Quick stats */}
              {points && (
                <Card variant="glass" className="border-border/50 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Your Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Total Points</span>
                      <span className="font-bold text-amber-500">{points.total_points}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">Rank</span>
                      <span className="font-bold">#{points.rank || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Plans Created</span>
                      <span className="font-bold">{progress?.plans_created || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── RIGHT CONTENT ── */}
            <div>
              <Tabs defaultValue="plans" className="space-y-4">
                <div className="overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar">
                  <TabsList className="inline-flex w-auto min-w-full h-auto gap-2 bg-muted/40 backdrop-blur-xl border border-border/50 p-2 rounded-2xl shadow-sm">
                    <TabsTrigger value="plans" className="flex-1 whitespace-nowrap px-4 py-2 text-sm">
                      <FileText className="w-3.5 h-3.5 mr-1.5" />Saved Plans
                    </TabsTrigger>
                    <TabsTrigger value="ads" className="flex-1 whitespace-nowrap px-4 py-2 text-sm">
                      <ImageIcon className="w-3.5 h-3.5 mr-1.5" />Saved Ads
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="flex-1 whitespace-nowrap px-4 py-2 text-sm">
                      <BarChart3 className="w-3.5 h-3.5 mr-1.5" />Progress
                    </TabsTrigger>
                    <TabsTrigger value="guide" className="flex-1 whitespace-nowrap px-4 py-2 text-sm">
                      <BookOpen className="w-3.5 h-3.5 mr-1.5" />Guide
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Saved Plans */}
                <TabsContent value="plans">
                  <Card variant="glass" className="border-border/50 shadow-sm animate-fade-in">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Saved Business Plans</CardTitle>
                        <Badge variant="secondary">{savedPlans.length} plans</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {savedPlans.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                          <p className="text-muted-foreground font-medium">No saved plans yet</p>
                          <p className="text-sm text-muted-foreground mt-1">Create a business plan to get started</p>
                          <Button className="mt-4" onClick={() => navigate("/start")}>
                            Create Your First Plan
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {savedPlans.map((plan) => (
                            <div
                              key={plan.id}
                              className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                              onClick={() => handleLoadPlan(plan)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-2xl flex-shrink-0">{plan.business_idea?.icon || "📋"}</span>
                                <div className="min-w-0">
                                  <p className="font-semibold truncate">{plan.plan_name}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Created {new Date(plan.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                Open →
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Saved Ads */}
                <TabsContent value="ads">
                  <Card variant="glass" className="border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle>Saved Advertisement Creatives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SavedAdsSection userId={user?.id || ""} />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Progress */}
                <TabsContent value="progress">
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Your Progress</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <StatCard icon={FileText} value={progress?.plans_created || 0} label="Plans Created" color="primary" />
                      <StatCard icon={TrendingUp} value={progress?.marketing_campaigns_generated || 0} label="Marketing Campaigns" color="green" />
                      <StatCard icon={BarChart3} value={progress?.dashboard_updates || 0} label="Dashboard Updates" color="blue" />
                      <StatCard icon={Star} value={progress?.budget_optimization_count || 0} label="Budget Optimizations" color="amber" />
                    </div>
                    {!progress && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                        <p>Start using the platform to track your progress here!</p>
                        <Button variant="outline" className="mt-3" onClick={() => navigate("/start")}>
                          Get Started
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Success Guide */}
                <TabsContent value="guide" className="animate-fade-in">
                  <Card variant="glass" className="border-border/50 shadow-sm">
                    <CardHeader>
                      <CardTitle>Success Guide</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Your personalised success guide will be generated based on your business type and stage.
                      </p>
                      <Button onClick={() => navigate("/profile?tab=guide")}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Generate Success Guide
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal and business information</DialogDescription>
          </DialogHeader>
          {editedProfile && (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5 col-span-2">
                <Label>Full Name</Label>
                <Input value={editedProfile.full_name || ""} onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={editedProfile.phone || ""} onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={editedProfile.location || ""} onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Business Name</Label>
                <Input value={editedProfile.business_name || ""} onChange={(e) => setEditedProfile({ ...editedProfile, business_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Input value={editedProfile.industry || ""} onChange={(e) => setEditedProfile({ ...editedProfile, industry: e.target.value })} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Business Stage</Label>
                <Input value={editedProfile.business_stage || ""} placeholder="e.g. Idea, Startup, Growing" onChange={(e) => setEditedProfile({ ...editedProfile, business_stage: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your new password below</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              minLength={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
