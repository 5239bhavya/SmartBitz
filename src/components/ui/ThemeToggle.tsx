import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() => {
    try {
      return localStorage.getItem("theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    const apply = (t: string) => {
      const html = document.documentElement;
      if (t === "dark") html.classList.add("dark");
      else if (t === "light") html.classList.remove("dark");
      else {
        // system
        const prefers =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefers) html.classList.add("dark");
        else html.classList.remove("dark");
      }
    };

    apply(theme);

    const mq =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      if (theme === "system") apply("system");
    };
    if (mq && mq.addEventListener) mq.addEventListener("change", listener);
    return () =>
      mq &&
      mq.removeEventListener &&
      mq.removeEventListener("change", listener);
  }, [theme]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  return (
    <button
      aria-label="Toggle color theme"
      onClick={toggle}
      className="inline-flex items-center justify-center h-9 px-3 rounded-md border bg-background/60 hover:bg-background/70 transition-colors"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
