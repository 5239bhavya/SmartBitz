import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { BusinessIdea } from "@/types/business";
import { TrendingUp, PieChart as PieChartIcon, Activity, Database } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface FinancialChartsProps {
  idea: BusinessIdea;
  planId?: string;
  refreshKey?: number;  // bumps when a transaction is added → triggers live refetch
  pricing?: {
    costComponents?: string[];
    costPrice: string;
    suggestedPrice: string;
    profitMargin: string;
  };
}

export function FinancialCharts({ idea, pricing, planId, refreshKey }: FinancialChartsProps) {
  const { user } = useAuth();
  const [realTransactions, setRealTransactions] = useState<any[]>([]);
  const [isUsingRealData, setIsUsingRealData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state when plan changes — prevents cross-plan data leak
    setRealTransactions([]);
    setIsUsingRealData(false);
    setIsLoading(true);

    async function fetchPlanFinancialData() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // If planId is provided but empty (brand new unsaved plan), skip DB fetch
      // Show AI projections instead — no data exists for this plan yet
      if (planId !== undefined && !planId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log(`[FinancialCharts] Fetching for planId: "${planId}"`);
        const { data, error } = await supabase
          .from("cash_flow")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: true });

        if (error || !data) {
          setIsLoading(false);
          return;
        }

        // Strict isolation filter
        const filtered = data.filter((tx: any) => {
          // If we are looking at a specific plan, ONLY show entries for that plan.
          // Ignore old entries that have no plan_id.
          if (planId) {
            return tx.plan_id === planId;
          }
          // If we are in "Global" mode (no planId), show only global entries (no plan_id)
          return !tx.plan_id;
        });

        console.log(`[FinancialCharts] Found ${data.length} total, ${filtered.length} for this plan.`);

        if (filtered.length > 0) {
          const normalized = filtered.map((tx: any) => ({
            date: tx.date,
            type: tx.type as "income" | "expense",
            amount: Number(tx.amount),
            description: tx.category || tx.description || "Entry",
          }));
          setRealTransactions(normalized);
          setIsUsingRealData(true);
        }
      } catch (e) {
        console.error("Error fetching financial data for charts", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlanFinancialData();
  }, [user, planId, refreshKey]);

  // ============================================
  // LOGIC FOR REAL DATA (From Khata + Cash Flow)
  // ============================================
  let cashFlowData: any[] = [];
  let costBreakdownData: any[] = [];
  let roiData: any[] = [];

  const defaultColors = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--warning))",
    "hsl(var(--success))",
    "hsl(var(--destructive))",
  ];

  if (isUsingRealData) {
    // 1. Process line chart (Cash Flow / Net Profit over time)
    let cumulativeNet = 0;
    const historyMap = new Map<string, number>();

    // group by date (unified format uses 'date' and 'income'/'expense')
    realTransactions.forEach((tx) => {
      const dateStr = new Date(tx.date).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      const current = historyMap.get(dateStr) || 0;
      const amt = Number(tx.amount);
      const diff = tx.type === "income" ? amt : -amt;
      historyMap.set(dateStr, current + diff);
    });

    historyMap.forEach((netAmount, date) => {
      cumulativeNet += netAmount;
      cashFlowData.push({
        month: date,
        cumulative: cumulativeNet,
        breakEven: 0,
      });
    });

    // 2. Process Pie Chart (Cost Breakdown based on ACTUAL expenses)
    const expenseMap = new Map<string, number>();
    let totalExpense = 0;

    realTransactions
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        // Group by the first word of the description to simulate categories
        const cat = (tx.description || "Misc").split(" ")[0] || "Misc";
        const amt = Number(tx.amount);
        expenseMap.set(cat, (expenseMap.get(cat) || 0) + amt);
        totalExpense += amt;
      });

    const entries = Array.from(expenseMap.entries())
      .map(([name, val]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        rawAmt: val,
        value: totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0,
      }))
      .filter((item) => item.value > 0);

    costBreakdownData = entries.map((e, i) => ({
      ...e,
      color: defaultColors[i % defaultColors.length],
    }));

    // Fallback if no expenses recorded yet
    if (costBreakdownData.length === 0) {
      costBreakdownData = [
        { name: "No Expenses Yet", value: 100, color: "hsl(var(--muted))" },
      ];
    }
  } else {
    // ============================================
    // LOGIC FOR AI PROJECTED DATA (Fallback)
    // ============================================
    const parseAmount = (str: string): number => {
      const match = str.match(/[\d,]+/g);
      if (match) {
        const nums = match.map((n) => parseInt(n.replace(/,/g, "")));
        return nums.length > 1 ? (nums[0] + nums[1]) / 2 : nums[0];
      }
      return 0;
    };

    const investment = parseAmount(idea.investmentRange);
    const monthlyRevenue = parseAmount(idea.expectedRevenue);
    const profitMarginPercent = parseInt(idea.profitMargin.match(/\d+/)?.[0] || "35");
    const monthlyProfit = (monthlyRevenue * profitMarginPercent) / 100;
    
    // Calculate cumulative profit for break-even analysis
    cashFlowData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      let cumulativeProfit = -investment;
      for (let m = 1; m <= month; m++) {
        const r = m <= 2 ? monthlyRevenue * 0.6 : m <= 4 ? monthlyRevenue * 0.8 : monthlyRevenue;
        cumulativeProfit += (r * profitMarginPercent) / 100;
      }
      return {
        month: `Month ${month}`,
        cumulative: Math.round(cumulativeProfit),
        breakEven: 0,
      };
    });

    const defaultCostBreakdown = [
      { name: "Raw Materials", value: 45, color: "hsl(var(--primary))" },
      { name: "Rent & Utilities", value: 15, color: "hsl(var(--secondary))" },
      { name: "Staff Salaries", value: 20, color: "hsl(var(--accent))" },
      { name: "Marketing", value: 10, color: "hsl(var(--warning))" },
      { name: "Miscellaneous", value: 10, color: "hsl(var(--success))" },
    ];

    costBreakdownData = defaultCostBreakdown;
    
    if (pricing && pricing.costComponents && pricing.costComponents.length > 1) {
      let totalPercentage = 0;
      const parsedData = pricing.costComponents.map((comp, index) => {
        const match = comp.match(/(\d+(?:\.\d+)?)\s*%/);
        const percentage = match ? parseFloat(match[1]) : 0;
        totalPercentage += percentage;
        let name = comp;
        if (match) name = name.replace(match[0], "").replace(/[:\-]+/g, "").trim();
        return {
          name: name.substring(0, 25) + (name.length > 25 ? "..." : "") || `Component ${index + 1}`,
          value: percentage,
          color: defaultColors[index % defaultColors.length],
        };
      });

      if (totalPercentage >= 90 && totalPercentage <= 101) {
        costBreakdownData = parsedData;
      } else if (totalPercentage > 0 && totalPercentage < 90) {
        costBreakdownData = defaultCostBreakdown;
      } else {
        const evenDist = Math.floor(100 / pricing.costComponents.length);
        let remainder = 100 - (evenDist * pricing.costComponents.length);
        costBreakdownData = parsedData.map((item) => {
          let val = evenDist;
          if (remainder > 0) {
            val += 1;
            remainder -= 1;
          }
          return {
            ...item,
            value: val,
          };
        });
      }
    }

    roiData = [
      {
        period: "Month 3",
        roi: Math.round(((monthlyProfit * 3 - investment) / investment) * 100),
      },
      {
        period: "Month 6",
        roi: Math.round(((monthlyProfit * 6 - investment) / investment) * 100),
      },
      {
        period: "Month 12",
        roi: Math.round(((monthlyProfit * 12 - investment) / investment) * 100),
      },
      {
        period: "Year 2",
        roi: Math.round(((monthlyProfit * 24 - investment) / investment) * 100),
      },
    ];
  }

  const formatCurrency = (value: number) => {
    if (value >= 100000 || value <= -100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000 || value <= -1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground animate-pulse">Loading Financial Charts...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dynamic Data Notification */}
      <div className={`p-4 rounded-xl border flex items-start gap-4 shadow-sm ${
        isUsingRealData 
          ? "bg-green-500/10 border-green-500/20" 
          : "bg-blue-500/10 border-blue-500/20"
      }`}>
        <div className={`p-2 rounded-full shrink-0 ${isUsingRealData ? "bg-green-500/20" : "bg-blue-500/20"}`}>
          {isUsingRealData ? <Database className="w-5 h-5 text-green-500" /> : <Activity className="w-5 h-5 text-blue-500" />}
        </div>
        <div>
          <h4 className={`font-bold ${isUsingRealData ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}>
            {isUsingRealData ? "Showing Real Accounting Data" : "Showing AI-Projected Estimates"}
          </h4>
          <p className="text-sm text-foreground/80 mt-1 leading-snug">
            {isUsingRealData 
              ? "These charts are pulling live data from your Cash Flow entries for THIS specific plan." 
              : "No transactions found for this plan yet. Currently showing 12-month mathematical estimates generated from your business plan metrics."}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {isUsingRealData ? "Real Cumulative Net Balance" : "Break-Even Projection"}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={formatCurrency} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    name={isUsingRealData ? "Net Ledger Balance" : "Cumulative P/L"}
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="breakEven"
                    name={isUsingRealData ? "Zero Baseline" : "Break-Even"}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {!isUsingRealData && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Expected break-even in{" "}
                <span className="font-semibold text-primary">
                  {parseInt(idea.breakEvenTime.match(/\d+/)?.[0] || "4")} months
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cost Breakdown Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                {isUsingRealData ? "Actual Expense Categories" : "Estimated Cost Structure"}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Projection (Only show for AI Data since it's an estimate) */}
      {!isUsingRealData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Return on Investment (ROI) Projection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {roiData.map((item) => (
                <div
                  key={item.period}
                  className={`text-center p-4 rounded-lg ${
                    item.roi >= 0 ? "bg-success/10" : "bg-destructive/10"
                  }`}
                >
                  <p className="text-sm text-muted-foreground mb-1">
                    {item.period}
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      item.roi >= 0 ? "text-success" : "text-destructive"
                    }`}
                  >
                    {item.roi > 0 ? "+" : ""}
                    {item.roi}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
