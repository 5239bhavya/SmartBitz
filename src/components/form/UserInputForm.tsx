import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepIndicator } from "./StepIndicator";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { UserProfile } from "@/types/business";
import { useToast } from "@/hooks/use-toast";

const steps = ["Budget", "Location", "Interest", "Experience"];

const interestOptions = [
  { value: "food", label: "Food & Beverages", emoji: "🍽️" },
  { value: "retail", label: "Retail & Trading", emoji: "🏪" },
  { value: "service", label: "Service Business", emoji: "🔧" },
  { value: "manufacturing", label: "Manufacturing", emoji: "🏭" },
  { value: "education", label: "Education & Training", emoji: "📚" },
  { value: "health", label: "Health & Wellness", emoji: "💊" },
];

interface UserInputFormProps {
  initialBudget?: string;
}

export function UserInputForm({ initialBudget }: UserInputFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    budget: initialBudget || "",
    city: "",
    interest: "",
    experience: "beginner",
  });

  const handleNext = () => {
    if (currentStep === 0 && !formData.budget) {
      toast({ title: "Please enter your budget", variant: "destructive" });
      return;
    }
    if (currentStep === 1 && !formData.city) {
      toast({ title: "Please enter your city", variant: "destructive" });
      return;
    }
    if (currentStep === 2 && !formData.interest) {
      toast({
        title: "Please select an interest area",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);

    // Store form data in session storage for the next page
    sessionStorage.setItem("userProfile", JSON.stringify(formData));
    navigate("/recommendations");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-base">
                What's your investment budget?
              </Label>
              <p className="text-sm text-muted-foreground">
                Enter the amount you're willing to invest (in ₹)
              </p>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                ₹
              </span>
              <Input
                id="budget"
                type="text"
                placeholder="e.g., 500000"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                className="pl-8 h-12 text-lg"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {["100000", "300000", "500000", "1000000"].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, budget: amount })}
                  className={
                    formData.budget === amount
                      ? "border-primary bg-primary/5"
                      : ""
                  }
                >
                  ₹{parseInt(amount).toLocaleString("en-IN")}
                </Button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-base">
                Where do you want to start your business?
              </Label>
              <p className="text-sm text-muted-foreground">
                Enter your city or region in India
              </p>
            </div>
            <Input
              id="city"
              type="text"
              placeholder="e.g., Mumbai, Delhi, Bangalore"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="h-12 text-lg"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">What's your area of interest?</Label>
              <p className="text-sm text-muted-foreground">
                Select the industry you're most interested in
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, interest: option.value })
                  }
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    formData.interest === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-medium text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">What's your experience level?</Label>
              <p className="text-sm text-muted-foreground">
                This helps us tailor recommendations to your needs
              </p>
            </div>
            <RadioGroup
              value={formData.experience}
              onValueChange={(value: "beginner" | "experienced") =>
                setFormData({ ...formData, experience: value })
              }
              className="space-y-3"
            >
              <label
                className={`flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  formData.experience === "beginner"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="beginner" className="mt-1" />
                <div>
                  <div className="font-medium">Beginner</div>
                  <div className="text-sm text-muted-foreground">
                    First time starting a business, need detailed guidance
                  </div>
                </div>
              </label>
              <label
                className={`flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  formData.experience === "experienced"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="experienced" className="mt-1" />
                <div>
                  <div className="font-medium">Experienced</div>
                  <div className="text-sm text-muted-foreground">
                    Have prior business experience, looking for new
                    opportunities
                  </div>
                </div>
              </label>
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <StepIndicator steps={steps} currentStep={currentStep} />

      <Card variant="elevated" className="animate-scale-in">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">
            {currentStep === 0 && "Investment Budget"}
            {currentStep === 1 && "Business Location"}
            {currentStep === 2 && "Interest Area"}
            {currentStep === 3 && "Experience Level"}
          </CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {renderStep()}

          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={currentStep === 0 ? "invisible" : ""}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Ideas...
                </>
              ) : currentStep === steps.length - 1 ? (
                "Generate Business Ideas"
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
