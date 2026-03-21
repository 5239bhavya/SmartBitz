import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BusinessPlan } from "@/types/business";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  PlusCircle,
  Trash2,
  PieChart,
} from "lucide-react";

interface CostCalculatorProps {
  plan: BusinessPlan;
}

interface ExpenseItem {
  id: string;
  name: string;
  projected: number;
  actual: number;
}

const parseAmount = (str: string): number => {
  const match = str.match(/[\d,]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/,/g, ""), 10);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const CostCalculator = ({ plan }: CostCalculatorProps) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [newExpenseName, setNewExpenseName] = useState("");

  useEffect(() => {
    // Initialize with projected costs from plan
    const initialExpenses: ExpenseItem[] = [
      {
        id: "rent",
        name: "Rent",
        projected: parseAmount(plan.location?.rentEstimate || "10000"),
        actual: 0,
      },
      {
        id: "materials",
        name: "Raw Materials",
        projected: parseAmount(
          plan.rawMaterials?.[0]?.estimatedCost || "20000",
        ),
        actual: 0,
      },
      {
        id: "staff",
        name: "Staff Salaries",
        projected:
          plan.workforce?.reduce(
            (sum, w) => sum + parseAmount(w.estimatedSalary) * w.count,
            0,
          ) || 15000,
        actual: 0,
      },
      {
        id: "utilities",
        name: "Utilities",
        projected: 5000,
        actual: 0,
      },
      {
        id: "marketing",
        name: "Marketing",
        projected: 3000,
        actual: 0,
      },
      {
        id: "misc",
        name: "Miscellaneous",
        projected: 2000,
        actual: 0,
      },
    ];

    // Load saved data
    const savedData = localStorage.getItem(`costs-${plan.idea.id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setExpenses(parsed.expenses || initialExpenses);
      setMonthlyRevenue(parsed.revenue || 0);
    } else {
      setExpenses(initialExpenses);
    }
  }, [plan]);

  useEffect(() => {
    // Save to localStorage
    if (expenses.length > 0) {
      localStorage.setItem(
        `costs-${plan.idea.id}`,
        JSON.stringify({
          expenses,
          revenue: monthlyRevenue,
        }),
      );
    }
  }, [expenses, monthlyRevenue, plan.idea.id]);

  const updateActual = (id: string, value: number) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, actual: value } : e)),
    );
  };

  const addExpense = () => {
    if (!newExpenseName.trim()) return;
    setExpenses((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: newExpenseName.trim(),
        projected: 0,
        actual: 0,
      },
    ]);
    setNewExpenseName("");
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const totalProjected = expenses.reduce((sum, e) => sum + e.projected, 0);
  const totalActual = expenses.reduce((sum, e) => sum + e.actual, 0);
  const variance = totalActual - totalProjected;
  const variancePercent =
    totalProjected > 0 ? (variance / totalProjected) * 100 : 0;
  const profit = monthlyRevenue - totalActual;
  const profitMargin = monthlyRevenue > 0 ? (profit / monthlyRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Projected Costs
            </p>
            <p className="text-xl font-bold">
              {formatCurrency(totalProjected)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Actual Costs</p>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(totalActual)}
            </p>
          </CardContent>
        </Card>
        <Card
          className={
            variance > 0 ? "border-destructive/50" : "border-success/50"
          }
        >
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Variance</p>
            <p
              className={`text-xl font-bold flex items-center justify-center gap-1 ${variance > 0 ? "text-destructive" : "text-success"}`}
            >
              {variance > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {formatCurrency(Math.abs(variance))}
            </p>
            <p
              className={`text-xs ${variance > 0 ? "text-destructive" : "text-success"}`}
            >
              {variancePercent > 0 ? "+" : ""}
              {variancePercent.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card
          className={
            profit >= 0 ? "border-success/50" : "border-destructive/50"
          }
        >
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Monthly Profit</p>
            <p
              className={`text-xl font-bold ${profit >= 0 ? "text-success" : "text-destructive"}`}
            >
              {formatCurrency(profit)}
            </p>
            <p className="text-xs text-muted-foreground">
              {profitMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IndianRupee className="h-5 w-5" />
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              placeholder="Enter monthly revenue"
              value={monthlyRevenue || ""}
              onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
              className="max-w-xs"
            />
            <span className="text-sm text-muted-foreground">
              Projected: {plan.idea.expectedRevenue}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChart className="h-5 w-5" />
            Expense Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {expenses.map((expense) => {
            const diff = expense.actual - expense.projected;
            const diffPercent =
              expense.projected > 0 ? (diff / expense.projected) * 100 : 0;
            const isOverBudget = diff > 0;

            return (
              <div key={expense.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">{expense.name}</Label>
                    {expense.actual > 0 && (
                      <Badge
                        variant="outline"
                        className={
                          isOverBudget
                            ? "border-destructive/50 text-destructive"
                            : "border-success/50 text-success"
                        }
                      >
                        {isOverBudget ? (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        {diffPercent > 0 ? "+" : ""}
                        {diffPercent.toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                  {expense.id.startsWith("custom-") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Projected
                    </p>
                    <Input
                      type="number"
                      value={expense.projected || ""}
                      onChange={(e) =>
                        setExpenses((prev) =>
                          prev.map((ex) =>
                            ex.id === expense.id
                              ? { ...ex, projected: Number(e.target.value) }
                              : ex,
                          ),
                        )
                      }
                      className="bg-muted/30"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Actual</p>
                    <Input
                      type="number"
                      value={expense.actual || ""}
                      onChange={(e) =>
                        updateActual(expense.id, Number(e.target.value))
                      }
                      placeholder="Enter actual cost"
                    />
                  </div>
                </div>
                {expense.projected > 0 && (
                  <Progress
                    value={Math.min(
                      (expense.actual / expense.projected) * 100,
                      150,
                    )}
                    className="h-2"
                  />
                )}
              </div>
            );
          })}

          {/* Add New Expense */}
          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="New expense name..."
              value={newExpenseName}
              onChange={(e) => setNewExpenseName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addExpense()}
            />
            <Button onClick={addExpense} variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis */}
      {totalActual > 0 && (
        <Card
          className={
            variance > totalProjected * 0.1
              ? "border-destructive/50 bg-destructive/5"
              : "border-success/50 bg-success/5"
          }
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {variance > totalProjected * 0.1 ? (
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">
                  {variance > totalProjected * 0.1
                    ? "Costs are higher than projected"
                    : "You're within budget!"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {variance > totalProjected * 0.1
                    ? `Your actual costs are ${variancePercent.toFixed(1)}% over budget. Consider reviewing ${expenses.find((e) => e.actual > e.projected * 1.2)?.name || "high-cost items"}.`
                    : `Great job! You're spending ${Math.abs(variancePercent).toFixed(1)}% ${variance < 0 ? "under" : "close to"} your projections.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset */}
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            localStorage.removeItem(`costs-${plan.idea.id}`);
            window.location.reload();
          }}
        >
          Reset All Data
        </Button>
      </div>
    </div>
  );
};
