import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProductMaterials, getRecipeBreakdown } from "@/services/biIntelligenceService";
import type { ProductMaterialsData, RecipeBreakdown, RecipeIngredient, RecipeStep, EnrichedMaterial } from "@/types/productIntelligence";
import { RawMaterial } from "@/types/business";
import {
    Package, Thermometer, Clock, Lightbulb, IndianRupee,
    ChefHat, ListOrdered, DollarSign, Sparkles, RefreshCw, Info,
} from "lucide-react";

interface RawMaterialsEnrichedProps {
    materials: RawMaterial[];
    businessType: string;
    lang?: "en" | "hi" | "mr";
}

const T = {
    en: {
        title: "AI-Enhanced Raw Material Intelligence",
        subtitle: "Product-specific quantities, costs, storage & shelf life",
        selectProduct: "Select a Raw Material to analyze:",
        analyze: "Analyze with AI",
        analyzing: "Analyzing material...",
        notFound: "Material analysis unavailable",
        qty100: "Qty / 100 units",
        costEst: "Cost Estimate",
        source: "Source",
        storage: "Storage",
        shelf: "Shelf Life",
        qualityTip: "Quality Tip",
        totalCost: "Total Material Cost (per 100 units):",
        critical: "Critical Material:",
        recipe: "Process Breakdown",
        materials: "Material Details",
        batch: "Batch Size", prep: "Prep Time", cook: "Cook Time",
        total: "Total Time", yield: "Yield Ratio",
        ingredients: "Ingredients", steps: "Preparation Steps",
        costPer: "Cost per Unit", sellPrice: "Selling Price", profit: "Profit per Unit",
        margin: "Profit Margin", qualityCheck: "Quality Checklist", packaging: "Packaging Tip",
        refresh: "Refresh", fallback: "Showing estimated data",
    },
    hi: {
        title: "AI-संवर्धित कच्चा माल इंटेलिजेंस",
        subtitle: "उत्पाद-विशिष्ट मात्रा, लागत, भंडारण और शेल्फ लाइफ",
        selectProduct: "विश्लेषण के लिए कच्चा माल चुनें:",
        analyze: "AI से विश्लेषण करें",
        analyzing: "सामग्री का विश्लेषण हो रहा है...",
        notFound: "सामग्री विश्लेषण उपलब्ध नहीं",
        qty100: "मात्रा / 100 इकाई",
        costEst: "लागत अनुमान",
        source: "स्रोत",
        storage: "भंडारण",
        shelf: "शेल्फ लाइफ",
        qualityTip: "गुणवत्ता टिप",
        totalCost: "कुल सामग्री लागत (प्रति 100 इकाई):",
        critical: "महत्वपूर्ण सामग्री:",
        recipe: "प्रक्रिया विवरण",
        materials: "सामग्री विवरण",
        batch: "बैच आकार", prep: "तैयारी का समय", cook: "पकाने का समय",
        total: "कुल समय", yield: "उपज अनुपात",
        ingredients: "सामग्री", steps: "तैयारी के चरण",
        costPer: "प्रति इकाई लागत", sellPrice: "बिक्री मूल्य", profit: "प्रति इकाई लाभ",
        margin: "लाभ मार्जिन", qualityCheck: "गुणवत्ता जांच", packaging: "पैकेजिंग टिप",
        refresh: "रिफ्रेश", fallback: "अनुमानित डेटा दिखाया जा रहा है",
    },
    mr: {
        title: "AI-समृद्ध कच्चा माल इंटेलिजेंस",
        subtitle: "उत्पाद-विशिष्ट प्रमाण, खर्च, साठवण आणि शेल्फ लाइफ",
        selectProduct: "विश्लेषणासाठी कच्चा माल निवडा:",
        analyze: "AI ने विश्लेषण करा",
        analyzing: "सामग्रीचे विश्लेषण होत आहे...",
        notFound: "सामग्री विश्लेषण उपलब्ध नाही",
        qty100: "प्रमाण / 100 युनिट",
        costEst: "खर्चाचा अंदाज",
        source: "स्रोत",
        storage: "साठवण",
        shelf: "शेल्फ लाइफ",
        qualityTip: "गुणवत्ता टिप",
        totalCost: "एकूण सामग्री खर्च (प्रति 100 युनिट):",
        critical: "महत्त्वाचे साहित्य:",
        recipe: "प्रक्रिया तपशील",
        materials: "सामग्री तपशील",
        batch: "बॅच आकार", prep: "तयारीचा वेळ", cook: "शिजवण्याचा वेळ",
        total: "एकूण वेळ", yield: "उत्पादन गुणोत्तर",
        ingredients: "घटक", steps: "तयारीचे चरण",
        costPer: "प्रति युनिट खर्च", sellPrice: "विक्री किंमत", profit: "प्रति युनिट नफा",
        margin: "नफा मार्जिन", qualityCheck: "गुणवत्ता तपासणी", packaging: "पॅकेजिंग टिप",
        refresh: "रिफ्रेश", fallback: "अंदाजित डेटा दाखवत आहे",
    },
};

export function RawMaterialsEnriched({ materials, businessType, lang = "en" }: RawMaterialsEnrichedProps) {
    const [selectedMaterial, setSelectedMaterial] = useState(materials[0]?.name || "");
    const [matData, setMatData] = useState<ProductMaterialsData | null>(null);
    const [recipeData, setRecipeData] = useState<RecipeBreakdown | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const t = T[lang];

    const analyze = async (force = false) => {
        if (!selectedMaterial || !businessType) return;
        if (force) {
            try {
                localStorage.removeItem(`bi:materials:${businessType}:${selectedMaterial}`);
                localStorage.removeItem(`bi:recipe:${businessType}:${selectedMaterial}`);
            } catch { }
        }
        setLoading(true);
        const [mat, recipe] = await Promise.all([
            getProductMaterials(businessType, selectedMaterial),
            getRecipeBreakdown(businessType, selectedMaterial), // always fetch for all businesses
        ]);
        setMatData(mat);
        setRecipeData(recipe);
        setHasLoaded(true);
        setLoading(false);
    };

    useEffect(() => { setHasLoaded(false); setMatData(null); setRecipeData(null); }, [selectedMaterial]);

    return (
        <div className="space-y-6">
            {/* Material selector */}
            <div className="space-y-3 p-5 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-primary">{t.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{t.subtitle}</p>
                <p className="text-xs font-medium text-muted-foreground">{t.selectProduct}</p>
                <div className="flex flex-wrap gap-2">
                    {materials.map(m => (
                        <Button key={m.name} variant={selectedMaterial === m.name ? "default" : "outline"} size="sm"
                            onClick={() => setSelectedMaterial(m.name)}>
                            {m.name}
                        </Button>
                    ))}
                </div>
                <Button onClick={() => analyze()} disabled={loading || !selectedMaterial} className="gap-2">
                    {loading ? <><Sparkles className="w-4 h-4 animate-spin" />{t.analyzing}</> : <><Sparkles className="w-4 h-4" />{t.analyze}</>}
                </Button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
            )}

            {/* Results */}
            {!loading && hasLoaded && (
                <Tabs defaultValue="materials">
                    {/* Always show both tabs for all business types */}
                    <TabsList className="mb-4">
                        <TabsTrigger value="materials" className="gap-1.5"><Package className="w-3.5 h-3.5" />{t.materials}</TabsTrigger>
                        <TabsTrigger value="recipe" className="gap-1.5"><ChefHat className="w-3.5 h-3.5" />{t.recipe}</TabsTrigger>
                    </TabsList>

                    {/* Material details tab */}
                    <TabsContent value="materials" className="space-y-4">
                        {matData?._fallback && (
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                                <Info className="w-3.5 h-3.5 shrink-0" />{t.fallback}
                            </div>
                        )}

                        {(matData?.materials || []).map((m: EnrichedMaterial, i: number) => (
                            <Card key={i} className="hover:border-primary/30 transition-colors">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <h4 className="font-bold text-base">{m.name}</h4>
                                        <Badge variant="secondary" className="text-xs font-semibold">{m.cost_estimate}</Badge>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {[
                                            { icon: Package, label: t.qty100, value: m.quantity_per_100_units },
                                            { icon: IndianRupee, label: t.source, value: m.supplier_source },
                                            { icon: Thermometer, label: t.storage, value: m.storage_requirement },
                                            { icon: Clock, label: t.shelf, value: m.shelf_life },
                                        ].map(({ icon: Icon, label, value }) => value ? (
                                            <div key={label} className="flex items-start gap-2 p-3 rounded-xl bg-muted/30 border border-border/40">
                                                <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                                                    <p className="text-sm font-semibold">{value}</p>
                                                </div>
                                            </div>
                                        ) : null)}
                                    </div>

                                    {m.quality_tip && (
                                        <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/15 text-sm">
                                            <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                            <div><span className="font-semibold text-primary">{t.qualityTip}: </span>{m.quality_tip}</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {matData && (
                            <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">{t.totalCost}</p>
                                    <p className="font-bold text-primary">{matData.total_material_cost_per_100_units}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">{t.critical}</p>
                                    <p className="font-bold">{matData.critical_material}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => analyze(true)}>
                                <RefreshCw className="w-3.5 h-3.5" />{t.refresh}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Process/Recipe tab — ALL business types */}
                    <TabsContent value="recipe" className="space-y-6">
                        {/* Time stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: t.batch, value: recipeData?.batch_size },
                                { label: t.prep, value: recipeData?.prep_time },
                                { label: t.cook, value: recipeData?.cook_time },
                                { label: t.yield, value: recipeData?.yield_ratio },
                            ].map(({ label, value }) => value ? (
                                <div key={label} className="p-3 rounded-xl bg-card border border-border/50 text-center">
                                    <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
                                    <p className="font-bold text-sm">{value}</p>
                                </div>
                            ) : null)}
                        </div>

                        {/* Economics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: t.costPer, value: recipeData?.cost_per_unit, cls: "text-red-500" },
                                { label: t.sellPrice, value: recipeData?.selling_price_per_unit, cls: "text-primary" },
                                { label: t.profit, value: recipeData?.profit_per_unit, cls: "text-emerald-500" },
                                { label: t.margin, value: recipeData?.profit_margin, cls: "text-emerald-600 font-black text-lg" },
                            ].map(({ label, value, cls }) => value ? (
                                <div key={label} className="p-3 rounded-xl bg-card border border-border/50 text-center">
                                    <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
                                    <p className={`font-bold text-sm ${cls}`}>{value}</p>
                                </div>
                            ) : null)}
                        </div>

                        {/* Ingredients */}
                        {recipeData?.ingredients?.length ? (
                            <div>
                                <h4 className="font-bold mb-3 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-primary" />{t.ingredients}
                                </h4>
                                <div className="overflow-x-auto rounded-xl border border-border/50">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Ingredient</th>
                                                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Quantity</th>
                                                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Cost</th>
                                                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Source</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                            {recipeData.ingredients.map((ing: RecipeIngredient, i: number) => (
                                                <tr key={i} className="hover:bg-muted/20">
                                                    <td className="px-4 py-2.5 font-medium">{ing.name}</td>
                                                    <td className="px-4 py-2.5 text-muted-foreground">{ing.quantity}</td>
                                                    <td className="px-4 py-2.5 font-semibold text-primary">{ing.cost}</td>
                                                    <td className="px-4 py-2.5 text-muted-foreground">{ing.source}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : null}

                        {/* Steps */}
                        {recipeData?.steps?.length ? (
                            <div>
                                <h4 className="font-bold mb-4 flex items-center gap-2">
                                    <ListOrdered className="w-4 h-4 text-primary" />{t.steps}
                                </h4>
                                <div className="space-y-4">
                                    {recipeData.steps.map((s: RecipeStep) => (
                                        <div key={s.step_number} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-black border border-primary/20 shrink-0">
                                                {s.step_number}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <h5 className="font-semibold">{s.title}</h5>
                                                    <Badge variant="outline" className="gap-1 text-xs">
                                                        <Clock className="w-3 h-3" />{s.duration}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                                                {s.tip && (
                                                    <div className="flex items-start gap-1.5 text-xs text-primary bg-primary/5 border border-primary/10 p-2 rounded-lg">
                                                        <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />{s.tip}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Quality & packaging */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {recipeData?.quality_checklist?.length ? (
                                <Card>
                                    <CardContent className="p-4">
                                        <h4 className="font-bold mb-3 flex items-center gap-2 text-sm">✅ {t.qualityCheck}</h4>
                                        <ul className="space-y-1.5">
                                            {recipeData.quality_checklist.map((q, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />{q}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ) : null}
                            {recipeData?.packaging_tip && (
                                <Card>
                                    <CardContent className="p-4">
                                        <h4 className="font-bold mb-3 flex items-center gap-2 text-sm"><Package className="w-4 h-4 text-primary" />{t.packaging}</h4>
                                        <p className="text-sm text-muted-foreground">{recipeData.packaging_tip}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
