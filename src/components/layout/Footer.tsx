import { Lightbulb, Twitter, Linkedin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-background mt-auto overflow-hidden">
      {/* Subtle top gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent pointer-events-none" />

      <div className="container relative py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group mb-4 w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow group-hover:scale-110 group-hover:rotate-6 transition-transform">
                <Lightbulb className="h-5 w-5" />
              </div>
              <span className="font-black text-lg gradient-text">SmartBiz AI</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              AI-powered business planning and growth for modern entrepreneurs.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-5 text-sm font-bold text-foreground uppercase tracking-wider">Product</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li><Link to="/plan" className="hover:text-primary transition-colors">Business Plans</Link></li>
              <li><Link to="/ai-agent" className="hover:text-primary transition-colors">AI Advisor</Link></li>
              <li><Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link to="/insights" className="hover:text-primary transition-colors">Market Research</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-5 text-sm font-bold text-foreground uppercase tracking-wider">Company</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Social + Copyright */}
          <div>
            <h4 className="mb-5 text-sm font-bold text-foreground uppercase tracking-wider">Follow Us</h4>
            <div className="flex items-center gap-2.5 mb-6">
              {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                <button
                  key={i}
                  className="p-2.5 rounded-xl bg-muted/60 border border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all text-muted-foreground"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} SmartBiz AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
