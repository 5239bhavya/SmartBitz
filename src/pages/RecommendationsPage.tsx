import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BusinessCard } from "@/components/recommendations/BusinessCard";
import { Button } from "@/components/ui/button";
import { UserProfile, BusinessIdea, Product } from "@/types/business";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ProductSelector } from "@/components/recommendations/ProductSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productSelectorOpen, setProductSelectorOpen] = useState(false);
  const [selectedBusinessIdea, setSelectedBusinessIdea] =
    useState<BusinessIdea | null>(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("userProfile");
    if (stored) {
      const profile = JSON.parse(stored);
      setUserProfile(profile);
      if (!hasFetched.current) {
        generateRecommendations(profile);
        hasFetched.current = true;
      }
    } else {
      navigate("/start");
    }
  }, [navigate]);

  const generateRecommendations = async (profile: UserProfile) => {
    setIsLoading(true);
    setError(null);

    try {
      // TEMPORARY: Using backend endpoint instead of Supabase Edge Function
      // TODO: Switch back to Edge Function once deployed
      const response = await fetch(
        "http://localhost:5000/api/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userProfile: profile }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to generate recommendations",
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setIdeas(data.ideas || []);
    } catch (err) {
      console.error("Error generating recommendations:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to generate recommendations";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedIdea) {
      const idea = ideas.find((i) => i.id === selectedIdea);
      if (idea) {
        setSelectedBusinessIdea(idea);
        setProductSelectorOpen(true);
      }
    }
  };

  const handleSelectProduct = (products: Product[]) => {
    if (!selectedBusinessIdea) return;

    sessionStorage.setItem(
      "selectedBusiness",
      JSON.stringify(selectedBusinessIdea),
    );

    if (products && products.length > 0) {
      const mergedProduct: Product = {
        id: products.map((p) => p.id).join(","),
        name: products.map((p) => p.name).join(", "),
        description:
          "Selected products: " + products.map((p) => p.name).join(", "),
        business_id: products[0].business_id,
        avg_selling_price: Math.round(
          products.reduce(
            (sum, p) => sum + Number(p.avg_selling_price || 0),
            0,
          ) / products.length,
        ),
      };
      sessionStorage.setItem("selectedProduct", JSON.stringify(mergedProduct));
    } else {
      sessionStorage.removeItem("selectedProduct");
    }

    navigate("/plan");
  };

  const handleRetry = () => {
    if (userProfile) {
      generateRecommendations(userProfile);
    }
  };

  if (!userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary mb-6 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Recommendations
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Your Recommended Business Ideas
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              Based on your budget of ₹
              {parseInt(userProfile.budget).toLocaleString("en-IN")}
              in {userProfile.city}, here are the top opportunities in{" "}
              {userProfile.interest}.
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">
                Generating personalized recommendations...
              </p>
              <p className="text-sm text-muted-foreground">
                This may take a few seconds
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-lg font-medium text-destructive mb-4">
                {error}
              </p>
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
                {ideas.map((idea, index) => (
                  <div
                    key={idea.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <BusinessCard
                      idea={idea}
                      isSelected={selectedIdea === idea.id}
                      onSelect={() => setSelectedIdea(idea.id)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t">
                <Button variant="outline" onClick={() => navigate("/start")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Modify Inputs
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    size="lg"
                    disabled={!selectedIdea}
                    onClick={handleContinue}
                    className="group"
                  >
                    Generate Complete Plan
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Product Selection Modal */}
      <ProductSelector
        open={productSelectorOpen}
        onOpenChange={setProductSelectorOpen}
        businessIdea={selectedBusinessIdea}
        onSelectProduct={handleSelectProduct}
      />
    </div>
  );
};

export default RecommendationsPage;
