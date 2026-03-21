import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  TrendingUp,
  DollarSign,
  Eye,
  MousePointerClick,
  Target,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  MousePointer2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Campaign {
  id: string;
  platform: string;
  campaign_name: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  status: string;
}

const platformRecommendations = [
  {
    platform: "Google Ads",
    icon: "🔍",
    description: "Capture high-intent customers actively searching",
    minBudget: "₹500/day",
    bestFor: ["Services", "E-commerce", "Local businesses"],
    color: "bg-blue-500",
  },
  {
    platform: "Facebook & Instagram",
    icon: "📱",
    description: "Visual storytelling with precise targeting",
    minBudget: "₹300/day",
    bestFor: ["B2C", "Visual products", "Brand awareness"],
    color: "bg-purple-500",
  },
  {
    platform: "LinkedIn",
    icon: "💼",
    description: "Reach decision-makers and professionals",
    minBudget: "₹1000/day",
    bestFor: ["B2B", "Professional services", "Recruitment"],
    color: "bg-blue-700",
  },
  {
    platform: "YouTube",
    icon: "🎥",
    description: "Engage with video content and tutorials",
    minBudget: "₹200/day",
    bestFor: ["Education", "Entertainment", "Product demos"],
    color: "bg-red-500",
  },
];

export const AdvertisingWidget = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    platform: "",
    campaign_name: "",
    budget: "",
    start_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("advertising_campaigns")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        // Supabase CORS or 401 errors — silently degrade, don't show error toast
        console.warn("Campaigns not available (CORS/auth). Showing empty state.", error);
        setCampaigns([]);
        return;
      }
      setCampaigns(data || []);
    } catch (error) {
      // Network/CORS error (e.g. Supabase project paused or localhost blocked)
      console.warn("Could not load campaigns — network/CORS issue:", error);
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCampaign = async () => {
    if (
      !newCampaign.platform ||
      !newCampaign.campaign_name ||
      !newCampaign.budget
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const { error } = await supabase.from("advertising_campaigns").insert({
        user_id: user?.id,
        platform: newCampaign.platform,
        campaign_name: newCampaign.campaign_name,
        budget: parseFloat(newCampaign.budget),
        start_date: newCampaign.start_date,
        status: "active",
      });

      if (error) throw error;

      toast.success("Campaign added successfully!");
      setIsDialogOpen(false);
      setNewCampaign({
        platform: "",
        campaign_name: "",
        budget: "",
        start_date: new Date().toISOString().split("T")[0],
      });
      loadCampaigns();
    } catch (error) {
      console.error("Error adding campaign:", error);
      toast.error("Failed to add campaign");
    }
  };

  const calculateROI = (campaign: Campaign) => {
    if (campaign.spent === 0) return 0;
    const revenue = campaign.conversions * 1000; // Assuming ₹1000 per conversion
    return ((revenue - campaign.spent) / campaign.spent) * 100;
  };

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Advertising & Marketing
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Advertising & Marketing
            </CardTitle>
            <CardDescription>
              Platform recommendations and campaign tracking
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Campaign</DialogTitle>
                <DialogDescription>
                  Track your advertising campaigns and ROI
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Platform</Label>
                  <Select
                    value={newCampaign.platform}
                    onValueChange={(value) =>
                      setNewCampaign({ ...newCampaign, platform: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google Ads">Google Ads</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="YouTube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Campaign Name</Label>
                  <Input
                    value={newCampaign.campaign_name}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        campaign_name: e.target.value,
                      })
                    }
                    placeholder="Summer Sale 2024"
                  />
                </div>
                <div>
                  <Label>Budget (₹)</Label>
                  <Input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) =>
                      setNewCampaign({ ...newCampaign, budget: e.target.value })
                    }
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={newCampaign.start_date}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        start_date: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={handleAddCampaign} className="w-full">
                  Add Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Stats */}
        {campaigns.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-card border shadow-sm">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Total Spent
              </span>
              <span className="text-2xl font-bold tracking-tight">
                ₹{totalSpent.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                Across {campaigns.length} campaigns
              </span>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-card border shadow-sm">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Budget Active
              </span>
              <span className="text-2xl font-bold tracking-tight">
                ₹{totalBudget.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                Allocated marketing fund
              </span>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-card border shadow-sm">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Conversions
              </span>
              <span className="text-2xl font-bold tracking-tight text-primary">
                {totalConversions}
              </span>
              <span className="text-xs text-muted-foreground">
                Total acquired users
              </span>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-xl bg-card border shadow-sm">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Avg. ROI
              </span>
              <span className="text-2xl font-bold tracking-tight text-green-600">
                {campaigns.length > 0
                  ? (
                    campaigns.reduce((sum, c) => sum + calculateROI(c), 0) /
                    campaigns.length
                  ).toFixed(1)
                  : 0}
                %
              </span>
              <span className="text-xs text-muted-foreground">
                Return on ad spend
              </span>
            </div>
          </div>
        )}

        {/* Performance Chart */}
        {activeCampaigns.length > 0 && (
          <div className="h-[280px] w-full mt-4 border rounded-xl p-4 bg-card/50">
            <h4 className="font-semibold text-sm mb-4">
              Budget vs Spent (Active)
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeCampaigns}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--muted-foreground)/0.2)"
                />
                <XAxis
                  dataKey="campaign_name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <RechartsTooltip
                  cursor={{ fill: "hsl(var(--muted)/0.4)" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="text-sm font-medium mb-2">{label}</p>
                          <p className="text-sm text-muted-foreground flex items-center justify-between gap-4">
                            Budget:{" "}
                            <span className="font-bold text-foreground">
                              ₹{payload[0].value?.toLocaleString()}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center justify-between gap-4 mt-1">
                            Spent:{" "}
                            <span className="font-bold text-primary">
                              ₹{payload[1].value?.toLocaleString()}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />
                <Bar
                  dataKey="budget"
                  name="Total Budget"
                  fill="hsl(var(--muted))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="spent"
                  name="Amount Spent"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Active Campaigns Table */}
        {activeCampaigns.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 mt-8">
              <h4 className="font-semibold">Campaign Performance</h4>
            </div>
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Campaign</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Budget / Spent</th>
                      <th className="px-4 py-3 font-medium">Metrics</th>
                      <th className="px-4 py-3 font-medium text-right">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activeCampaigns.map((campaign) => {
                      const roi = calculateROI(campaign);
                      const progress =
                        campaign.budget > 0
                          ? (campaign.spent / campaign.budget) * 100
                          : 0;
                      return (
                        <tr
                          key={campaign.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">
                              {campaign.campaign_name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {campaign.platform}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Active
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5 w-32">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium">
                                  ₹{campaign.spent.toLocaleString()}
                                </span>
                                <span className="text-muted-foreground">
                                  ₹{campaign.budget.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${progress > 90 ? "bg-red-500" : progress > 75 ? "bg-orange-500" : "bg-primary"}`}
                                  style={{
                                    width: `${Math.min(progress, 100)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-4 text-xs">
                              <div
                                className="flex items-center gap-1.5"
                                title="Clicks"
                              >
                                <MousePointer2 className="h-3 w-3 text-muted-foreground" />
                                <span>{campaign.clicks}</span>
                              </div>
                              <div
                                className="flex items-center gap-1.5"
                                title="Conversions"
                              >
                                <Target className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium">
                                  {campaign.conversions}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div
                              className={`inline-flex items-center gap-1 ${roi > 0 ? "text-green-600" : roi < 0 ? "text-red-500" : "text-muted-foreground"} font-semibold`}
                            >
                              {roi > 0 ? (
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              ) : roi < 0 ? (
                                <ArrowDownRight className="h-3.5 w-3.5" />
                              ) : null}
                              {Math.abs(roi).toFixed(1)}%
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Platform Recommendations */}
        <div className="pt-6 border-t mt-8">
          <h4 className="font-semibold mb-4 text-lg">Growth Opportunities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platformRecommendations.map((rec) => (
              <div
                key={rec.platform}
                className="group p-5 border rounded-xl hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-card border flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                    {rec.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {rec.platform}
                      </h5>
                      <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        {rec.minBudget}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      {rec.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.bestFor.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] bg-muted/50 hover:bg-muted"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-xl bg-muted/10 mx-auto max-w-md mt-6">
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Scale your business</h3>
            <p className="text-sm text-muted-foreground mb-6 px-6">
              You haven't launched any advertising campaigns yet. Run ads to
              acquire customers faster.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create First Campaign
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
