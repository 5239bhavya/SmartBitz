import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  DollarSign,
  Package,
  Megaphone,
  Users,
  ShoppingCart,
  BarChart3,
  Truck,
} from "lucide-react";

const TRACKING_PARAMETERS = [
  {
    id: "sales",
    label: "Sales Tracking",
    icon: TrendingUp,
    description: "Monitor daily/weekly/monthly sales",
  },
  {
    id: "expenses",
    label: "Expense Tracking",
    icon: DollarSign,
    description: "Track all business expenses",
  },
  {
    id: "profit_loss",
    label: "Profit & Loss",
    icon: BarChart3,
    description: "Calculate profit margins",
  },
  {
    id: "inventory",
    label: "Inventory Management",
    icon: Package,
    description: "Track stock levels",
  },
  {
    id: "marketing",
    label: "Marketing Performance",
    icon: Megaphone,
    description: "Monitor campaign ROI",
  },
  {
    id: "customers",
    label: "Customer Growth",
    icon: Users,
    description: "Track customer acquisition",
  },
  {
    id: "exports",
    label: "Export Performance",
    icon: Truck,
    description: "Monitor export orders",
  },
  {
    id: "raw_materials",
    label: "Raw Material Costs",
    icon: ShoppingCart,
    description: "Track material expenses",
  },
  {
    id: "advertising",
    label: "Advertisement Analytics",
    icon: Megaphone,
    description: "Analyze ad performance",
  },
];

const BUSINESS_PLANS = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential tracking for startups",
    features: ["Sales & Expenses", "Basic Analytics", "Monthly Reports"],
  },
  {
    id: "growth",
    name: "Growth",
    description: "Advanced features for growing businesses",
    features: [
      "All Basic Features",
      "Inventory Management",
      "Marketing Analytics",
      "Weekly Reports",
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Complete suite for established businesses",
    features: [
      "All Growth Features",
      "Export Tracking",
      "Custom Dashboards",
      "Daily Reports",
      "AI Insights",
    ],
  },
];

const TrackingParametersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("basic");
  const [isLoading, setIsLoading] = useState(false);

  const toggleParameter = (parameterId: string) => {
    setSelectedParameters((prev) =>
      prev.includes(parameterId)
        ? prev.filter((id) => id !== parameterId)
        : [...prev, parameterId],
    );
  };

  const handleSave = async () => {
    if (selectedParameters.length === 0) {
      toast.error("Please select at least one tracking parameter");
      return;
    }

    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("tracking_parameters").upsert({
        user_id: user.id,
        parameters: selectedParameters,
        business_plan_type: selectedPlan,
      });

      if (error) throw error;

      toast.success("Tracking preferences saved successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving tracking parameters:", error);
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 mb-10 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 gradient-text">Customize Your Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Select how you'd like to track your business progress
            </p>
          </div>

          {/* Business Plan Selection */}
          <Card variant="glass" className="border-border/50 shadow-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>Choose Your Business Plan</CardTitle>
              <CardDescription>
                Select a plan that matches your business needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {BUSINESS_PLANS.map((plan) => (
                    <div key={plan.id} className="relative">
                      <RadioGroupItem
                        value={plan.id}
                        id={plan.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={plan.id}
                        className="flex flex-col p-5 border-2 border-border/50 rounded-2xl cursor-pointer bg-background/40 backdrop-blur-sm hover:border-primary/50 transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-md"
                      >
                        <span className="font-semibold text-lg">
                          {plan.name}
                        </span>
                        <span className="text-sm text-muted-foreground mb-3">
                          {plan.description}
                        </span>
                        <ul className="space-y-1 text-xs">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="text-primary">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Tracking Parameters Selection */}
          <Card variant="glass" className="border-border/50 shadow-sm mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle>Select Tracking Parameters</CardTitle>
              <CardDescription>
                Choose the metrics you want to monitor on your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TRACKING_PARAMETERS.map((param) => {
                  const Icon = param.icon;
                  return (
                    <div
                      key={param.id}
                      className="flex items-start space-x-3 p-4 border border-border/50 rounded-xl bg-background/40 backdrop-blur-sm hover:border-primary/30 transition-all cursor-pointer"
                      onClick={() => toggleParameter(param.id)}
                    >
                      <Checkbox
                        id={param.id}
                        checked={selectedParameters.includes(param.id)}
                        onCheckedChange={() => toggleParameter(param.id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={param.id}
                          className="flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          {param.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {param.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Summary */}
          {selectedParameters.length > 0 && (
            <Card variant="glass" className="bg-primary/5 border-primary/20 mt-8 shadow-sm animate-fade-in">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {selectedParameters.length} parameter
                      {selectedParameters.length > 1 ? "s" : ""} selected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Plan:{" "}
                      <span className="capitalize font-medium">
                        {selectedPlan}
                      </span>
                    </p>
                  </div>
                  <Button onClick={handleSave} disabled={isLoading} size="lg">
                    {isLoading ? "Saving..." : "Save & Continue to Dashboard"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackingParametersPage;
