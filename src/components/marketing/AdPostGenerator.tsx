import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Sparkles, Download, Save, Loader2, Trash2, Star, RefreshCw, Info, Eye, X } from "lucide-react";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";

// ─────────────────────────────────────────────────────────────────────────────
interface AdPost {
  id?: string;
  type: string;
  headline: string;
  caption: string;
  cta: string;
  hashtags: string;
  suggested_time: string;
  is_favorite?: boolean;
}

interface AdPostGeneratorProps {
  businessName?: string;
  businessType?: string;
  planId?: string;
  planName?: string;
  userId?: string;
}

// ── Background images ─────────────────────────────────────────────────────────
const getBgImage = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("food") || t.includes("restaurant") || t.includes("bakery") || t.includes("cafe"))
    return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80";
  if (t.includes("fashion") || t.includes("clothing") || t.includes("apparel"))
    return "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1080&q=80";
  if (t.includes("tech") || t.includes("digital") || t.includes("software"))
    return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1080&q=80";
  if (t.includes("fitness") || t.includes("gym") || t.includes("health"))
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1080&q=80";
  if (t.includes("beauty") || t.includes("salon") || t.includes("spa"))
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1080&q=80";
  if (t.includes("travel") || t.includes("tour") || t.includes("hotel"))
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1080&q=80";
  if (t.includes("education") || t.includes("school") || t.includes("training"))
    return "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1080&q=80";
  if (t.includes("coffee") || t.includes("tea"))
    return "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&q=80";
  if (t.includes("retail") || t.includes("shop") || t.includes("store"))
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1080&q=80";
  return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1080&q=80";
};

// ─────────────────────────────────────────────────────────────────────────────
// ALL SIZES ARE IN FIXED PX — tuned for a 540×540 render box.
// This ensures html2canvas captures exactly what you see.
// ─────────────────────────────────────────────────────────────────────────────

/** TEMPLATE 1 — IMPACT  (Promotional / Launch) */
const TemplateImpact = ({
  ad, bName, bType, id, onClick, isSelected,
}: { ad: AdPost; bName: string; bType: string; id: string; onClick?: () => void; isSelected?: boolean }) => {
  const bg = getBgImage(bType);
  const tags = (ad.hashtags || "").split(/\s+/).filter(Boolean).slice(0, 4);
  const headline = (ad.headline || "").toUpperCase();

  return (
    <div id={id} onClick={onClick}
      style={{
        position: "relative", width: 540, height: 540,
        fontFamily: "'Arial Black', 'Inter', Arial, sans-serif",
        overflow: "hidden", background: "#0a0a0a",
        cursor: onClick ? "pointer" : "default", flexShrink: 0,
      }}
    >
      {/* Background photo */}
      <img src={bg} alt="" crossOrigin="anonymous"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", filter: "brightness(0.38) saturate(1.2)"
        }} />

      {/* Bottom vignette darkens the lower half */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 35%, rgba(0,0,0,0.9) 100%)"
      }} />

      {/* Purple→pink colour wash at ~40% */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(124,58,237,0.45) 0%, rgba(236,72,153,0.35) 100%)"
      }} />

      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 5,
        background: "linear-gradient(90deg,#7c3aed,#ec4899,#f97316)"
      }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "30px 32px" }}>
        {/* Brand row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#a855f7",
              boxShadow: "0 0 10px #a855f7", flexShrink: 0
            }} />
            <span style={{
              color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
              maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {bName || "YOUR BRAND"}
            </span>
          </div>
          {onClick !== undefined && (
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              border: `2.5px solid ${isSelected ? "#a855f7" : "rgba(255,255,255,0.4)"}`,
              background: isSelected ? "#a855f7" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {isSelected && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#fff" }} />}
            </div>
          )}
        </div>

        {/* Centre: badge + big headline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 16 }}>
          <div style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #7c3aed, #ec4899)",
            padding: "5px 18px", borderRadius: 999, color: "#fff",
            fontSize: 10, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase",
          }}>
            ✦ {ad.type} ✦
          </div>

          <h2 style={{
            margin: 0, color: "#fff", fontWeight: 900, lineHeight: 1.05,
            fontSize: 42, textTransform: "uppercase",
            textShadow: "0 3px 20px rgba(168,85,247,0.7), 0 2px 4px rgba(0,0,0,0.8)",
            letterSpacing: "-0.01em", wordBreak: "break-word", maxWidth: 460,
          }}>
            {headline}
          </h2>

          <p style={{
            margin: 0, color: "rgba(255,255,255,0.78)", fontSize: 13,
            fontFamily: "Arial, sans-serif", fontWeight: 400, lineHeight: 1.5,
            maxWidth: 420, wordBreak: "break-word",
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {ad.caption}
          </p>
        </div>

        {/* Bottom: CTA + tags + footer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <div style={{
            background: "linear-gradient(90deg,#7c3aed,#ec4899)", color: "#fff",
            padding: "10px 28px", borderRadius: 999, fontSize: 13, fontWeight: 800,
            letterSpacing: "0.05em", boxShadow: "0 4px 20px rgba(168,85,247,0.55)",
          }}>
            {ad.cta} →
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {tags.map((t, i) => (
              <span key={i} style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "Arial,sans-serif" }}>{t}</span>
            ))}
          </div>
          <div style={{
            width: "100%", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 8,
            display: "flex", justifyContent: "space-between"
          }}>
            <span style={{
              color: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "Arial,sans-serif",
              letterSpacing: "0.12em", textTransform: "uppercase"
            }}>{bType || "Business"}</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "Arial,sans-serif" }}>StartupDesk AI ✦</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** TEMPLATE 2 — SPLIT  (Problem-Solution) */
const TemplateSplit = ({
  ad, bName, bType, id, onClick, isSelected,
}: { ad: AdPost; bName: string; bType: string; id: string; onClick?: () => void; isSelected?: boolean }) => {
  const bg = getBgImage(bType);
  const tags = (ad.hashtags || "").split(/\s+/).filter(Boolean).slice(0, 5);
  const words = (ad.headline || "").split(" ");
  const bigWord = words[0] || "";
  const restWords = words.slice(1).join(" ");

  return (
    <div id={id} onClick={onClick}
      style={{
        position: "relative", width: 540, height: 540,
        fontFamily: "Arial, 'Inter', sans-serif",
        overflow: "hidden", background: "#111827",
        cursor: onClick ? "pointer" : "default", flexShrink: 0,
      }}
    >
      {/* Photo top half */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 310, overflow: "hidden" }}>
        <img src={bg} alt="" crossOrigin="anonymous"
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55) saturate(1.3)" }} />
        {/* Gradient fade into dark bottom */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(17,24,39,0) 55%, rgba(17,24,39,1) 100%)"
        }} />

        {/* Brand tag */}
        <div style={{
          position: "absolute", top: 20, left: 24,
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
          padding: "5px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)"
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 8px #38bdf8", flexShrink: 0 }} />
          <span style={{
            color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
          }}>
            {bName || "YOUR BRAND"}
          </span>
        </div>

        {/* Selection indicator */}
        {onClick !== undefined && (
          <div style={{
            position: "absolute", top: 20, right: 24,
            width: 24, height: 24, borderRadius: "50%",
            border: `2.5px solid ${isSelected ? "#38bdf8" : "rgba(255,255,255,0.4)"}`,
            background: isSelected ? "#38bdf8" : "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {isSelected && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#fff" }} />}
          </div>
        )}

        {/* Big word + type over photo */}
        <div style={{ position: "absolute", bottom: 16, left: 24, right: 24 }}>
          <div style={{
            display: "inline-block", background: "#38bdf8", padding: "2px 12px",
            borderRadius: 4, marginBottom: 6, fontSize: 9, fontWeight: 800,
            color: "#0c4a6e", letterSpacing: "0.18em", textTransform: "uppercase"
          }}>
            ● {ad.type}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              color: "#38bdf8", fontSize: 52, fontWeight: 900, lineHeight: 0.95,
              textShadow: "0 0 30px rgba(56,189,248,0.5)", fontFamily: "'Arial Black', Arial, sans-serif"
            }}>
              {bigWord}
            </span>
            {restWords && (
              <span style={{
                color: "#fff", fontSize: 28, fontWeight: 800, lineHeight: 1,
                fontFamily: "'Arial Black', Arial, sans-serif"
              }}>
                {restWords}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dark bottom card */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 240,
        background: "#111827", padding: "14px 24px 18px"
      }}>
        <p style={{
          color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.55, margin: "0 0 14px 0",
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical"
        }}>
          {ad.caption}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{
            background: "#38bdf8", color: "#0c4a6e", padding: "8px 20px", borderRadius: 999,
            fontSize: 12, fontWeight: 800, letterSpacing: "0.04em",
            boxShadow: "0 3px 12px rgba(56,189,248,0.4)", flexShrink: 0
          }}>
            {ad.cta} →
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end" }}>
            {tags.map((t, i) => (
              <span key={i} style={{
                background: "rgba(56,189,248,0.12)", color: "#38bdf8",
                padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 600,
                border: "1px solid rgba(56,189,248,0.25)"
              }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 12, paddingTop: 10,
          display: "flex", justifyContent: "space-between"
        }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {bType || "Business"}
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>StartupDesk AI ✦</span>
        </div>
      </div>
    </div>
  );
};

/** TEMPLATE 3 — PRESTIGE  (Trust-Building) */
const TemplatePrestige = ({
  ad, bName, bType, id, onClick, isSelected, cardIndex,
}: { ad: AdPost; bName: string; bType: string; id: string; onClick?: () => void; isSelected?: boolean; cardIndex?: number }) => {
  const bg = getBgImage(bType);
  const tags = (ad.hashtags || "").split(/\s+/).filter(Boolean).slice(0, 4);

  return (
    <div id={id} onClick={onClick}
      style={{
        position: "relative", width: 540, height: 540,
        fontFamily: "Georgia, 'Times New Roman', serif",
        overflow: "hidden", background: "#0a0a0a",
        cursor: onClick ? "pointer" : "default", flexShrink: 0,
      }}
    >
      {/* Full bleed photo */}
      <img src={bg} alt="" crossOrigin="anonymous"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", filter: "brightness(0.45) saturate(0.85) sepia(0.1)"
        }} />

      {/* Directional vignette — strong right side for text panel */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(100deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.85) 100%)"
      }} />

      {/* Decorative number watermark */}
      <div style={{
        position: "absolute", left: -10, bottom: 20,
        fontSize: 200, fontWeight: 900, lineHeight: 1, color: "rgba(255,255,255,0.04)",
        fontFamily: "'Arial Black', Arial, sans-serif", userSelect: "none", letterSpacing: "-0.05em"
      }}>
        {String(cardIndex || 1).padStart(2, "0")}
      </div>

      {/* Gold top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 5,
        background: "linear-gradient(90deg,#d97706,#f59e0b,#fbbf24)"
      }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "30px 30px" }}>
        {/* Brand row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 3, background: "linear-gradient(90deg,#d97706,#fbbf24)", borderRadius: 2 }} />
            <span style={{
              color: "rgba(255,255,255,0.9)", fontSize: 10,
              fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
              maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {bName || "YOUR BRAND"}
            </span>
          </div>
          {onClick !== undefined && (
            <div style={{
              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
              border: `2px solid ${isSelected ? "#f59e0b" : "rgba(255,255,255,0.35)"}`,
              background: isSelected ? "#f59e0b" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {isSelected && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#fff" }} />}
            </div>
          )}
        </div>

        {/* Right-aligned content */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "flex-end", textAlign: "right", gap: 14
        }}>
          {/* Type badge — minimal border */}
          <div style={{
            border: "1px solid rgba(251,191,36,0.5)", padding: "3px 14px", borderRadius: 3,
            fontSize: 9, fontWeight: 700, color: "#fbbf24",
            fontFamily: "Arial, sans-serif", letterSpacing: "0.18em", textTransform: "uppercase"
          }}>
            {ad.type}
          </div>

          {/* Headline */}
          <h2 style={{
            margin: 0, color: "#fff", fontWeight: 700, lineHeight: 1.15,
            fontSize: 34, textShadow: "0 2px 16px rgba(0,0,0,0.7)", wordBreak: "break-word", maxWidth: 400
          }}>
            {ad.headline}
          </h2>

          {/* Gold divider */}
          <div style={{ height: 2, width: 280, background: "linear-gradient(90deg,transparent,#f59e0b)", borderRadius: 2 }} />

          <p style={{
            margin: 0, color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 1.6,
            fontFamily: "Arial, sans-serif", fontWeight: 400, maxWidth: 400,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical"
          }}>
            {ad.caption}
          </p>

          {/* CTA — gold outline */}
          <div style={{
            background: "transparent", color: "#fbbf24",
            padding: "8px 22px", borderRadius: 3, fontSize: 11, fontWeight: 700,
            fontFamily: "Arial, sans-serif", letterSpacing: "0.08em",
            border: "2px solid #f59e0b", textTransform: "uppercase",
            boxShadow: "0 0 16px rgba(245,158,11,0.3)"
          }}>
            {ad.cta} →
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {tags.map((t, i) => (
              <span key={i} style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "Arial,sans-serif" }}>{t}</span>
            ))}
          </div>
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, fontFamily: "Arial,sans-serif" }}>StartupDesk AI ✦</span>
        </div>
      </div>
    </div>
  );
};

// ── Pick template by ad type ──────────────────────────────────────────────────
const renderTemplate = (
  ad: AdPost, id: string, bName: string, bType: string,
  onClick?: () => void, isSelected?: boolean, cardIndex?: number
) => {
  const t = (ad.type || "").toLowerCase();
  const props = { ad, bName, bType, id, onClick, isSelected, cardIndex };
  if (t.includes("launch") || t.includes("promotional")) return <TemplateImpact {...props} />;
  if (t.includes("problem") || t.includes("solution")) return <TemplateSplit {...props} />;
  return <TemplatePrestige {...props} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function AdPostGenerator({
  businessName = "", businessType = "", planId = "", planName = "", userId = "",
}: AdPostGeneratorProps) {
  const [formData, setFormData] = useState({
    business_name: businessName, business_type: businessType,
    target_audience: "General Public", tone: "Professional",
  });
  const [ads, setAds] = useState<AdPost[]>([]);
  const [existingAds, setExistingAds] = useState<AdPost[]>([]);
  const [selectedAds, setSelectedAds] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewAd, setPreviewAd] = useState<{ ad: AdPost; index: number; isExisting: boolean } | null>(null);

  const toggleSel = (i: number) => {
    const s = new Set(selectedAds);
    s.has(i) ? s.delete(i) : s.add(i);
    setSelectedAds(s);
  };

  useEffect(() => { if (planId && userId) loadExistingAds(); }, [planId, userId]);

  const loadExistingAds = async () => {
    try {
      const res = await fetch(`/api/get-plan-ads/${planId}?user_id=${userId}`);
      const data = await res.json();
      if (data.success) setExistingAds(data.ads || []);
    } catch { /* silent */ }
  };

  const handleGenerate = async () => {
    if (!formData.business_name || !formData.business_type) {
      toast.error("Fill in business name and type"); return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-ad-posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setAds(data.ads || []);
      setSelectedAds(new Set());
      toast.success("3 unique ad creatives generated!");
    } catch { toast.error("Failed to generate ads"); }
    finally { setIsGenerating(false); }
  };

  const captureAd = async (elId: string): Promise<Blob | null> => {
    const el = document.getElementById(elId);
    if (!el) return null;
    try {
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 540,
        height: 540,
        windowWidth: 1920, // ← fixes the vw issue even for legacy uses; here we use fixed px anyway
        windowHeight: 1080,
      });
      return new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
    } catch { return null; }
  };

  const handleDownload = async (index: number, isExisting = false) => {
    const elId = isExisting ? `existing-ad-${index}` : `new-ad-${index}`;
    toast.info("Preparing download...");
    const blob = await captureAd(elId);
    if (!blob) { toast.error("Download failed"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(formData.business_name || "ad").replace(/\s+/g, "-")}-${index + 1}.png`;
    a.click();
    toast.success("Downloaded 1080×1080 PNG!");
  };

  const handleSaveAds = async () => {
    if (selectedAds.size === 0) { toast.error("Select at least one ad"); return; }
    setIsSaving(true);
    try {
      const adsToSave = ads.filter((_, i) => selectedAds.has(i));
      const fd = new FormData();
      fd.append("user_id", userId); fd.append("plan_id", planId);
      fd.append("plan_name", planName); fd.append("ad_data", JSON.stringify(adsToSave));

      let imgCount = 0;
      for (let i = 0; i < adsToSave.length; i++) {
        const originalIdx = ads.indexOf(adsToSave[i]);
        const blob = await captureAd(`new-ad-${originalIdx}`);
        if (blob) { fd.append(`image_${imgCount}`, blob, `ad_${imgCount}.png`); imgCount++; }
      }

      const res = await fetch("/api/save-plan-ads", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        toast.success("Ads saved!");

        if (userId) {
          // Award points for generating and saving ads
          await supabase.rpc("award_points", {
            p_user_id: userId,
            p_activity_type: "ads_generated",
            p_points: 15,
            p_description: "Generated marketing creatives"
          });
        }

        await loadExistingAds();
        setAds([]); setSelectedAds(new Set());
      }
    } catch { toast.error("Failed to save"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (adId: string) => {
    try {
      await fetch(`/api/delete-plan-ad/${adId}?user_id=${userId}`, { method: "DELETE" });
      toast.success("Deleted"); await loadExistingAds();
    } catch { toast.error("Failed to delete"); }
  };

  const handleFave = async (adId: string) => {
    try {
      await fetch(`/api/toggle-favorite-ad/${adId}?user_id=${userId}`, { method: "PATCH" });
      await loadExistingAds();
    } catch { toast.error("Failed"); }
  };

  // ── Ad card wrapper in the grid ───────────────────────────────────────────
  const AdCard = ({ ad, index, isExisting }: { ad: AdPost; index: number; isExisting: boolean }) => {
    const id = isExisting ? `existing-ad-${index}` : `new-ad-${index}`;
    return (
      <div className="flex flex-col gap-3">
        {/* Scaled-down preview box — template renders at 540px, we scale it down with CSS */}
        <div style={{
          width: "100%", overflow: "hidden", borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)", position: "relative"
        }}>
          {/* Scale wrapper: renders at 540px, displayed scaled down */}
          <div style={{
            width: 540, transformOrigin: "top left",
            transform: `scale(${1})`, // will be controlled by container resize below
          }}>
            <div style={{ width: "100%", aspectRatio: "1/1" }}>
              {renderTemplate(
                ad, id,
                formData.business_name, formData.business_type,
                !isExisting ? () => toggleSel(index) : undefined,
                selectedAds.has(index),
                index + 1
              )}
            </div>
          </div>
          {/* Selection highlight ring */}
          {!isExisting && selectedAds.has(index) && (
            <div style={{
              position: "absolute", inset: 0, borderRadius: 16,
              border: "3px solid #7c3aed", pointerEvents: "none"
            }} />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => setPreviewAd({ ad, index, isExisting })}>
            <Eye className="w-3.5 h-3.5" />Preview
          </Button>
          <Button variant="default" size="sm" className="flex-1 gap-1.5" onClick={() => handleDownload(index, isExisting)}>
            <Download className="w-3.5 h-3.5" />Download
          </Button>
          {isExisting && ad.id ? (
            <>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => handleFave(ad.id!)}>
                <Star className={`w-3.5 h-3.5 ${ad.is_favorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(ad.id!)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : !isExisting ? (
            <Button
              variant={selectedAds.has(index) ? "default" : "outline"} size="sm"
              className="flex-1 gap-1" onClick={() => toggleSel(index)}>
              {selectedAds.has(index) ? "✓ Selected" : "Select"}
            </Button>
          ) : null}
        </div>
        {ad.suggested_time && (
          <p className="text-xs text-center text-muted-foreground">📅 {ad.suggested_time}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">

      {/* ── FULL-SCREEN PREVIEW MODAL ────────────────────────────────────── */}
      {previewAd && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 20
          }}
          onClick={() => setPreviewAd(null)}
        >
          <button
            style={{
              position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 44, height: 44,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff"
            }}
            onClick={() => setPreviewAd(null)}
          >
            <X style={{ width: 22, height: 22 }} />
          </button>

          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Preview — {previewAd.ad.type}
          </div>

          {/* Full 540×540 preview */}
          <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}>
            {renderTemplate(
              previewAd.ad,
              `preview-ad-${previewAd.index}`,
              formData.business_name,
              formData.business_type,
              undefined, false, previewAd.index + 1
            )}
          </div>

          <div style={{ display: "flex", gap: 12 }} onClick={(e) => e.stopPropagation()}>
            <Button variant="default" size="lg" className="gap-2"
              onClick={() => handleDownload(previewAd.index, previewAd.isExisting)}>
              <Download className="w-4 h-4" />Download 1080×1080
            </Button>
            <Button variant="outline" size="lg" className="gap-2 text-white border-white/30 hover:bg-white/10"
              onClick={() => setPreviewAd(null)}>
              <X className="w-4 h-4" />Close
            </Button>
          </div>
        </div>
      )}

      {/* ── Saved Ads ────────────────────────────────────────────────────── */}
      {existingAds.length > 0 && (
        <div>
          <Alert className="mb-5 border-primary/50 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="font-medium">
              ✅ {existingAds.length} saved ad{existingAds.length > 1 ? "s" : ""} for this plan
            </AlertDescription>
          </Alert>
          <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />Saved Creatives
          </h3>
          {/* Scaled grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {existingAds.map((ad, i) => <AdCard key={ad.id || i} ad={ad} index={i} isExisting />)}
          </div>
        </div>
      )}

      {/* ── Generator Form ───────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />Generate Ad Creatives
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              3 unique professional templates: IMPACT · SPLIT · PRESTIGE
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input placeholder="Your Business Name" value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Input placeholder="e.g. Bakery, Tech Startup, Salon" value={formData.business_type}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input placeholder="e.g. Young Professionals, Families" value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={formData.tone} onValueChange={(v) => setFormData({ ...formData, tone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Local">Local & Friendly</SelectItem>
                  <SelectItem value="Trendy">Trendy & Modern</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
            {isGenerating
              ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</>
              : <><Sparkles className="w-5 h-5 mr-2" />Generate 3 Unique Creatives</>}
          </Button>
        </CardContent>
      </Card>

      {/* Template legend */}
      {ads.length === 0 && (
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { name: "IMPACT", desc: "Promo / Launch", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30" },
            { name: "SPLIT", desc: "Problem-Solution", color: "from-sky-500/20 to-indigo-500/20", border: "border-sky-500/30" },
            { name: "PRESTIGE", desc: "Trust Building", color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/30" },
          ].map((t) => (
            <div key={t.name} className={`rounded-xl p-3 bg-gradient-to-br ${t.color} border ${t.border}`}>
              <div className="text-xs font-black tracking-widest mb-0.5">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── New ads ─────────────────────────────────────────────────────── */}
      {ads.length > 0 && (
        <div>
          <Alert className="mb-5 border-orange-500/50 bg-orange-500/10">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-orange-700 font-medium">⚠️ Not saved — select ads, then save.</span>
              <div className="flex gap-2">
                <Button variant="default" size="sm" onClick={handleSaveAds} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                  Save ({selectedAds.size})
                </Button>
                <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                  <RefreshCw className="w-4 h-4 mr-1" />Regenerate
                </Button>
              </div>
            </AlertDescription>
          </Alert>
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />Generated Creatives
          </h3>
          <p className="text-sm text-muted-foreground mb-5">Click each to select. Use Preview for full-size. Download saves 1080×1080 PNG.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {ads.map((ad, i) => <AdCard key={i} ad={ad} index={i} isExisting={false} />)}
          </div>
        </div>
      )}
    </div>
  );
}
