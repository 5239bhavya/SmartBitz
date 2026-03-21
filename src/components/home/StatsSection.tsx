import React, { useEffect, useRef } from "react";

const counters = [
  { label: "Users helped", value: 12000, suffix: "+" },
  { label: "Plans generated", value: 4800, suffix: "+" },
  { label: "Setup in minutes", value: 5, suffix: " mins" },
];

function animateCount(el: HTMLElement, to: number, suffix = "") {
  let start = 0;
  const duration = 1500;
  const startTime = performance.now();
  function tick(now: number) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = Math.floor(eased * to + (1 - eased) * start);
    el.textContent = current.toLocaleString() + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const accents = [
  "from-amber-500/15 to-amber-500/5 border-amber-500/20",
  "from-primary/15 to-primary/5 border-primary/20",
  "from-cyan-500/15 to-cyan-500/5 border-cyan-500/20",
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            const nodes = el.querySelectorAll<HTMLElement>("[data-target]");
            nodes.forEach((n) => {
              const to = Number(n.dataset.target || "0");
              const suffix = n.dataset.suffix || "";
              animateCount(n, to, suffix);
            });
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/4 to-transparent" />

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center mb-12 animate-slide-up">
          <h3 className="text-3xl font-black tracking-tight sm:text-4xl mb-3">
            Trusted by <span className="gradient-text">Founders Worldwide</span>
          </h3>
          <p className="text-muted-foreground text-lg">
            We help entrepreneurs build viable, investor-ready plans quickly.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 gap-5 sm:grid-cols-3 max-w-3xl mx-auto">
          {counters.map((c, index) => (
            <div
              key={c.label}
              className={`rounded-3xl border bg-gradient-to-br ${accents[index]} backdrop-blur-sm p-8 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-scale-bounce`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div
                className="text-5xl font-black gradient-text mb-1 tracking-tight"
                data-target={c.value}
                data-suffix={c.suffix || ""}
              >
                0
              </div>
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-widest mt-1">
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
