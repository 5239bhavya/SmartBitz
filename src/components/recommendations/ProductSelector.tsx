import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, ArrowRight, Plus, Sparkles, AlertCircle } from "lucide-react";
import { BusinessIdea, Product } from "@/types/business";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProductSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessIdea: BusinessIdea | null;
  onSelectProduct: (products: Product[]) => void;
}

const FLASK_BASE = "/api/bi";

export const ProductSelector = ({
  open,
  onOpenChange,
  businessIdea,
  onSelectProduct,
}: ProductSelectorProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [customProduct, setCustomProduct] = useState("");
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (open && businessIdea) {
      setSelectedProducts([]);
      setError(null);
      fetchProducts();
    }
  }, [open, businessIdea]);

  const fetchProducts = async () => {
    if (!businessIdea) return;
    setLoading(true);
    setIsFallback(false);

    try {
      // Call Flask backend — bypasses broken Supabase edge function (401/CORS issues)
      const res = await fetch(`${FLASK_BASE}/product-list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: businessIdea.name }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      if (data.success && data.products?.length > 0) {
        setProducts(
          data.products.map((p: Record<string, unknown>) => ({
            id: (p.id as string) || `p-${Math.random()}`,
            business_id: businessIdea.id,
            name: p.name as string,
            description: (p.description as string) || "",
            avg_selling_price: (p.avg_selling_price as number) || 0,
          }))
        );
        if ((data.data as Record<string, unknown>)?._fallback) setIsFallback(true);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Product fetch error:", err);
      setError("Could not connect to Flask backend. Is it running on port 5000?");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => { onSelectProduct([]); onOpenChange(false); };
  const handleConfirm = () => { onSelectProduct(selectedProducts); onOpenChange(false); };

  const toggleProduct = (product: Product) => {
    setSelectedProducts((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const handleAddCustomProduct = () => {
    if (!customProduct.trim()) return;
    const newProduct: Product = {
      id: `custom-${Date.now()}`,
      business_id: businessIdea?.id || "custom-biz",
      name: customProduct.trim(),
      description: "Custom product added by you",
      avg_selling_price: 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
    setSelectedProducts((prev) => [...prev, newProduct]);
    setCustomProduct("");
    toast.success("Custom product added!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Select Key Product
          </DialogTitle>
          <DialogDescription>
            What is the main product you want to sell? We will customize your
            raw materials &amp; suppliers for it.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <p className="text-sm text-muted-foreground">
                AI is finding products for <strong>{businessIdea?.name}</strong>...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
              <AlertCircle className="w-8 h-8 text-amber-500" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchProducts}>
                Retry
              </Button>
              <p className="text-xs text-muted-foreground">
                Or add your own product below and skip the list.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {isFallback && (
                  <p className="text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                    Showing estimated products — AI backend may be busy
                  </p>
                )}
                {products.length > 0 ? (
                  products.map((product) => {
                    const isSelected = selectedProducts.some((p) => p.id === product.id);
                    return (
                      <Card
                        key={product.id}
                        className={`cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "hover:border-primary/40 hover:bg-muted/20"}`}
                        onClick={() => toggleProduct(product)}
                      >
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}>
                              {isSelected && (
                                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-primary-foreground stroke-current stroke-[3]">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{product.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                              {product.avg_selling_price > 0 && (
                                <Badge variant="secondary" className="text-[10px] mt-1 px-2 py-0 font-semibold">
                                  ₹{product.avg_selling_price}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground space-y-2">
                    <p className="text-sm">No products found yet.</p>
                    <p className="text-xs">Add your own below or skip.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {!loading && (
            <div className="mt-4 pt-4 border-t flex gap-2">
              <Input
                placeholder="Add your own custom product..."
                value={customProduct}
                onChange={(e) => setCustomProduct(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddCustomProduct(); }}
              />
              <Button size="icon" onClick={handleAddCustomProduct} variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between flex-row items-center">
          <Button variant="ghost" onClick={handleSkip}>
            Skip / Decide Later
          </Button>
          {products.length > 0 && (
            <Button onClick={handleConfirm} disabled={selectedProducts.length === 0} className="gap-2">
              <ArrowRight className="w-4 h-4" />
              Confirm ({selectedProducts.length})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
