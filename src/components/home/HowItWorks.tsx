import { ClipboardList, Sparkles, CheckCircle, FileText } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Enter Your Details",
    description: "Share your budget, city, interests, and experience level.",
    accent: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    numAccent: "from-amber-500 to-orange-500",
  },
  {
    icon: Sparkles,
    step: "02",
    title: "AI Analyzes & Recommends",
    description:
      "Our AI generates 3 tailored business ideas with complete analysis.",
    accent: "bg-primary/15 text-primary border-primary/30",
    numAccent: "from-primary to-violet-500",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Select Your Business",
    description: "Choose the business idea that resonates with you the most.",
    accent: "bg-green-500/15 text-green-500 border-green-500/30",
    numAccent: "from-green-500 to-emerald-500",
  },
  {
    icon: FileText,
    step: "04",
    title: "Get Complete Plan",
    description:
      "Receive a detailed business plan covering all aspects of your startup.",
    accent: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
    numAccent: "from-cyan-500 to-blue-500",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-muted/40 via-transparent to-muted/40" />

      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center mb-20 animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">
            Simple Process
          </div>
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From zero to a complete business plan in 4 simple steps.
          </p>
        </div>

        <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Connector line (desktop) */}
          <div className="absolute top-[2.8rem] left-[12.5%] hidden w-[75%] h-px bg-gradient-to-r from-amber-500/30 via-primary/40 to-cyan-500/30 lg:block" />

          {steps.map((step, index) => (
            <div
              key={step.step}
              className="group relative bg-background/70 backdrop-blur-sm border border-border/60 rounded-2xl p-7 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 animate-slide-up z-10"
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              {/* Step icon */}
              <div className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border ${step.accent} group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="h-7 w-7" />
                <span className={`absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${step.numAccent} text-xs font-black text-white shadow-md`}>
                  {step.step}
                </span>
              </div>

              <h3 className="mb-2 font-bold text-base group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
