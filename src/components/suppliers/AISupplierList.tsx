import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RawMaterial } from "@/types/business";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Star,
  MapPin,
  Clock,
  Package,
  Phone,
  ThumbsUp,
  ThumbsDown,
  Scale,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Shield,
  Sparkles,
} from "lucide-react";

interface AISupplierListProps {
  materials: RawMaterial[];
  businessType: string;
  city: string;
}

interface Supplier {
  name: string;
  location: string;
  rating: number;
  priceRange: string;
  deliveryTime: string;
  minOrder: string;
  contactType: string;
  phone?: string;
  specialization?: string;
  pros: string[];
  cons: string[];
  verified?: boolean;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-warning text-warning"
              : star - 0.5 <= rating
                ? "fill-warning/50 text-warning"
                : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

export const AISupplierList = ({
  materials,
  businessType,
  city,
}: AISupplierListProps) => {
  const [selectedMaterial, setSelectedMaterial] = useState<string>(
    materials[0]?.name || "",
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchSuppliers = async () => {
    if (!selectedMaterial) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-suppliers", {
        body: { materialName: selectedMaterial, businessType, city },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setSuppliers(data.suppliers || []);
      setHasLoaded(true);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to fetch suppliers",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompare = (supplierName: string) => {
    setCompareList((prev) =>
      prev.includes(supplierName)
        ? prev.filter((s) => s !== supplierName)
        : prev.length < 3
          ? [...prev, supplierName]
          : prev,
    );
  };

  const comparedSuppliers = suppliers.filter((s) =>
    compareList.includes(s.name),
  );

  return (
    <div className="space-y-6">
      {/* Material Selection */}
      <div className="flex flex-wrap gap-2">
        {materials.map((material) => (
          <Button
            key={material.name}
            variant={selectedMaterial === material.name ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedMaterial(material.name);
              setSuppliers([]);
              setHasLoaded(false);
              setCompareList([]);
            }}
          >
            {material.name}
          </Button>
        ))}
      </div>

      {/* Fetch Button */}
      {!hasLoaded && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary opacity-50" />
            <h3 className="font-semibold mb-2">AI-Powered Supplier Search</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get real-time supplier recommendations for "{selectedMaterial}" in{" "}
              {city}
            </p>
            <Button onClick={fetchSuppliers} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finding Suppliers...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Find Suppliers
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && hasLoaded && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Supplier List */}
      {!isLoading && suppliers.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {suppliers.length} suppliers for {selectedMaterial}
            </p>
            <Button variant="outline" size="sm" onClick={fetchSuppliers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {suppliers.map((supplier) => (
              <Card
                key={supplier.name}
                className={`transition-all ${
                  compareList.includes(supplier.name)
                    ? "ring-2 ring-primary"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Checkbox
                          checked={compareList.includes(supplier.name)}
                          onCheckedChange={() => toggleCompare(supplier.name)}
                        />
                        <h4 className="font-semibold">{supplier.name}</h4>
                        {supplier.verified && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        <Badge variant="outline">{supplier.contactType}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {supplier.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {supplier.deliveryTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Min: {supplier.minOrder}
                        </span>
                        {supplier.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {supplier.phone}
                          </span>
                        )}
                      </div>
                      {supplier.specialization && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Specializes in:</strong>{" "}
                          {supplier.specialization}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <StarRating rating={supplier.rating} />
                      <p className="text-lg font-bold text-primary">
                        {supplier.priceRange}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() =>
                      setExpandedSupplier(
                        expandedSupplier === supplier.name
                          ? null
                          : supplier.name,
                      )
                    }
                  >
                    {expandedSupplier === supplier.name ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        View Details
                      </>
                    )}
                  </Button>

                  {expandedSupplier === supplier.name && (
                    <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-success flex items-center gap-2 mb-2">
                          <ThumbsUp className="h-4 w-4" />
                          Pros
                        </h5>
                        <ul className="space-y-1 text-sm">
                          {supplier.pros?.map((pro, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-success" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-destructive flex items-center gap-2 mb-2">
                          <ThumbsDown className="h-4 w-4" />
                          Cons
                        </h5>
                        <ul className="space-y-1 text-sm">
                          {supplier.cons?.map((con, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          {comparedSuppliers.length >= 2 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Supplier Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        {comparedSuppliers.map((s) => (
                          <TableHead key={s.name}>{s.name}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Rating</TableCell>
                        {comparedSuppliers.map((s) => (
                          <TableCell key={s.name}>
                            <StarRating rating={s.rating} />
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Price Range
                        </TableCell>
                        {comparedSuppliers.map((s) => (
                          <TableCell
                            key={s.name}
                            className="font-semibold text-primary"
                          >
                            {s.priceRange}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Delivery</TableCell>
                        {comparedSuppliers.map((s) => (
                          <TableCell key={s.name}>{s.deliveryTime}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Min Order</TableCell>
                        {comparedSuppliers.map((s) => (
                          <TableCell key={s.name}>{s.minOrder}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Location</TableCell>
                        {comparedSuppliers.map((s) => (
                          <TableCell key={s.name}>{s.location}</TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {compareList.length > 0 && compareList.length < 2 && (
            <p className="text-sm text-muted-foreground text-center">
              Select at least 2 suppliers to compare
            </p>
          )}
        </>
      )}
    </div>
  );
};
