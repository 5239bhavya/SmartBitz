import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  TrendingUp,
  Plus,
  DollarSign,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Sale {
  id: string;
  date: string;
  amount: number;
  product_service: string;
  category: string;
  customer_name: string;
}

export const SalesWidget = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSale, setNewSale] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    product_service: "",
    category: "",
    customer_name: "",
  });

  useEffect(() => {
    if (user) {
      loadSales();
    }
  }, [user]);

  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from("sales_tracking")
        .select("*")
        .eq("user_id", user?.id)
        .order("date", { ascending: false })
        .limit(10);

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error("Error loading sales:", error);
      toast.error("Failed to load sales");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSale = async () => {
    if (!newSale.amount || !newSale.product_service) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const { error } = await supabase.from("sales_tracking").insert({
        user_id: user?.id,
        date: newSale.date,
        amount: parseFloat(newSale.amount),
        product_service: newSale.product_service,
        category: newSale.category,
        customer_name: newSale.customer_name,
      });

      if (error) throw error;

      toast.success("Sale added successfully!");
      setIsDialogOpen(false);
      setNewSale({
        date: new Date().toISOString().split("T")[0],
        amount: "",
        product_service: "",
        category: "",
        customer_name: "",
      });
      loadSales();
    } catch (error) {
      console.error("Error adding sale:", error);
      toast.error("Failed to add sale");
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const thisMonthSales = sales.filter(
    (s) => new Date(s.date).getMonth() === new Date().getMonth(),
  );
  const thisMonthRevenue = thisMonthSales.reduce(
    (sum, sale) => sum + sale.amount,
    0,
  );

  const lastMonthSales = sales.filter(
    (s) => new Date(s.date).getMonth() === new Date().getMonth() - 1,
  );
  const lastMonthRevenue = lastMonthSales.reduce(
    (sum, sale) => sum + sale.amount,
    0,
  );

  // Calculate Growth
  const revenueGrowth =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 100;

  // Prepare chart data (group by day for the last 7 items or 30 days)
  const chartData = [...sales].reverse().map((sale) => ({
    date: new Date(sale.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    amount: sale.amount,
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="border-border/50 shadow-sm animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sales Tracking
            </CardTitle>
            <CardDescription>
              Track your revenue and transactions
            </CardDescription>
          </div>
          <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Sale
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full sm:max-w-md">
              <SheetHeader className="mb-6">
                <SheetTitle>Add New Sale</SheetTitle>
                <SheetDescription>
                  Record a new sales transaction
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newSale.date}
                    onChange={(e) =>
                      setNewSale({ ...newSale, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Amount (₹) *</Label>
                  <Input
                    type="number"
                    value={newSale.amount}
                    onChange={(e) =>
                      setNewSale({ ...newSale, amount: e.target.value })
                    }
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label>Product/Service *</Label>
                  <Input
                    value={newSale.product_service}
                    onChange={(e) =>
                      setNewSale({
                        ...newSale,
                        product_service: e.target.value,
                      })
                    }
                    placeholder="Product name or service"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={newSale.category}
                    onChange={(e) =>
                      setNewSale({ ...newSale, category: e.target.value })
                    }
                    placeholder="Electronics, Services, etc."
                  />
                </div>
                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={newSale.customer_name}
                    onChange={(e) =>
                      setNewSale({ ...newSale, customer_name: e.target.value })
                    }
                    placeholder="Customer name"
                  />
                </div>
                <Button onClick={handleAddSale} className="w-full mt-4">
                  Add Sale
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-card border shadow-sm">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              This Month
              {revenueGrowth > 0 ? (
                <span className="flex items-center text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {revenueGrowth.toFixed(1)}%
                </span>
              ) : revenueGrowth < 0 ? (
                <span className="flex items-center text-xs text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full">
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  {Math.abs(revenueGrowth).toFixed(1)}%
                </span>
              ) : null}
            </span>
            <span className="text-3xl font-bold tracking-tight">
              ₹{thisMonthRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              {thisMonthSales.length} total transactions
            </span>
          </div>

          <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/40 border-transparent">
            <span className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </span>
            <span className="text-3xl font-bold tracking-tight text-muted-foreground">
              ₹{totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              Lifetime earnings
            </span>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  dy={10}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="text-sm text-muted-foreground mb-1">
                            {label}
                          </p>
                          <p className="font-bold text-primary">
                            ₹{payload[0].value?.toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 border border-dashed rounded-xl mt-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-lg">No revenue data</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mt-1 mb-4">
              You haven't recorded any sales yet. Record a sale to see your
              revenue trends.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              Record First Sale
            </Button>
          </div>
        )}

        {sales.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Recent Transactions</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {sales.slice(0, 3).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm leading-none">
                        {sale.product_service}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {sale.customer_name || "Anonymous"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      +₹{sale.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {new Date(sale.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
