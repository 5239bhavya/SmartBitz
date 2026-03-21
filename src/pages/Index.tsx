import React, { useEffect, useRef, Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";

// Lazy load below-the-fold components to improve initial page load speed
const FeaturesSection = React.lazy(() => import("@/components/home/FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const HowItWorks = React.lazy(() => import("@/components/home/HowItWorks").then(m => ({ default: m.HowItWorks })));
const CTASection = React.lazy(() => import("@/components/home/CTASection").then(m => ({ default: m.CTASection })));
const StatsSection = React.lazy(() => import("@/components/home/StatsSection").then(m => ({ default: m.StatsSection })));
const Testimonials = React.lazy(() => import("@/components/home/Testimonials").then(m => ({ default: m.Testimonials })));

const Index = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const t = setTimeout(() => (el.dataset.staggerReady = "true"), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        ref={containerRef}
        data-stagger-ready={"false"}
        className="flex-1 stagger"
      >
        <HeroSection />
        <Suspense fallback={<div className="h-64 flex items-center justify-center opacity-50">Loading section...</div>}>
          <FeaturesSection />
          <StatsSection />
          <Testimonials />
          <HowItWorks />
          <CTASection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
