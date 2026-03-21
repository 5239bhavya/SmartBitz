import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  MapPin,
  IndianRupee,
  BarChart3,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  Play,
} from "lucide-react";

export function HeroSection() {
  const [hasBusiness, setHasBusiness] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const storedBusiness = sessionStorage.getItem("selectedBusiness");
    if (storedBusiness) {
      const business = JSON.parse(storedBusiness);
      setHasBusiness(true);
      setBusinessName(business.name);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    };
    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener("mousemove", handleMouseMove);
      return () => hero.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const highlights = [
    "AI-Generated Business Plans",
    "Live Market Trends",
    "Compliance Tracker",
    "Digital ERP & Khata",
  ];

  const pillFeatures = [
    { icon: IndianRupee, label: "Investment Planning" },
    { icon: TrendingUp, label: "Profit Estimation" },
    { icon: Users, label: "Workforce Guide" },
    { icon: MapPin, label: "Location Advice" },
    { icon: BarChart3, label: "Growth Roadmap" },
  ];

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden min-h-[100vh] flex items-center bg-background"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      {/* Mouse-tracking glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(ellipse 900px 700px at ${mousePosition.x}% ${mousePosition.y}%, rgba(99,60,255,0.12), rgba(16,185,129,0.07) 55%, transparent 80%)`,
        }}
      />

      {/* Floating color orbs */}
      <div
        className="absolute top-20 left-[8%] w-72 h-72 rounded-full blur-[90px] animate-float opacity-60"
        style={{ background: "radial-gradient(circle, rgba(99,60,255,0.25), transparent 70%)", transform: `translate(${(mousePosition.x - 50) * 0.05}px, ${(mousePosition.y - 50) * 0.05}px)` }}
      />
      <div
        className="absolute bottom-24 right-[8%] w-80 h-80 rounded-full blur-[100px] animate-float-delayed opacity-50"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.2), transparent 70%)", transform: `translate(${(mousePosition.x - 50) * -0.04}px, ${(mousePosition.y - 50) * -0.04}px)` }}
      />
      <div
        className="absolute top-1/3 right-[20%] w-48 h-48 rounded-full blur-[70px] animate-float opacity-40"
        style={{ background: "radial-gradient(circle, rgba(244,114,182,0.2), transparent 70%)" }}
      />

      {/* Dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,60,255,0.10)_1px,transparent_1px)] [background-size:36px_36px] opacity-60 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_55%,transparent_100%)]" />

      {/* Subtle top border line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container relative py-24 lg:py-36 z-10">
        <div className="mx-auto max-w-5xl text-center">

          <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/25 bg-background/80 backdrop-blur-md px-5 py-2 text-sm font-semibold mb-12 animate-fade-in shadow-md hover:shadow-lg hover:border-primary/50 transition-all cursor-default">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
              <Sparkles className="h-3 w-3 text-primary" />
            </span>
            <span className="text-foreground/90">AI-Powered Business Planning</span>
            <span className="hidden sm:inline text-xs font-bold text-white bg-primary/90 px-2.5 py-0.5 rounded-full ml-1">FREE</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-5xl font-black leading-[1.04] tracking-tighter sm:text-6xl lg:text-[5.5rem] animate-slide-up">
            <span className="block text-foreground">Transform Your Idea</span>
            <span
              className="block pb-3 drop-shadow-sm bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent"
            >
              Into a Real Business
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground animate-slide-up leading-relaxed"
            style={{ animationDelay: "120ms" }}
          >
            Get an AI-powered, step-by-step business plan tailored to your budget,
            location, and interests — in under 5 minutes.
          </p>

          {/* Highlights */}
          <div
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-10 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            {highlights.map((h) => (
              <div key={h} className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                {h}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up mb-16"
            style={{ animationDelay: "0.28s" }}
          >
            {hasBusiness ? (
              <Link to="/plan">
                <Button
                  size="xl"
                  className="group text-base px-9 py-4 h-auto rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Continue {businessName} Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
            ) : (
              <Link to="/ai-agent?mode=onboarding">
                <Button
                  size="xl"
                  className="group text-base px-9 py-4 h-auto rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Start Building — It's Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
            )}
            {!hasBusiness && (
              <Link to="/ai-agent">
                <Button
                  variant="outline"
                  className="group text-base px-8 py-4 h-auto rounded-2xl border-border/60 bg-background/80 backdrop-blur-md hover:border-primary/50 hover:bg-muted transition-all font-semibold"
                >
                  <Play className="mr-2 h-4 w-4 text-primary group-hover:scale-110 transition-transform fill-primary" />
                  Watch How It Works
                </Button>
              </Link>
            )}
          </div>

          {/* Social proof + stat pills */}
          <div
            className="flex flex-wrap justify-center gap-3 mb-4 animate-fade-in"
            style={{ animationDelay: "0.45s" }}
          >
            {[
              { icon: Zap, label: "5-Minute Setup", color: "text-amber-500" },
              { icon: Target, label: "AI-Powered Plans", color: "text-primary" },
              { icon: Clock, label: "24/7 AI Advisor", color: "text-emerald-500" },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/80 bg-background/70 backdrop-blur-sm text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default"
              >
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-foreground/80">{label}</span>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div
            className="flex flex-wrap justify-center gap-2 animate-fade-in"
            style={{ animationDelay: "0.58s" }}
          >
            {pillFeatures.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border border-primary/20 bg-primary/8 text-primary hover:bg-primary/15 hover:-translate-y-0.5 transition-all cursor-default"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
