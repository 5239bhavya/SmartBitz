import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessIdea } from "@/types/business";
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessCardProps {
  idea: BusinessIdea;
  isSelected: boolean;
  onSelect: () => void;
}

export function BusinessCard({
  idea,
  isSelected,
  onSelect,
}: BusinessCardProps) {
  const riskColors = {
    Low: "bg-success/10 text-success border-success/20",
    Medium: "bg-warning/10 text-warning border-warning/20",
    High: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Card
      variant={isSelected ? "selected" : "interactive"}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isSelected && "ring-2 ring-primary ring-offset-2",
      )}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary text-primary-foreground">Selected</Badge>
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-3xl">
            {idea.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{idea.name}</h3>
            <Badge variant="outline" className={riskColors[idea.riskLevel]}>
              {idea.riskLevel} Risk
            </Badge>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          {idea.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IndianRupee className="h-3 w-3" />
              Investment
            </div>
            <p className="text-sm font-medium">{idea.investmentRange}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Expected Revenue
            </div>
            <p className="text-sm font-medium">{idea.expectedRevenue}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              Profit Margin
            </div>
            <p className="text-sm font-medium text-success">
              {idea.profitMargin}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Break-even
            </div>
            <p className="text-sm font-medium">{idea.breakEvenTime}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full group"
          variant={isSelected ? "default" : "outline"}
        >
          {isSelected ? "Selected" : "Select This Business"}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
