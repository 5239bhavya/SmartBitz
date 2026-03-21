import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Lightbulb,
  User,
  LogOut,
  FolderOpen,
  ShoppingBag,
  Bot,
  LayoutDashboard,
  Trophy,
  UserCircle,
  FileCheck,
  TrendingUp,
  BookOpen,
  Users2,
  Target,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { user, signOut } = useAuth();
  const [hasBusiness, setHasBusiness] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkBusiness = () => {
      const storedBusiness = sessionStorage.getItem("selectedBusiness");
      setHasBusiness(!!storedBusiness);
    };

    checkBusiness();
    window.addEventListener("storage", checkBusiness);
    return () => window.removeEventListener("storage", checkBusiness);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled
        ? "bg-white/95 dark:bg-card/95 backdrop-blur-xl border-b border-border/60 shadow-sm"
        : "bg-transparent border-b border-transparent"
        }`}
    >
      <div
        className={`container flex h-16 items-center justify-between relative ${!scrolled ? "text-shadow-glow" : ""}`}
      >
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-glow">
            <Lightbulb className="h-5 w-5" />
          </div>
          <span className="ml-2 text-xl font-semibold tracking-tight gradient-text">
            SmartBiz AI
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {!isHome && (
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Home
              </Button>
            </Link>
          )}

          {hasBusiness && (
            <Link to="/plan">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          )}

          <Link to="/marketplace">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors">
              <ShoppingBag className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Marketplace</span>
            </Button>
          </Link>

          <Link to="/ai-agent">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bot className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Talk to AI</span>
            </Button>
          </Link>

          <Link to="/scoreboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground transition-colors">
              <Trophy className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>
          </Link>

          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[500px] p-3 shadow-lg border-border/50 rounded-2xl bg-background/95 backdrop-blur-xl hidden sm:block z-50">
                  {/* User Profile Header */}
                  <div className="flex items-center gap-3 p-3 mb-3 rounded-lg bg-muted/40 border border-border/50">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="text-sm font-semibold truncate text-foreground">{user.email}</span>
                      <Link to="/profile" className="text-xs text-muted-foreground hover:text-primary transition-colors hover:underline mt-0.5">
                        Manage Your Profile &rarr;
                      </Link>
                    </div>
                  </div>

                  {/* 2-Column Grid for App Features */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-accent/50 focus:bg-accent/50 transition-all focus:outline-none">
                      <Link to="/saved-plans" className="flex items-start gap-3 w-full">
                        <div className="bg-blue-500/10 p-2.5 rounded-md text-blue-500 shrink-0"><FolderOpen className="h-4 w-4" /></div>
                        <div className="flex flex-col justify-center">
                          <span className="text-sm font-medium leading-none mb-1.5">Saved Plans</span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1">Access your generated business plans</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-accent/50 focus:bg-accent/50 transition-all focus:outline-none">
                      <Link to="/social" className="flex items-start gap-3 w-full">
                        <div className="bg-pink-500/10 p-2.5 rounded-md text-pink-500 shrink-0"><Share2 className="h-4 w-4" /></div>
                        <div className="flex flex-col justify-center">
                          <span className="text-sm font-medium leading-none mb-1.5">Social Media Studio</span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1">Draft, schedule and publish posts</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-accent/50 focus:bg-accent/50 transition-all focus:outline-none">
                      <Link to="/insights" className="flex items-start gap-3 w-full">
                        <div className="bg-purple-500/10 p-2.5 rounded-md text-purple-500 shrink-0"><TrendingUp className="h-4 w-4" /></div>
                        <div className="flex flex-col justify-center">
                          <span className="text-sm font-medium leading-none mb-1.5">Market Insights</span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1">Industry trends and market statistics</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-accent/50 focus:bg-accent/50 transition-all focus:outline-none">
                      <Link to="/competitor" className="flex items-start gap-3 w-full">
                        <div className="bg-red-500/10 p-2.5 rounded-md text-red-500 shrink-0"><Target className="h-4 w-4" /></div>
                        <div className="flex flex-col justify-center">
                          <span className="text-sm font-medium leading-none mb-1.5">Competitor Analysis</span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1">Track rival metrics & strategies</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-accent/50 focus:bg-accent/50 transition-all focus:outline-none">
                      <Link to="/khata" className="flex items-start gap-3 w-full">
                        <div className="bg-green-500/10 p-2.5 rounded-md text-green-500 shrink-0"><BookOpen className="h-4 w-4" /></div>
                        <div className="flex flex-col justify-center">
                          <span className="text-sm font-medium leading-none mb-1.5">Digital Khata & ERP</span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1">Mini ERP & finance management</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-accent/50 focus:bg-accent/50 transition-all focus:outline-none">
                      <Link to="/compliance" className="flex items-start gap-3 w-full">
                        <div className="bg-amber-500/10 p-2.5 rounded-md text-amber-500 shrink-0"><FileCheck className="h-4 w-4" /></div>
                        <div className="flex flex-col justify-center">
                          <span className="text-sm font-medium leading-none mb-1.5">Compliance Center</span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1">Legal tracking & document filing</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-accent/50 focus:bg-accent/50 transition-all focus:outline-none">
                      <Link to="/community" className="flex items-start gap-3 w-full">
                        <div className="bg-teal-500/10 p-2.5 rounded-md text-teal-500 shrink-0"><Users2 className="h-4 w-4" /></div>
                        <div className="flex flex-col justify-center">
                          <span className="text-sm font-medium leading-none mb-1.5">Founder Community</span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1">Network, connect & find mentors</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-accent/50 focus:bg-accent/50 transition-all focus:outline-none">
                      <Link to="/scoreboard" className="flex items-start gap-3 w-full">
                        <div className="bg-yellow-500/10 p-2.5 rounded-md text-yellow-500 shrink-0"><Trophy className="h-4 w-4" /></div>
                        <div className="flex flex-col justify-center">
                          <span className="text-sm font-medium leading-none mb-1.5">Leaderboard</span>
                          <span className="text-[11px] text-muted-foreground line-clamp-1">Startup rankings & gamification</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator className="bg-border opacity-50 my-1" />
                  
                  <div className="px-1 pt-1">
                    <DropdownMenuItem
                      onClick={signOut}
                      className="cursor-pointer p-3 text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg transition-all focus:outline-none font-medium justify-center flex gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Secure Sign Out
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="ghost" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          <ThemeToggle />
          <Link to="/start">
            <Button
              variant={isHome ? "hero" : "default"}
              size="sm"
              className="shadow-glow hover:shadow-glow-lg"
            >
              Get Started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
