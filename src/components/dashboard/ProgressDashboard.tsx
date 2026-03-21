import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { BusinessPlan, ProgressTask } from "@/types/business";
import {
  CheckCircle2,
  Circle,
  Target,
  Rocket,
  Package,
  Megaphone,
  Settings,
  TrendingUp,
  Calendar,
  Trophy,
  ListTodo,
  Milestone as MilestoneIcon,
  Clock,
  BarChart,
  LayoutGrid,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardTemplate } from "@/types/business";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProgressDashboardProps {
  plan: BusinessPlan;
}

const generateTasks = (plan: BusinessPlan): ProgressTask[] => {
  const tasks: ProgressTask[] = [
    // Setup tasks
    {
      id: "setup-1",
      title: "Register business/GSTIN",
      description: "Complete legal registration and obtain GST number",
      category: "setup",
      completed: false,
    },
    {
      id: "setup-2",
      title: "Open business bank account",
      description: "Set up dedicated account for business transactions",
      category: "setup",
      completed: false,
    },
    {
      id: "setup-3",
      title: "Finalize location",
      description: `Find ${plan.location?.shopSize || "suitable"} space in ${plan.location?.areaType || "target area"}`,
      category: "setup",
      completed: false,
    },
    {
      id: "setup-4",
      title: "Complete shop setup",
      description: "Install furniture, signage, and equipment",
      category: "setup",
      completed: false,
    },
    // Materials tasks
    {
      id: "materials-1",
      title: "Identify primary suppliers",
      description: "Finalize 2-3 reliable suppliers for raw materials",
      category: "materials",
      completed: false,
    },
    {
      id: "materials-2",
      title: "Place first order",
      description: "Order initial inventory from selected suppliers",
      category: "materials",
      completed: false,
    },
    {
      id: "materials-3",
      title: "Set up inventory tracking",
      description: "Create system to track stock levels",
      category: "materials",
      completed: false,
    },
    // Marketing tasks
    {
      id: "marketing-1",
      title: "Create social media accounts",
      description: "Set up Instagram, WhatsApp Business profiles",
      category: "marketing",
      completed: false,
    },
    {
      id: "marketing-2",
      title: "Design marketing materials",
      description: "Create banners, visiting cards, flyers",
      category: "marketing",
      completed: false,
    },
    {
      id: "marketing-3",
      title: "List on Google My Business",
      description: "Create GMB profile for local visibility",
      category: "marketing",
      completed: false,
    },
    {
      id: "marketing-4",
      title: "Plan launch offers",
      description: "Design opening discounts and promotions",
      category: "marketing",
      completed: false,
    },
    // Operations tasks
    {
      id: "operations-1",
      title: "Hire initial staff",
      description: `Recruit ${plan.workforce?.length || 1} team member(s)`,
      category: "operations",
      completed: false,
    },
    {
      id: "operations-2",
      title: "Create pricing list",
      description: "Finalize product/service pricing",
      category: "operations",
      completed: false,
    },
    {
      id: "operations-3",
      title: "Set up billing system",
      description: "Install POS or billing software",
      category: "operations",
      completed: false,
    },
    // Growth tasks
    {
      id: "growth-1",
      title: "Reach 50 customers",
      description: "Build initial customer base",
      category: "growth",
      completed: false,
    },
    {
      id: "growth-2",
      title: "Get first 10 reviews",
      description: "Collect customer reviews on Google",
      category: "growth",
      completed: false,
    },
    {
      id: "growth-3",
      title: "Start delivery service",
      description: "Expand with home delivery option",
      category: "growth",
      completed: false,
    },
  ];
  return tasks;
};

const categoryConfig = {
  setup: {
    label: "Setup",
    icon: Settings,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  materials: {
    label: "Materials",
    icon: Package,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  marketing: {
    label: "Marketing",
    icon: Megaphone,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  operations: {
    label: "Operations",
    icon: Target,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  growth: {
    label: "Growth",
    icon: TrendingUp,
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  },
};

export const ProgressDashboard = ({ plan }: ProgressDashboardProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ProgressTask[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [template, setTemplate] = useState<DashboardTemplate>("checklist");

  useEffect(() => {
    // Load template from localStorage
    const savedTemplate = localStorage.getItem(
      `dashboard-template-${plan.idea.id}`,
    );
    if (savedTemplate) {
      setTemplate(savedTemplate as DashboardTemplate);
    }
  }, [plan.idea.id]);

  useEffect(() => {
    // Save template to localStorage
    localStorage.setItem(`dashboard-template-${plan.idea.id}`, template);
  }, [template, plan.idea.id]);

  useEffect(() => {
    // Load tasks from localStorage or generate new ones
    const savedTasks = localStorage.getItem(`progress-${plan.idea.id}`);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(generateTasks(plan));
    }
  }, [plan]);

  useEffect(() => {
    // Save tasks to localStorage
    if (tasks.length > 0) {
      localStorage.setItem(`progress-${plan.idea.id}`, JSON.stringify(tasks));
    }
  }, [tasks, plan.idea.id]);

  const handleTaskComplete = async () => {
    if (!user) return;
    // Current UTC week number approximation
    const weekKey = `dashboard-points-${user.id}-${Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))}`;
    if (!localStorage.getItem(weekKey)) {
      localStorage.setItem(weekKey, "true");
      await supabase.rpc("award_points", {
        p_user_id: user.id,
        p_activity_type: "dashboard_update",
        p_points: 10,
        p_description: "Weekly dashboard update"
      });
      toast.success("🏅 +10 Points for keeping your dashboard updated!");
    }
  };

  const toggleTask = (taskId: string) => {
    let newlyCompleted = false;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
           if (!task.completed) newlyCompleted = true;
           return { ...task, completed: !task.completed };
        }
        return task;
      })
    );
    if (newlyCompleted) {
      handleTaskComplete();
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.category === filter);

  const categoryStats = Object.keys(categoryConfig).map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat);
    const completed = catTasks.filter((t) => t.completed).length;
    return {
      category: cat as keyof typeof categoryConfig,
      total: catTasks.length,
      completed,
      percent: catTasks.length > 0 ? (completed / catTasks.length) * 100 : 0,
    };
  });

  const renderTemplate = () => {
    switch (template) {
      case "checklist":
        return (
          <div className="space-y-6">
            {/* Category Stats - Mini view */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categoryStats.map((stat) => {
                const config = categoryConfig[stat.category];
                const Icon = config.icon;
                return (
                  <Card
                    key={stat.category}
                    variant="interactive"
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      filter === stat.category ? "ring-2 ring-primary border-primary/50" : "border-border/50"
                    }`}
                    onClick={() =>
                      setFilter(
                        filter === stat.category ? "all" : stat.category,
                      )
                    }
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground mb-1">
                        {config.label}
                      </p>
                      <p className="text-lg font-bold">
                        {stat.completed}/{stat.total}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Task List */}
            <Card variant="glass" className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {filter === "all"
                    ? "All Tasks"
                    : categoryConfig[filter as keyof typeof categoryConfig]
                        ?.label + " Tasks"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredTasks.map((task) => {
                  const config = categoryConfig[task.category];
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                        task.completed
                          ? "bg-muted/30 opacity-70"
                          : "bg-background hover:bg-muted/20"
                      }`}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`font-medium ${
                              task.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      </div>
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        );

      case "milestones":
        return (
          <div className="space-y-8 py-4">
            {Object.entries(categoryConfig).map(([key, config], index) => {
              const stat = categoryStats.find((s) => s.category === key);
              const Icon = config.icon;
              const isCompleted = stat?.percent === 100;
              const hasStarted = (stat?.completed || 0) > 0;

              return (
                <div key={key} className="relative flex gap-6">
                  {/* Connector Line */}
                  {index < Object.entries(categoryConfig).length - 1 && (
                    <div className="absolute left-6 top-12 bottom-[-32px] w-0.5 bg-muted-foreground/20" />
                  )}

                  {/* Icon Node */}
                  <div
                    className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : hasStarted
                          ? "bg-background border-primary text-primary"
                          : "bg-background border-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-lg font-bold">
                        {config.label} Milestone
                      </h4>
                      <Badge variant={isCompleted ? "default" : "outline"}>
                        {Math.round(stat?.percent || 0)}%
                      </Badge>
                    </div>
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {tasks
                            .filter((t) => t.category === key)
                            .map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center gap-3"
                              >
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() => toggleTask(task.id)}
                                />
                                <span
                                  className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}
                                >
                                  {task.title}
                                </span>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "timeline":
        const phases = [
          { name: "Week 1: Setup", categories: ["setup"] },
          {
            name: "Week 2-3: Resources",
            categories: ["materials", "operations"],
          },
          { name: "Week 4: Marketing", categories: ["marketing"] },
          { name: "Month 2+: Growth", categories: ["growth"] },
        ];

        return (
          <div className="space-y-6">
            <div className="relative border-l-2 border-primary/20 ml-3 pl-8 space-y-10">
              {phases.map((phase, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[41px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                  <h4 className="font-bold text-lg mb-4 text-primary">
                    {phase.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks
                      .filter((t) => phase.categories.includes(t.category))
                      .map((task) => (
                        <Card
                          key={task.id}
                          variant="interactive"
                          className={`transition-all border-border/50 ${task.completed ? "bg-muted/30 opacity-70" : "hover:shadow-md"}`}
                        >
                          <CardContent className="p-4 flex gap-3">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => toggleTask(task.id)}
                              className="mt-1"
                            />
                            <div>
                              <p
                                className={`font-medium text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}
                              >
                                {task.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {task.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "metrics":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="glass" className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Completion by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryStats.map((stat) => (
                    <div key={stat.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{categoryConfig[stat.category].label}</span>
                        <span>{Math.round(stat.percent)}%</span>
                      </div>
                      <Progress value={stat.percent} className="h-2 bg-muted/50" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card variant="glass" className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Progress Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Total Tasks</span>
                      <span className="font-bold">{totalCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-500/10 text-green-600 rounded-lg">
                      <span className="text-sm">Completed</span>
                      <span className="font-bold">{completedCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-500/10 text-amber-600 rounded-lg">
                      <span className="text-sm">Remaining</span>
                      <span className="font-bold">
                        {totalCount - completedCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card variant="glass" className="border-primary/20 bg-primary/5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-primary">
                  Weekly Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8 bg-muted/20 rounded-xl border-2 border-dashed border-muted">
                  <div className="text-center">
                    <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm max-w-[200px]">
                      Complete 3 more tasks this week to stay on track!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Template Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Progress Tracking</h2>
          <p className="text-muted-foreground">
            Choose how you want to track your business launch
          </p>
        </div>

        <Tabs
          value={template}
          onValueChange={(v) => setTemplate(v as DashboardTemplate)}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="checklist" title="Checklist">
              <ListTodo className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="milestones" title="Milestones">
              <MilestoneIcon className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Milestones</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" title="Timeline">
              <Clock className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" title="Metrics">
              <BarChart className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Metrics</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overall Progress */}
      <Card variant="glass" className="overflow-hidden border-primary/20 shadow-xl">
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_50%)]" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                <Rocket className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">
                  Launch Progress
                </h3>
                <p className="text-primary-foreground/90 font-medium">
                  Track your journey to launch
                </p>
              </div>
            </div>
            {progressPercent === 100 && (
              <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-md shadow-sm gap-1.5 px-3 py-1">
                <Trophy className="h-4 w-4 text-warning" />
                <span className="font-bold tracking-wide">Complete!</span>
              </Badge>
            )}
          </div>
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between text-sm text-primary-foreground/90 font-semibold mb-1">
              <span>
                {completedCount} of {totalCount} tasks completed
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress
              value={progressPercent}
              className="h-4 bg-black/20 overflow-hidden shadow-inner"
            />
          </div>
        </div>
      </Card>

      {/* Dynamic Template Content */}
      <div className="animate-fade-in">{renderTemplate()}</div>

      {/* Reset Progress */}
      <div className="text-center pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => {
            if (confirm("Reset all progress? This cannot be undone.")) {
              setTasks(generateTasks(plan));
              localStorage.removeItem(`progress-${plan.idea.id}`);
            }
          }}
        >
          Reset All Progress
        </Button>
      </div>
    </div>
  );
};
