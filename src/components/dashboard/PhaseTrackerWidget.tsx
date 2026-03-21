import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Target,
  CheckCircle2,
  Circle,
  Lightbulb,
  Rocket,
  TrendingUp,
  Zap,
  Loader2,
} from "lucide-react";

interface Milestone {
  id: string;
  phase: string;
  milestone_name: string;
  description: string;
  completed: boolean;
  order_index: number;
}

const phaseIcons = {
  idea: Lightbulb,
  launch: Rocket,
  growth: TrendingUp,
  scale: Zap,
};

const phaseColors = {
  idea: "bg-blue-500",
  launch: "bg-green-500",
  growth: "bg-orange-500",
  scale: "bg-purple-500",
};

const phaseLabels = {
  idea: "Idea Phase",
  launch: "Launch Phase",
  growth: "Growth Phase",
  scale: "Scale Phase",
};

export const PhaseTrackerWidget = () => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>("idea");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMilestones();
    }
  }, [user]);

  const loadMilestones = async () => {
    try {
      const { data, error } = await supabase
        .from("business_milestones")
        .select("*")
        .eq("user_id", user?.id)
        .order("phase")
        .order("order_index");

      if (error) throw error;

      setMilestones(data || []);
      determineCurrentPhase(data || []);
    } catch (error) {
      console.error("Error loading milestones:", error);
      toast.error("Failed to load milestones");
    } finally {
      setIsLoading(false);
    }
  };

  const determineCurrentPhase = (allMilestones: Milestone[]) => {
    const phases = ["idea", "launch", "growth", "scale"];

    for (const phase of phases) {
      const phaseMilestones = allMilestones.filter((m) => m.phase === phase);
      const completed = phaseMilestones.filter((m) => m.completed).length;

      if (completed < phaseMilestones.length) {
        setCurrentPhase(phase);
        return;
      }
    }

    setCurrentPhase("scale");
  };

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("business_milestones")
        .update({
          completed,
          completed_date: completed ? new Date().toISOString() : null,
        })
        .eq("id", milestoneId);

      if (error) throw error;

      // Update local state
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? { ...m, completed } : m)),
      );

      // Recalculate current phase
      const updated = milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed } : m,
      );
      determineCurrentPhase(updated);

      if (completed) {
        toast.success("Milestone completed! 🎉");
      }
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast.error("Failed to update milestone");
    }
  };

  const calculatePhaseProgress = (phase: string) => {
    const phaseMilestones = milestones.filter((m) => m.phase === phase);
    if (phaseMilestones.length === 0) return 0;

    const completed = phaseMilestones.filter((m) => m.completed).length;
    return Math.round((completed / phaseMilestones.length) * 100);
  };

  const currentPhaseMilestones = milestones.filter(
    (m) => m.phase === currentPhase,
  );
  const overallProgress = Math.round(
    (milestones.filter((m) => m.completed).length / milestones.length) * 100,
  );

  const PhaseIcon = phaseIcons[currentPhase as keyof typeof phaseIcons];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Business Phase Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Phase Tracker
          </CardTitle>
          <Badge
            variant="outline"
            className={`font-medium ${overallProgress === 100 ? "bg-green-100 text-green-700 dark:bg-green-900/30" : ""}`}
          >
            {overallProgress}% Overall
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        {/* Current Phase Header */}
        <div className="bg-muted/30 p-5 flex items-center gap-5 border-b">
          {/* Radial Progress Ring */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                className="text-muted stroke-current"
                strokeWidth="6"
                cx="32"
                cy="32"
                r="28"
                fill="transparent"
              ></circle>
              <circle
                className={`${phaseColors[currentPhase as keyof typeof phaseColors].replace("bg-", "text-")} stroke-current transition-all duration-1000 ease-out`}
                strokeWidth="6"
                strokeLinecap="round"
                cx="32"
                cy="32"
                r="28"
                fill="transparent"
                strokeDasharray="175.93"
                strokeDashoffset={
                  175.93 - (175.93 * calculatePhaseProgress(currentPhase)) / 100
                }
              ></circle>
            </svg>
            <div className="absolute flex items-center justify-center w-full h-full">
              <PhaseIcon
                className={`h-6 w-6 ${phaseColors[currentPhase as keyof typeof phaseColors].replace("bg-", "text-")}`}
              />
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
              Current Phase
            </p>
            <h3 className="font-bold text-xl leading-none mb-1">
              {phaseLabels[currentPhase as keyof typeof phaseLabels]}
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60"></span>
              {calculatePhaseProgress(currentPhase)}% Phase completed
            </p>
          </div>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {/* Phase Tabs/Pills (Visual Indicator) */}
          <div className="flex items-center justify-between mb-6 pb-2 relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted/50 -z-10 -translate-y-1/2 rounded-full"></div>

            {Object.keys(phaseLabels).map((phase, index) => {
              const Icon = phaseIcons[phase as keyof typeof phaseIcons];
              const isActive = phase === currentPhase;
              const isPast = milestones
                .filter((m) => m.phase === phase)
                .every((m) => m.completed);

              return (
                <div
                  key={phase}
                  className="flex flex-col items-center gap-1.5 z-10 bg-card px-1"
                >
                  <div
                    className={`
                                        h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors
                                        ${
                                          isActive
                                            ? `border-primary bg-primary/10 text-primary`
                                            : isPast
                                              ? `border-muted-foreground/30 bg-muted text-muted-foreground`
                                              : `border-muted text-muted-foreground/50 bg-background`
                                        }
                                    `}
                  >
                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? "text-primary" : "text-muted-foreground/60"}`}
                  >
                    {phase}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current Phase Milestones Checklist */}
          <div>
            <div className="space-y-3">
              {currentPhaseMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`
                                        group flex items-start gap-3 p-3 rounded-xl transition-all border
                                        ${
                                          milestone.completed
                                            ? "bg-muted/30 border-transparent opacity-75 grayscale-[0.3]"
                                            : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
                                        }
                                    `}
                >
                  <Checkbox
                    checked={milestone.completed}
                    onCheckedChange={(checked) =>
                      toggleMilestone(milestone.id, checked as boolean)
                    }
                    className="mt-1 flex-shrink-0 transition-all data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm transition-all ${milestone.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {milestone.milestone_name}
                    </p>
                    {milestone.description && (
                      <p
                        className={`text-xs mt-1 transition-all ${milestone.completed ? "text-muted-foreground/70" : "text-muted-foreground"}`}
                      >
                        {milestone.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps Footer */}
          {overallProgress === 100 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-900/30 flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-green-800 dark:text-green-300">
                  All Phases Complete
                </h4>
                <p className="text-xs text-green-600 dark:text-green-400/80 mt-0.5">
                  You're ready to scale. Keep crushing it!
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
