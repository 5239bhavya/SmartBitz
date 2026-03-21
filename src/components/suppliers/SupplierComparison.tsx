import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Supplier, RawMaterial } from "@/types/business";
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
} from "lucide-react";

interface SupplierComparisonProps {
  materials: RawMaterial[];
}

const generateMockSuppliers = (materialName: string): Supplier[] => {
  const suppliers: Supplier[] = [
    {
      name: "IndiaMART Verified Seller",
      location: "Delhi NCR",
      rating: 4.5,
      priceRange: "₹500-₹2,000",
      deliveryTime: "2-3 days",
      minOrder: "₹5,000",
      contactType: "Online",
      pros: ["Wide variety", "Verified sellers", "Easy comparison"],
      cons: ["Shipping costs extra", "Quality varies"],
    },
    {
      name: "Local Wholesale Market",
      location: "City Center",
      rating: 4.2,
      priceRange: "₹400-₹1,800",
      deliveryTime: "Same day",
      minOrder: "₹2,000",
      contactType: "In-person",
      pros: ["Negotiate prices", "Check quality", "No shipping"],
      cons: ["Limited hours", "Cash preferred"],
    },
    {
      name: "TradeIndia Supplier",
      location: "Mumbai",
      rating: 4.0,
      priceRange: "₹450-₹1,900",
      deliveryTime: "3-5 days",
      minOrder: "₹3,000",
      contactType: "Online",
      pros: ["Bulk discounts", "Regular supply", "Invoice billing"],
      cons: ["Min order required", "Advance payment"],
    },
    {
      name: "Amazon Business",
      location: "Pan India",
      rating: 4.3,
      priceRange: "₹600-₹2,200",
      deliveryTime: "1-2 days",
      minOrder: "₹1,000",
      contactType: "Online",
      pros: ["Fast delivery", "Easy returns", "GST invoice"],
      cons: ["Higher prices", "Limited bulk options"],
    },
  ];
  return suppliers;
};

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
      <span className="ml-1 text-sm font-medium">{rating}</span>
    </div>
  );
};

export const SupplierComparison = ({ materials }: SupplierComparisonProps) => {
  const [selectedMaterial, setSelectedMaterial] = useState<string>(
    materials[0]?.name || "",
  );
  const [compareList, setCompareList] = useState<string[]>([]);
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

  const suppliers = generateMockSuppliers(selectedMaterial);

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
            onClick={() => setSelectedMaterial(material.name)}
          >
            {material.name}
          </Button>
        ))}
      </div>

      {/* Supplier List */}
      <div className="grid gap-4">
        {suppliers.map((supplier) => (
          <Card
            key={supplier.name}
            className={`transition-all ${
              compareList.includes(supplier.name) ? "ring-2 ring-primary" : ""
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
                    <Badge variant="secondary">{supplier.contactType}</Badge>
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
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                  <StarRating rating={supplier.rating} />
                  <p className="text-lg font-bold text-primary">
                    {supplier.priceRange}
                  </p>
                </div>
              </div>

              {/* Expandable Details */}
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full"
                onClick={() =>
                  setExpandedSupplier(
                    expandedSupplier === supplier.name ? null : supplier.name,
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
                      {supplier.pros.map((pro, idx) => (
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
                      {supplier.cons.map((con, idx) => (
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
                    <TableCell className="font-medium">Price Range</TableCell>
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
                    <TableCell className="font-medium">Delivery Time</TableCell>
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
                  <TableRow>
                    <TableCell className="font-medium">Contact</TableCell>
                    {comparedSuppliers.map((s) => (
                      <TableCell key={s.name}>
                        <Badge variant="secondary">{s.contactType}</Badge>
                      </TableCell>
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
    </div>
  );
};
