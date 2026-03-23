import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getProductIntelligence } from "@/services/biIntelligenceService";
import type { ProductIntelligence, TopProduct } from "@/types/productIntelligence";
import {
    TrendingUp, TrendingDown, Minus, Globe2, Target,
    BarChart3, Zap, ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

interface ProductIntelligencePanelProps {
    businessType: string;
    productName?: string;
    lang?: "en" | "hi" | "mr";
}

const T = {
    en: {
        title: "AI Market Intelligence",
        subtitle: "Live research-backed insights for your business",
        demand: "Market Demand", trend: "Demand Trend", risk: "Risk Score",
        margin: "Est. Profit Margin", investment: "Investment Range",
        competition: "Competition", season: "Best Season", marketSize: "Market Size",
        topProducts: "Top Products in Category",
        country: "Country", globalDemand: "Global Demand", price: "Price Range",
        marginEst: "Margin", investRange: "Investment",
        refresh: "Refresh", showMore: "Show Top Products", hide: "Hide",
        loading: "Fetching market intelligence...",
        fallback: "Live data unavailable — showing estimates",
    },
    hi: {
        title: "AI बाजार इंटेलिजेंस",
        subtitle: "आपके व्यवसाय के लिए लाइव शोध-आधारित अंतर्दृष्टि",
        demand: "बाजार मांग", trend: "मांग प्रवृत्ति", risk: "जोखिम स्कोर",
        margin: "अनुमानित लाभ मार्जिन", investment: "निवेश सीमा",
        competition: "प्रतिस्पर्धा", season: "सर्वोत्तम मौसम", marketSize: "बाजार आकार",
        topProducts: "श्रेणी के शीर्ष उत्पाद",
        country: "देश", globalDemand: "वैश्विक मांग", price: "मूल्य सीमा",
        marginEst: "मार्जिन", investRange: "निवेश",
        refresh: "रिफ्रेश", showMore: "शीर्ष उत्पाद दिखाएं", hide: "छुपाएं",
        loading: "बाजार की जानकारी प्राप्त हो रही है...",
        fallback: "लाइव डेटा उपलब्ध नहीं — अनुमान दिखाया जा रहा है",
    },
    mr: {
        title: "AI बाजार इंटेलिजेंस",
        subtitle: "तुमच्या व्यवसायासाठी लाइव संशोधन-आधारित अंतर्दृष्टी",
        demand: "बाजार मागणी", trend: "मागणी प्रवृत्ती", risk: "जोखीम गुण",
        margin: "अंदाजित नफा मार्जिन", investment: "गुंतवणूक श्रेणी",
        competition: "स्पर्धा", season: "सर्वोत्तम हंगाम", marketSize: "बाजाराचा आकार",
        topProducts: "श्रेणीतील शीर्ष उत्पादने",
        country: "देश", globalDemand: "जागतिक मागणी", price: "किंमत श्रेणी",
        marginEst: "मार्जिन", investRange: "गुंतवणूक",
        refresh: "रिफ्रेश", showMore: "शीर्ष उत्पादने दाखवा", hide: "लपवा",
        loading: "बाजार माहिती मिळवत आहे...",
        fallback: "लाइव डेटा उपलब्ध नाही — अंदाज दाखवत आहे",
    },
};

const demandColor = (v?: string) =>
    v === "High" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
        : v === "Low" ? "bg-red-500/15 text-red-600 border-red-500/30"
            : "bg-amber-500/15 text-amber-600 border-amber-500/30";

const riskColor = (n: number) =>
    n <= 3 ? "text-emerald-500" : n <= 6 ? "text-amber-500" : "text-red-500";

export function ProductIntelligencePanel({ businessType, productName = "", lang = "en" }: ProductIntelligencePanelProps) {
    const [data, setData] = useState<ProductIntelligence | null>(null);
    const [loading, setLoading] = useState(true);
    const [showProducts, setShowProducts] = useState(false);
    const t = T[lang];

    const load = async (force = false) => {
        setLoading(true);
        if (force) {
            // Clear cache for fresh fetch
            try { localStorage.removeItem(`bi:product:${businessType}:${productName}`); } catch { }
        }
        const result = await getProductIntelligence(businessType, productName);
        setData(result);
        setLoading(false);
    };

    useEffect(() => { if (businessType) load(); }, [businessType, productName]);

    if (loading) {
        return (
            <Card className="border border-primary/20 bg-primary/5">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-48 h-5 rounded" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                    </div>
                    <p className="text-xs text-muted-foreground text-center animate-pulse">{t.loading}</p>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const TrendIcon = data.demand_trend === "Rising" ? TrendingUp : data.demand_trend === "Declining" ? TrendingDown : Minus;
    const trendCol = data.demand_trend === "Rising" ? "text-emerald-500" : data.demand_trend === "Declining" ? "text-red-500" : "text-amber-500";

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-sm">
                <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <BarChart3 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base">{t.title}</h3>
                                <p className="text-xs text-muted-foreground">{t.subtitle}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {data._fallback && (
                                <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30">{t.fallback}</Badge>
                            )}
                            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => load(true)}>
                                <RefreshCw className="w-3.5 h-3.5" />{t.refresh}
                            </Button>
                        </div>
                    </div>

                    {/* Stat grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                        {/* Demand */}
                        <div className="p-3 rounded-xl bg-card border border-border/50">
                            <p className="text-xs text-muted-foreground font-medium mb-1.5">{t.demand}</p>
                            <Badge className={`text-xs font-bold px-2 py-0.5 border ${demandColor(data.demand_level)}`}>
                                {data.demand_level}
                            </Badge>
                        </div>
                        {/* Trend */}
                        <div className="p-3 rounded-xl bg-card border border-border/50">
                            <p className="text-xs text-muted-foreground font-medium mb-1.5">{t.trend}</p>
                            <div className={`flex items-center gap-1.5 font-bold text-sm ${trendCol}`}>
                                <TrendIcon className="w-4 h-4" />{data.demand_trend}
                            </div>
                        </div>
                        {/* Risk */}
                        <div className="p-3 rounded-xl bg-card border border-border/50">
                            <p className="text-xs text-muted-foreground font-medium mb-1.5">{t.risk}</p>
                            <div className={`font-black text-2xl ${riskColor(data.risk_score)}`}>
                                {data.risk_score}<span className="text-sm text-muted-foreground font-normal">/10</span>
                            </div>
                        </div>
                        {/* Competition */}
                        <div className="p-3 rounded-xl bg-card border border-border/50">
                            <p className="text-xs text-muted-foreground font-medium mb-1.5">{t.competition}</p>
                            <Badge className={`text-xs font-bold px-2 py-0.5 border ${demandColor(data.competition_level)}`}>
                                {data.competition_level}
                            </Badge>
                        </div>
                    </div>

                    {/* Details row */}
                    <div className="grid md:grid-cols-4 gap-3 mb-5">
                        {[
                            { label: t.margin, value: data.profit_margin_estimate, icon: Target },
                            { label: t.investment, value: data.investment_range, icon: Zap },
                            { label: t.season, value: data.best_season, icon: Globe2 },
                            { label: t.marketSize, value: data.market_size, icon: BarChart3 },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="p-3 rounded-xl bg-card border border-border/50">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Icon className="w-3.5 h-3.5 text-primary" />
                                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                                </div>
                                <p className="font-semibold text-sm">{value || "—"}</p>
                            </div>
                        ))}
                    </div>

                    {/* Markets */}
                    {data.top_markets?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {data.top_markets.map(m => (
                                <Badge key={m} variant="secondary" className="text-xs gap-1">
                                    <Globe2 className="w-3 h-3" />{m}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Top Products toggle */}
                    {data.top_products?.length > 0 && (
                        <div>
                            <Button variant="ghost" size="sm" className="gap-2 text-xs w-full border border-border/50 rounded-xl"
                                onClick={() => setShowProducts(v => !v)}>
                                {showProducts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                {showProducts ? t.hide : t.showMore} ({data.top_products.length})
                            </Button>

                            {showProducts && (
                                <div className="mt-4 overflow-x-auto rounded-xl border border-border/50">
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                {[t.topProducts.slice(0, 8), t.country, t.globalDemand, t.price, t.marginEst, t.investRange].map(h => (
                                                    <th key={h} className="text-left px-3 py-2.5 font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                            {data.top_products.map((p: TopProduct, i: number) => (
                                                <tr key={i} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-3 py-2.5 font-medium">{p.name}</td>
                                                    <td className="px-3 py-2.5 text-muted-foreground">{p.country_of_origin}</td>
                                                    <td className="px-3 py-2.5">
                                                        <Badge className={`text-[10px] px-1.5 py-0 border ${demandColor(p.global_demand)}`}>{p.global_demand}</Badge>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-muted-foreground">{p.price_range}</td>
                                                    <td className="px-3 py-2.5 text-emerald-600 font-semibold">{p.margin_estimate}</td>
                                                    <td className="px-3 py-2.5 text-muted-foreground">{p.investment_range}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
