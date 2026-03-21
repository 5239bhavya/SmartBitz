import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Users, Target, Zap, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 gradient-text animate-slide-up">
              Empowering the Next Generation of Founders
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              StartupDesk is an all-in-one AI platform designed to help entrepreneurs turn ideas into successful businesses. We combine generative AI with strategic business frameworks to democratize access to world-class business planning.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Target className="w-8 h-8 text-primary" />,
                title: "Mission Driven",
                desc: "We measure our success by the success of the startups we help build."
              },
              {
                icon: <Zap className="w-8 h-8 text-yellow-500" />,
                title: "AI-First",
                desc: "Leveraging cutting-edge artificial intelligence to automate complex business strategies."
              },
              {
                icon: <Users className="w-8 h-8 text-teal-500" />,
                title: "Community",
                desc: "Fostering a collaborative ecosystem where founders learn and grow together."
              },
              {
                icon: <Globe className="w-8 h-8 text-blue-500" />,
                title: "Global Reach",
                desc: "Building tools that break down geographical barriers for entrepreneurs worldwide."
              }
            ].map((value, idx) => (
              <Card variant="glass" key={idx} className="border-border/50 shadow-sm hover:border-primary/50 transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex p-3 rounded-xl bg-muted/50 mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-4 md:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="text-lg text-muted-foreground">
              Founded in 2026, StartupDesk was built out of the frustration of seeing brilliant ideas fail due to a lack of strategic planning and execution. We realized that while anyone can have a great idea, creating a viable business plan, generating marketing collateral, and understanding legal compliance require specialized knowledge that is often too expensive for early-stage founders.
            </p>
            <p className="text-lg text-muted-foreground">
              By harnessing the power of the latest Large Language Models, we've built a unified workspace that acts as a Chief Operating Officer for solo founders. Today, StartupDesk helps thousands of businesses go from zero to one.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
