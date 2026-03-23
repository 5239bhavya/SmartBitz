import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, TrendingUp, Loader2, X, User, Phone, Mail, MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  full_name: string;
  business_name: string;
  industry: string;
  phone?: string;
  location?: string;
  email?: string;
}

interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  rank: number;
  user_profiles: UserProfile;
}

// ─── Profile Popup ────────────────────────────────────────────────────────────
const ProfilePopup = ({
  entry,
  rank,
  onClose,
}: {
  entry: LeaderboardEntry;
  rank: number;
  onClose: () => void;
}) => {
  const profile = entry.user_profiles;
  const name = profile?.full_name || "User";

  const getInitials = (n: string) =>
    n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getRankColor = (r: number) => {
    if (r === 1) return "from-yellow-400 to-amber-500";
    if (r === 2) return "from-gray-300 to-slate-400";
    if (r === 3) return "from-amber-500 to-orange-600";
    return "from-primary/80 to-primary";
  };

  const getRankLabel = (r: number) => {
    if (r === 1) return "🥇 1st Place";
    if (r === 2) return "🥈 2nd Place";
    if (r === 3) return "🥉 3rd Place";
    return `#${r}`;
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Card */}
      <div
        className="relative bg-background/80 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div className={`bg-gradient-to-br ${getRankColor(rank)} p-8 text-white relative overflow-hidden`}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 text-white hover:bg-white/20 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-20 h-20 border-4 border-white/50 shadow-lg">
              <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-sm text-white/80">{getRankLabel(rank)}</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 text-base px-4 py-1">
              {entry.total_points} Points
            </Badge>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Contact Details
          </h3>
          <div className="space-y-3">
            {profile?.phone ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 bg-primary/10 rounded-lg">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 opacity-50">
                <div className="flex items-center justify-center w-9 h-9 bg-muted rounded-lg">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-muted-foreground italic">Not provided</p>
                </div>
              </div>
            )}

            {profile?.location ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 bg-primary/10 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{profile.location}</p>
                </div>
              </div>
            ) : null}

            {profile?.business_name ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 bg-primary/10 rounded-lg">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Business</p>
                  <p className="font-medium">{profile.business_name}</p>
                </div>
              </div>
            ) : null}
          </div>

          <Button variant="outline" className="w-full mt-2" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ScoreboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<{
    entry: LeaderboardEntry;
    rank: number;
  } | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/get-leaderboard?limit=50");
      if (!response.ok) throw new Error("Failed to load leaderboard");
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      toast.error("Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getPodiumStyle = (rank: number) => {
    if (rank === 1)
      return "border-yellow-400 bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 shadow-yellow-200/50 dark:shadow-yellow-800/30";
    if (rank === 2)
      return "border-slate-400 bg-gradient-to-b from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20";
    if (rank === 3)
      return "border-amber-600 bg-gradient-to-b from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20";
    return "";
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return (
      <span className="text-sm font-bold text-muted-foreground w-5 text-center">
        #{rank}
      </span>
    );
  };

  const getRowStyle = (index: number) => {
    if (index === 0)
      return "bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/40 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20";
    if (index === 1)
      return "bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-700/40 hover:bg-slate-100/50";
    if (index === 2)
      return "bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/40 hover:bg-orange-100/50 dark:hover:bg-orange-900/20";
    return "bg-muted/20 hover:bg-muted/50 border border-transparent";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Loading standings...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-10 px-4 bg-gradient-to-b from-muted/30 to-background">
        <div className="container max-w-4xl space-y-8">

          {/* Page Header */}
          <div className="text-center space-y-2 mb-10 animate-slide-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-4 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-2xl">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Business Growth Leaderboard
              </h1>
            </div>
            <p className="text-muted-foreground text-base">
              Compete, grow, and rise to the top. Click any user to view their contact info.
            </p>
          </div>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4">
              {/* 2nd Place */}
              <div
                className={`mt-8 border-2 ${getPodiumStyle(2)} rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                onClick={() => setSelectedEntry({ entry: leaderboard[1], rank: 2 })}
              >
                <Medal className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                <Avatar className="w-14 h-14 mx-auto mb-2 border-2 border-slate-300">
                  <AvatarFallback className="font-bold">
                    {getInitials(leaderboard[1]?.user_profiles?.full_name || "U")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-bold text-sm truncate">{leaderboard[1]?.user_profiles?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate mb-2">{leaderboard[1]?.user_profiles?.business_name || ""}</p>
                <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  {leaderboard[1]?.total_points} pts
                </Badge>
              </div>

              {/* 1st Place */}
              <div
                className={`border-2 ${getPodiumStyle(1)} rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl shadow-lg`}
                onClick={() => setSelectedEntry({ entry: leaderboard[0], rank: 1 })}
              >
                <Trophy className="w-9 h-9 text-yellow-500 mx-auto mb-2" />
                <Avatar className="w-20 h-20 mx-auto mb-2 border-4 border-yellow-400 shadow-md">
                  <AvatarFallback className="text-xl font-bold">
                    {getInitials(leaderboard[0]?.user_profiles?.full_name || "U")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-bold truncate">{leaderboard[0]?.user_profiles?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate mb-2">{leaderboard[0]?.user_profiles?.business_name || ""}</p>
                <Badge className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border border-yellow-300">
                  {leaderboard[0]?.total_points} pts ⭐
                </Badge>
              </div>

              {/* 3rd Place */}
              <div
                className={`mt-8 border-2 ${getPodiumStyle(3)} rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                onClick={() => setSelectedEntry({ entry: leaderboard[2], rank: 3 })}
              >
                <Award className="w-7 h-7 text-amber-600 mx-auto mb-2" />
                <Avatar className="w-14 h-14 mx-auto mb-2 border-2 border-amber-500">
                  <AvatarFallback className="font-bold">
                    {getInitials(leaderboard[2]?.user_profiles?.full_name || "U")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-bold text-sm truncate">{leaderboard[2]?.user_profiles?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate mb-2">{leaderboard[2]?.user_profiles?.business_name || ""}</p>
                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300">
                  {leaderboard[2]?.total_points} pts
                </Badge>
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          <Card variant="glass" className="shadow-sm border-border/50 mt-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                All Rankings
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {leaderboard.length} users
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {leaderboard.length === 0 ? (
                <div className="text-center py-16">
                  <Trophy className="w-14 h-14 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground font-medium">No rankings yet.</p>
                  <p className="text-sm text-muted-foreground">Be the first to earn points!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${getRowStyle(index)}`}
                      onClick={() => setSelectedEntry({ entry, rank: index + 1 })}
                      title="Click to view contact info"
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-10">
                        {getRankIcon(index + 1)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="border">
                        <AvatarFallback className="font-semibold text-sm">
                          {getInitials(entry.user_profiles?.full_name || "U")}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">
                          {entry.user_profiles?.full_name || "User"}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {entry.user_profiles?.business_name
                            ? `${entry.user_profiles.business_name}`
                            : ""}
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <span className="font-bold text-lg">{entry.total_points}</span>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* How to Earn Points */}
          <Card variant="glass" className="border-border/50 shadow-sm mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How to Earn Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { pts: "+10", label: "Complete Profile", desc: "Fill in all your details" },
                  { pts: "+20", label: "Create Business Plan", desc: "Generate your first plan" },
                  { pts: "+15", label: "Generate Ads", desc: "Create marketing content" },
                  { pts: "+10", label: "Weekly Dashboard Update", desc: "Keep your metrics current" },
                  { pts: "+50", label: "Revenue Growth Milestone", desc: "Hit your revenue targets" },
                ].map(({ pts, label, desc }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <Badge variant="secondary" className="shrink-0 mt-0.5 font-bold">
                      {pts}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      {/* Profile Popup */}
      {selectedEntry && (
        <ProfilePopup
          entry={selectedEntry.entry}
          rank={selectedEntry.rank}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
};

export default ScoreboardPage;
