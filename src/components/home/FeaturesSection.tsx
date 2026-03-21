import {
  Lightbulb,
  Package,
  Users,
  MapPin,
  Calculator,
  Megaphone,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Business Idea Selection",
    description:
      "Get 3 tailored business ideas based on your budget, location, and interests with detailed feasibility analysis.",
    color: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/20",
  },
  {
    icon: Package,
    title: "Raw Material Sourcing",
    description:
      "Learn where to buy materials, understand cost structures, and discover reliable suppliers.",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
    borderColor: "border-blue-500/20",
  },
  {
    icon: Users,
    title: "Workforce Planning",
    description:
      "Know exactly who to hire, required skills, salary ranges, and how many team members you need.",
    color: "from-green-500/20 to-green-500/5",
    iconColor: "text-green-500",
    borderColor: "border-green-500/20",
  },
  {
    icon: MapPin,
    title: "Location Strategy",
    description:
      "Find the perfect location type, ideal shop size, rent estimates, and setup requirements.",
    color: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
    borderColor: "border-rose-500/20",
  },
  {
    icon: Calculator,
    title: "Pricing Guidance",
    description:
      "Calculate costs, set competitive prices, and understand your profit margins clearly.",
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-500",
    borderColor: "border-purple-500/20",
  },
  {
    icon: Megaphone,
    title: "Marketing Plan",
    description:
      "Get a 30-day launch plan with online and offline strategies that fit your budget.",
    color: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-500",
    borderColor: "border-pink-500/20",
  },
  {
    icon: TrendingUp,
    title: "Growth Roadmap",
    description:
      "Month-by-month action plan, expansion strategies, and common mistakes to avoid.",
    color: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-500",
    borderColor: "border-cyan-500/20",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

      <div className="container relative">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
            What's Included
          </div>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl mb-4">
            Everything You Need{" "}
            <span className="gradient-text">to Launch</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Comprehensive AI-powered guidance for every aspect of your business journey.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative rounded-2xl border ${feature.borderColor} bg-gradient-to-br ${feature.color} backdrop-blur-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up cursor-default`}
              style={{ animationDelay: `${index * 0.07}s` }}
            >
              <div className={`mb-4 inline-flex items-center justify-center h-11 w-11 rounded-xl bg-background/70 border ${feature.borderColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>
              <h3 className="mb-2 font-bold text-base leading-snug">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}

          {/* "And much more" filler card */}
          <div className="group relative rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-all duration-300 animate-slide-up cursor-default min-h-[180px]"
            style={{ animationDelay: `${features.length * 0.07}s` }}>
            <span className="text-3xl mb-2">✨</span>
            <p className="text-sm font-semibold text-muted-foreground">And much more coming soon</p>
          </div>
        </div>
      </div>
    </section>
  );
}
