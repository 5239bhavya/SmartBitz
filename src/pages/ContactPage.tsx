import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Header />
      <main className="flex-1 bg-muted/20 pb-20">
        
        {/* Header */}
        <section className="py-16 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 gradient-text animate-slide-up">Get in Touch</h1>
          <p className="text-xl text-muted-foreground">
            Whether you have a question about features, pricing, or need technical support, our team is ready to answer all your questions.
          </p>
        </section>

        {/* Content */}
        <div className="container max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info (Left Column) */}
          <div className="space-y-6">
            <Card variant="glass" className="border-border/50 shadow-sm hover:border-primary/30 transition-colors">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Chat Support</h3>
                  <p className="text-sm text-muted-foreground mb-3">Our friendly team is here to help.</p>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">support@startupdesk.com</a>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-border/50 shadow-sm hover:border-primary/30 transition-colors">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Partnerships</h3>
                  <p className="text-sm text-muted-foreground mb-3">Interested in partnering with us?</p>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">partners@startupdesk.com</a>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-border/50 shadow-sm hover:border-primary/30 transition-colors">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Headquarters</h3>
                  <p className="text-sm text-muted-foreground">
                    123 Innovation Drive<br />
                    Suite 500<br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form (Main Column) */}
          <Card variant="glass" className="lg:col-span-2 shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you within 24 hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="john@company.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us a little bit about your project or issue..." 
                    className="min-h-[150px] resize-none" 
                  />
                </div>
                
                <Button className="w-full sm:w-auto" size="lg">
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
