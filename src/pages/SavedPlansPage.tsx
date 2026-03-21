import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Trash2, Eye, Calendar, FolderOpen, ArrowLeft } from "lucide-react";
import { BusinessIdea, BusinessPlan, UserProfile } from "@/types/business";

interface SavedPlan {
  id: string;
  plan_name: string;
  user_profile: UserProfile;
  business_idea: BusinessIdea;
  business_plan: BusinessPlan;
  created_at: string;
}

const SavedPlansPage = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("saved_business_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load saved plans");
    } else {
      // Cast the JSONB fields to their proper types
      const typedPlans = (data || []).map((item) => ({
        id: item.id,
        plan_name: item.plan_name,
        user_profile: item.user_profile as unknown as UserProfile,
        business_idea: item.business_idea as unknown as BusinessIdea,
        business_plan: item.business_plan as unknown as BusinessPlan,
        created_at: item.created_at,
      }));
      setPlans(typedPlans);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from("saved_business_plans")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete plan");
    } else {
      toast.success("Plan deleted successfully");
      setPlans(plans.filter((p) => p.id !== id));
    }
    setDeletingId(null);
  };

  const handleView = (plan: SavedPlan) => {
    sessionStorage.setItem("userProfile", JSON.stringify(plan.user_profile));
    // Use the saved plan name as the business name so it appears on the dashboard
    const businessWithCustomName = {
      ...plan.business_idea,
      name: plan.plan_name,
    };
    sessionStorage.setItem(
      "selectedBusiness",
      JSON.stringify(businessWithCustomName),
    );
    sessionStorage.setItem("loadedPlan", JSON.stringify(plan.business_plan));
    // ✅ Store the real saved plan DB id so CashFlowWidget can filter transactions correctly
    sessionStorage.setItem("currentPlanId", plan.id);
    // ✅ Clear any stale product selection from a previous plan — the saved plan has its own product data
    sessionStorage.removeItem("selectedProduct");
    navigate("/plan");
  };

  if (authLoading || isLoading) {
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4 bg-muted/20">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
            <h1 className="text-4xl font-black tracking-tight mb-2 gradient-text animate-slide-up">
              Saved Business Plans
            </h1>
            <p className="text-muted-foreground">
              Access and manage your saved business plans
            </p>
          </div>

          {plans.length === 0 ? (
            <Card variant="glass" className="border-border/50 shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved plans yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start creating business plans to save them here
                </p>
                <Button onClick={() => navigate("/start")}>
                  Create Your First Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {plans.map((plan) => (
                <Card
                  variant="glass"
                  key={plan.id}
                  className="border-border/50 shadow-sm hover:shadow-md transition-shadow animate-slide-up"
                  style={{ animationDelay: `${0.1 + (plans.indexOf(plan) * 0.05)}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {plan.business_idea.icon}
                        </span>
                        <div>
                          <CardTitle className="text-lg">
                            {plan.plan_name}
                          </CardTitle>
                          <CardDescription>
                            {plan.business_idea.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {plan.business_idea.riskLevel} Risk
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>
                        Investment: {plan.business_idea.investmentRange}
                      </span>
                      <span>•</span>
                      <span>Revenue: {plan.business_idea.expectedRevenue}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(plan.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleView(plan)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Plan
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(plan.id)}
                        disabled={deletingId === plan.id}
                      >
                        {deletingId === plan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SavedPlansPage;
