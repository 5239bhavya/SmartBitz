import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Briefcase, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CareersPage() {
  const openRoles = [
    { title: "Senior AI Engineer", dept: "Engineering", location: "Remote", type: "Full-Time" },
    { title: "Product Designer UI/UX", dept: "Design", location: "Remote", type: "Full-Time" },
    { title: "Growth Marketing Manager", dept: "Marketing", location: "New York, NY", type: "Hybrid" },
    { title: "Customer Success Lead", dept: "Operations", location: "Remote", type: "Full-Time" },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Header />
      <main className="flex-1 bg-muted/20">
        
        {/* Hero */}
        <section className="py-20 px-4 md:px-8 text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-4">Hiring Now 🚀</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 gradient-text animate-slide-up">Build the Future of Entrepreneurship</h1>
          <p className="text-lg text-muted-foreground mb-10">
            Join the team at StartupDesk and help us build the AI platform that empowers millions of people to start and grow successful businesses.
          </p>
          <Button size="lg" className="rounded-full px-8">
            View Open Roles <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </section>

        {/* Perks */}
        <section className="py-16 px-4 border-y border-border/40 bg-background">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-bold text-lg mb-2">Work from Anywhere</h3>
              <p className="text-muted-foreground">We are a remote-first team spread across 12 countries. Work where you work best.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Continuous Growth</h3>
              <p className="text-muted-foreground">Annual learning stipends and direct access to top-tier mentorship and startup courses.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Meaningful Equity</h3>
              <p className="text-muted-foreground">When startup founders win, we win. Enjoy competitive salaries and meaningful equity packages.</p>
            </div>
          </div>
        </section>

        {/* Positions */}
        <section className="py-20 px-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Briefcase className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Open Roles</h2>
          </div>
          
          <div className="space-y-4">
            {openRoles.map((role, idx) => (
              <Card variant="glass" key={idx} className="group border-border/50 hover:border-primary/50 shadow-sm transition-all mx-auto cursor-pointer">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {role.title}
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{role.dept}</Badge>
                      <Badge variant="outline">{role.location}</Badge>
                      <Badge variant="outline">{role.type}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" className="shrink-0 md:group-hover:bg-primary/10">
                    Apply <ArrowUpRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            <Card variant="glass" className="border-dashed border-2 hover:border-primary/50 transition-colors bg-muted/10 shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="font-medium mb-1">Don't see a perfect fit?</p>
                <p className="text-muted-foreground text-sm mb-4">We're always looking for exceptional talent. Tell us how you can help.</p>
                <Button variant="outline">Email your Resume</Button>
              </CardContent>
            </Card>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
