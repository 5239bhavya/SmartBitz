import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Download,
  Copy,
  Trash2,
  Star,
  Clock,
  Loader2,
  Folder,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SavedAd {
  id: string;
  plan_id: string;
  plan_name: string;
  ad_type: string;
  headline: string;
  caption: string;
  cta: string;
  hashtags: string;
  suggested_time: string;
  is_favorite: boolean;
  created_at: string;
}

interface SavedAdsSectionProps {
  planId?: string; // Optional now, as we might show all ads
  userId: string;
}

export function SavedAdsSection({ planId, userId }: SavedAdsSectionProps) {
  const [ads, setAds] = useState<SavedAd[]>([]);
  const [groupedAds, setGroupedAds] = useState<Record<string, SavedAd[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId && userId.trim() !== "") {
      loadAds();
    }
  }, [planId, userId]);

  const loadAds = async () => {
    setIsLoading(true);
    try {
      let url = `http://127.0.0.1:5000/api/get-plan-ads/${planId || "all"}?user_id=${userId}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const fetchedAds = data.ads || [];
        setAds(fetchedAds);

        // Group ads by plan_name
        const grouped = fetchedAds.reduce(
          (acc: Record<string, SavedAd[]>, ad: SavedAd) => {
            const key = ad.plan_name || "Unknown Plan";
            if (!acc[key]) acc[key] = [];
            acc[key].push(ad);
            return acc;
          },
          {},
        );
        setGroupedAds(grouped);
      }
    } catch (error: any) {
      console.error("Error loading ads:", error);
      const isNetworkError = error instanceof TypeError && error.message.includes("fetch");
      if (isNetworkError) {
        toast.error("Could not connect to the ads server. Please ensure the backend (python app.py) is running.");
      } else {
        toast.error(error.message || "Failed to load ads");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/delete-plan-ad/${adId}?user_id=${userId}`,
        { method: "DELETE" },
      );

      if (!response.ok) throw new Error("Failed to delete ad");

      toast.success("Ad deleted successfully");
      await loadAds();
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error("Failed to delete ad");
    }
  };

  const handleToggleFavorite = async (adId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/toggle-favorite-ad/${adId}?user_id=${userId}`,
        { method: "PATCH" },
      );

      if (!response.ok) throw new Error("Failed to toggle favorite");

      await loadAds();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite");
    }
  };

  const handleDownloadImage = (adId: string, _headline: string) => {
    const ad = ads.find((a) => a.id === adId);
    if (!ad) return;

    // --- Canvas dimensions (1080x1080 Instagram square) ---
    const SIZE = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;

    // Helper: wrap text and return lines
    const wrapText = (text: string, maxWidth: number, font: string): string[] => {
      ctx.font = font;
      const words = text.split(" ");
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      return lines;
    };

    // --- Background gradient by ad type ---
    const gradients: Record<string, [string, string]> = {
      "Promotional Launch": ["#1a237e", "#283593"],
      "Problem-Solution": ["#1b5e20", "#2e7d32"],
      "Trust Building": ["#4a148c", "#6a1b9a"],
      "Trust Building Post": ["#4a148c", "#6a1b9a"],
    };
    const [c1, c2] = gradients[ad.ad_type] || ["#0d1b2a", "#1b263b"];
    const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
    bg.addColorStop(0, c1);
    bg.addColorStop(1, c2);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Subtle decorative circle (top-right accent)
    ctx.beginPath();
    ctx.arc(SIZE, 0, 380, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, SIZE, 320, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fill();

    const pad = 70;
    let y = pad;

    // --- Ad Type badge ---
    const badgeText = ad.ad_type.toUpperCase();
    ctx.font = "bold 26px Arial";
    const bw = ctx.measureText(badgeText).width + 40;
    const bh = 48;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    const br = 24;
    ctx.beginPath();
    ctx.roundRect(pad, y, bw, bh, br);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "bold 22px Arial";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, pad + 20, y + bh / 2);
    y += bh + 48;

    // --- Headline ---
    const headlineFont = "bold 68px Arial";
    const headlineLines = wrapText(ad.headline, SIZE - pad * 2, headlineFont);
    ctx.font = headlineFont;
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "top";
    for (const line of headlineLines) {
      ctx.fillText(line, pad, y);
      y += 80;
    }
    y += 20;

    // Divider line
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(SIZE - pad, y);
    ctx.stroke();
    y += 36;

    // --- Caption ---
    const captionFont = "36px Arial";
    const captionLines = wrapText(ad.caption, SIZE - pad * 2, captionFont);
    ctx.font = captionFont;
    ctx.fillStyle = "rgba(255,255,255,0.80)";
    const maxCaptionLines = 5;
    const shownLines = captionLines.slice(0, maxCaptionLines);
    for (let i = 0; i < shownLines.length; i++) {
      const line = i === maxCaptionLines - 1 && captionLines.length > maxCaptionLines
        ? shownLines[i].replace(/\s?\w+$/, "…")
        : shownLines[i];
      ctx.fillText(line, pad, y);
      y += 50;
    }
    y += 30;

    // --- CTA button ---
    const ctaBg = ctx.createLinearGradient(pad, y, SIZE - pad, y + 80);
    ctaBg.addColorStop(0, "rgba(255,255,255,0.25)");
    ctaBg.addColorStop(1, "rgba(255,255,255,0.10)");
    ctx.fillStyle = ctaBg;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pad, y, SIZE - pad * 2, 80, 40);
    ctx.fill();
    ctx.stroke();
    ctx.font = "bold 38px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(ad.cta, SIZE / 2, y + 40);
    ctx.textAlign = "left";
    y += 110;

    // --- Hashtags ---
    if (ad.hashtags) {
      const tags = ad.hashtags.split(/[\s,]+/).filter((t: string) => t.startsWith("#"));
      ctx.font = "28px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.textBaseline = "top";
      const tagText = tags.slice(0, 5).join("  ");
      ctx.fillText(tagText, pad, y);
      y += 44;
    }

    // --- Best time ---
    if (ad.suggested_time) {
      ctx.font = "italic 26px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.textBaseline = "top";
      ctx.fillText(`⏰  Best time: ${ad.suggested_time}`, pad, y);
    }

    // --- Bottom branding strip ---
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, SIZE - 70, SIZE, 70);
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("Generated by StartupDesk · startupdesk.in", SIZE / 2, SIZE - 35);

    // --- Download ---
    const link = document.createElement("a");
    link.download = `${ad.headline.replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Ad image downloaded!");
  };


  const handleCopyCaption = (ad: SavedAd) => {
    const fullText = `${ad.headline}\n\n${ad.caption}\n\n${ad.cta}\n\n${ad.hashtags}`;
    navigator.clipboard.writeText(fullText);
    toast.success("Caption copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No saved ads found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(groupedAds).map(([planName, planAds], groupIndex) => (
          <AccordionItem key={groupIndex} value={`item-${groupIndex}`}>
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-primary" />
                {planName}
                <Badge variant="secondary" className="ml-2">
                  {planAds.length} ads
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid md:grid-cols-2 gap-5 pt-4">
                {planAds.map((ad) => {
                  const typeColors: Record<string, string> = {
                    "Promotional Launch": "from-blue-500/15 to-blue-500/5 border-blue-400/30",
                    "Problem-Solution": "from-green-500/15 to-green-500/5 border-green-400/30",
                    "Trust Building": "from-amber-500/15 to-amber-500/5 border-amber-400/30",
                    "Trust Building Post": "from-amber-500/15 to-amber-500/5 border-amber-400/30",
                  };
                  const colors = typeColors[ad.ad_type] || "from-primary/15 to-primary/5 border-primary/20";

                  const hashtags = ad.hashtags
                    ? ad.hashtags.split(/[\s,]+/).filter((t: string) => t.startsWith("#"))
                    : [];

                  return (
                    <div
                      key={ad.id}
                      id={`saved-ad-${ad.id}`}
                      className={`rounded-xl border-2 bg-gradient-to-br overflow-hidden ${colors} flex flex-col`}
                    >
                      {/* Header */}
                      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
                        <Badge variant="outline" className="text-xs bg-background/60 flex-shrink-0">
                          {ad.ad_type}
                        </Badge>
                        {ad.is_favorite && (
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Headline */}
                      <div className="px-4 pb-3">
                        <h3 className="text-base font-bold leading-snug text-foreground">
                          {ad.headline}
                        </h3>
                      </div>

                      {/* Divider */}
                      <div className="mx-4 border-t border-border/40" />

                      {/* Caption — full, no truncation */}
                      <div className="px-4 py-3 flex-1">
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                          {ad.caption}
                        </p>
                      </div>

                      {/* CTA */}
                      <div className="px-4 pb-3">
                        <div className="w-full rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-center">
                          <p className="text-sm font-semibold text-primary">{ad.cta}</p>
                        </div>
                      </div>

                      {/* Hashtags */}
                      {hashtags.length > 0 && (
                        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                          {hashtags.map((tag: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Best time */}
                      {ad.suggested_time && (
                        <div className="px-4 pb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Best time: {ad.suggested_time}</span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="px-4 pb-4 flex items-center gap-2 border-t border-border/40 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-background/60"
                          onClick={() => handleDownloadImage(ad.id, ad.headline)}
                        >
                          <Download className="w-3 h-3 mr-1.5" />
                          Save Image
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-background/60"
                          onClick={() => handleCopyCaption(ad)}
                        >
                          <Copy className="w-3 h-3 mr-1.5" />
                          Copy All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`bg-background/60 ${ad.is_favorite ? "border-yellow-400 text-yellow-500" : ""}`}
                          onClick={() => handleToggleFavorite(ad.id)}
                          title={ad.is_favorite ? "Remove from favourites" : "Add to favourites"}
                        >
                          <Star className={`w-3.5 h-3.5 ${ad.is_favorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Delete ad"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
