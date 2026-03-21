import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BudgetPredictionFlow } from "@/components/form/BudgetPredictionFlow";
import { ProductSelector } from "@/components/recommendations/ProductSelector";
import { UserInputForm } from "@/components/form/UserInputForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, ArrowLeft } from "lucide-react";
import { BusinessIdea, Product } from "@/types/business";
import { toast } from "sonner";

const StartPage = () => {
  const navigate = useNavigate();
  const [showBudgetPrediction, setShowBudgetPrediction] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [selectedBusinessIdea, setSelectedBusinessIdea] = useState<BusinessIdea | null>(null);

  // Step 1: Budget analysis done → build a placeholder BusinessIdea, open product selector
  const handleBudgetComplete = (data: any) => {
    setShowBudgetPrediction(false);

    const ideaText = data.business_idea || "My Business";

    // Use a placeholder name — user will set the real name when they Save the plan
    const idea: BusinessIdea = {
      id: `budget-flow-${Date.now()}`,
      name: ideaText.length > 50 ? ideaText.substring(0, 50) + "…" : ideaText,
      description: ideaText,
      investmentRange: `₹${Math.round(data.user_budget || 0).toLocaleString("en-IN")}`,
      expectedRevenue: "Based on your plan",
      profitMargin: "20-30%",
      riskLevel: data.feasibility?.status === "feasible" ? "Low" : "Medium",
      breakEvenTime: "6-12 months",
      icon: "💼",
    };

    setSelectedBusinessIdea(idea);

    sessionStorage.setItem(
      "userProfile",
      JSON.stringify({
        budget: data.user_budget || 0,
        city: "India",
        interest: ideaText,
        experience: "Beginner",
      })
    );
    sessionStorage.setItem("selectedBusiness", JSON.stringify(idea));

    // Open product selector immediately — user names the business when they Save
    setProductSelectorOpen(true);
  };

  // Step 2: Product selected → navigate to plan dashboard
  const handleSelectProduct = (products: Product[]) => {
    if (products && products.length > 0) {
      const mergedProduct: Product = {
        id: products.map((p) => p.id).join(","),
        name: products.map((p) => p.name).join(", "),
        description: "Selected products: " + products.map((p) => p.name).join(", "),
        business_id: products[0].business_id,
        avg_selling_price: Math.round(
          products.reduce((sum, p) => sum + Number(p.avg_selling_price || 0), 0) /
          products.length
        ),
      };
      sessionStorage.setItem("selectedProduct", JSON.stringify(mergedProduct));
    } else {
      sessionStorage.removeItem("selectedProduct");
    }

    sessionStorage.setItem(
      "loadedPlan",
      JSON.stringify({
        rawMaterials: [],
        workforce: [],
        location: { areaType: "Local", shopSize: "TBD", rentEstimate: "TBD", setupNeeds: [] },
        pricing: { costComponents: [], costPrice: "0", marketPriceRange: "0-0", suggestedPrice: "0", profitMargin: "0%" },
        marketing: { launchPlan: [], onlineStrategies: [], offlineStrategies: [], lowBudgetIdeas: [] },
        growth: { month1to3: [], month4to6: [], expansionIdeas: [], mistakesToAvoid: [] },
      })
    );

    toast.success("Business Plan created! Redirecting to your dashboard...");
    navigate("/plan");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4 gradient-subtle">
        <div className="container">

          {/* Initial Choice Screen */}
          {!showBudgetPrediction && !showQuickStart && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
                  <Lightbulb className="w-4 h-4" />
                  <span>Choose Your Path</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 gradient-text animate-slide-up">
                  Let's Find Your Perfect Business
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto text-lg animate-slide-up" style={{ animationDelay: "100ms" }}>
                  Choose how you'd like to start your business journey
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Option 1: AI Budget Prediction */}
                <Card variant="glow" className="flex flex-col animate-slide-up" style={{ animationDelay: "200ms" }}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">AI Budget Prediction</CardTitle>
                    </div>
                    <CardDescription className="text-base text-balance">
                      Describe your idea → AI budget analysis → select products → dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">✓</span><span>AI-powered budget estimation</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">✓</span><span>Feasibility analysis</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">✓</span><span>Select products for your business</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">✓</span><span>Name your business when you save</span></li>
                    </ul>
                    <Button onClick={() => setShowBudgetPrediction(true)} className="w-full mt-auto shadow-md hover:shadow-lg" size="lg">
                      Start with AI Prediction
                    </Button>
                  </CardContent>
                </Card>

                {/* Option 2: Quick Start */}
                <Card variant="interactive" className="flex flex-col animate-slide-up" style={{ animationDelay: "300ms" }}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-secondary/10 rounded-xl">
                        <Lightbulb className="h-6 w-6 text-secondary" />
                      </div>
                      <CardTitle className="text-xl">Quick Start</CardTitle>
                    </div>
                    <CardDescription className="text-base text-balance">
                      Already know your budget? Jump straight to recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">✓</span><span>Faster process</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">✓</span><span>Enter your known budget</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">✓</span><span>Get instant recommendations</span></li>
                      <li className="flex items-start gap-2"><span className="text-primary mt-1">✓</span><span>Skip AI analysis</span></li>
                    </ul>
                    <Button onClick={() => setShowQuickStart(true)} variant="outline" className="w-full mt-auto bg-background/50 hover:bg-accent hover:text-accent-foreground shadow-sm" size="lg">
                      Skip to Form
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Budget Prediction Flow */}
          {showBudgetPrediction && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
              <Button
                variant="ghost"
                className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowBudgetPrediction(false)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to choices
              </Button>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-2">AI Budget Prediction</h1>
                <p className="text-muted-foreground">
                  Describe your business idea and get an instant budget estimate
                </p>
              </div>
              <BudgetPredictionFlow onComplete={handleBudgetComplete} />
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => { setShowBudgetPrediction(false); setShowQuickStart(true); }}
                  className="text-muted-foreground"
                >
                  Skip and enter budget manually
                </Button>
              </div>
            </div>
          )}

          {/* Quick Start — original UserInputForm */}
          {showQuickStart && (
            <div className="space-y-6 animate-in fade-in">
              <Button
                variant="ghost"
                className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowQuickStart(false)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to choices
              </Button>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Complete Your Profile</h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Answer a few questions and our AI will recommend the best business opportunities.
                </p>
              </div>
              <UserInputForm />
            </div>
          )}

        </div>
      </main>
      <Footer />

      {/* Product Selector Dialog — opens after budget analysis */}
      <ProductSelector
        open={productSelectorOpen}
        onOpenChange={setProductSelectorOpen}
        businessIdea={selectedBusinessIdea}
        onSelectProduct={handleSelectProduct}
      />
    </div>
  );
};

export default StartPage;
