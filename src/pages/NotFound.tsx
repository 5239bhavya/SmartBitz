import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/50 to-primary/5 p-4">
      <div className="text-center p-12 bg-background/60 backdrop-blur-xl border border-border/50 rounded-[2.5rem] shadow-2xl relative overflow-hidden max-w-md w-full animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10">
          <h1 className="mb-4 text-7xl md:text-8xl font-black gradient-text tracking-tighter drop-shadow-sm">404</h1>
          <p className="mb-8 text-xl text-muted-foreground font-medium">
            Oops! This page doesn't exist
          </p>
          <a href="/" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-transform hover:bg-primary/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
