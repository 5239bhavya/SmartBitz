import React from "react";
import { Star, Quote } from "lucide-react";

const items = [
  {
    name: "Priya S.",
    role: "Founder, LocalBakery",
    text: "SmartBiz helped me build a crystal-clear plan and find my first customers within weeks. The AI was remarkably accurate about my market.",
    avatar: "https://i.pravatar.cc/64?img=5",
    rating: 5,
    accent: "from-amber-500/10 to-transparent border-amber-500/20",
  },
  {
    name: "Arjun K.",
    role: "Co-founder, FarmFresh",
    text: "The AI advisor suggested a pricing model that literally doubled our margins. I couldn't believe how practical and specific it was.",
    avatar: "https://i.pravatar.cc/64?img=12",
    rating: 5,
    accent: "from-primary/10 to-transparent border-primary/20",
  },
  {
    name: "Neha P.",
    role: "Solo Founder",
    text: "Fast, practical and actionable — absolutely perfect for first-time founders who don't know where to start.",
    avatar: "https://i.pravatar.cc/64?img=20",
    rating: 5,
    accent: "from-cyan-500/10 to-transparent border-cyan-500/20",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

      <div className="container relative">
        <div className="mx-auto max-w-4xl text-center mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
            Social Proof
          </div>
          <h3 className="text-4xl font-black tracking-tight sm:text-5xl mb-4">
            What <span className="gradient-text">Founders Say</span>
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Real feedback from entrepreneurs who launched with SmartBiz AI
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {items.map((it, index) => (
            <div
              key={it.name}
              className={`group relative rounded-3xl border bg-gradient-to-br ${it.accent} backdrop-blur-sm p-7 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 animate-slide-up flex flex-col`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Decorative quote mark */}
              <Quote className="h-6 w-6 text-primary/25 mb-4 -scale-x-100" />

              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6 italic">
                "{it.text}"
              </p>

              {/* Star rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: it.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={it.avatar}
                    alt={it.name}
                    className="h-11 w-11 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-success rounded-full border-2 border-background" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
