import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

const perks = [
  "No credit card required",
  "Instant AI-generated plan",
  "100% free to start",
];

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] animate-gradient-shift" style={{ background: "var(--gradient-primary)" }}>
          {/* Light orbs */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.12)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,transparent_50%)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-float-delayed" />
          {/* Grid texture */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

          <div className="relative mx-auto max-w-2xl text-center px-8 py-16 md:py-20">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white animate-scale-bounce">
              <Sparkles className="h-4 w-4 animate-pulse-glow" />
              <span>Start Your Journey Today</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl mb-4 animate-slide-up leading-tight">
              Ready to Start<br />Your Business?
            </h2>
            <p
              className="text-lg text-white/85 mb-8 animate-slide-up leading-relaxed"
              style={{ animationDelay: "0.1s" }}
            >
              Get your personalized AI-powered business plan in minutes.
              No guesswork, just practical, data-driven guidance.
            </p>

            {/* Perks list */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              {perks.map((p) => (
                <div key={p} className="flex items-center gap-1.5 text-sm text-white/80">
                  <CheckCircle2 className="h-4 w-4 text-white/60 shrink-0" />
                  {p}
                </div>
              ))}
            </div>

            <div
              className="animate-scale-bounce"
              style={{ animationDelay: "0.2s" }}
            >
              <Link to="/start">
                <Button
                  size="xl"
                  className="bg-white text-foreground hover:bg-white/90 hover:scale-105 active:scale-95 group shadow-2xl font-bold text-base px-8 py-4 h-auto rounded-2xl"
                >
                  Get Your Free Business Plan
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
