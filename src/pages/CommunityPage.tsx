import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { MentorBooking } from "@/components/community/MentorBooking";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Users2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CommunityPage = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate("/auth");
        }
    }, [user, isLoading, navigate]);

    if (isLoading) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col pt-16">
            <Header />

            <main className="flex-1 py-12 px-6">
                <div className="container max-w-6xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-up">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-sm backdrop-blur-sm">
                                <Users2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 gradient-text">Founder Community</h1>
                                <p className="text-muted-foreground text-lg">Connect with local founders, share milestones, and book expert mentors.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <Tabs defaultValue="feed">
                            <div className="overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar mb-8">
                                <TabsList className="inline-flex w-auto md:w-[400px] grid-cols-2 gap-2 bg-muted/40 backdrop-blur-xl border border-border/50 p-2 rounded-2xl shadow-sm">
                                    <TabsTrigger value="feed" className="whitespace-nowrap px-4 py-2 text-sm">Community Feed</TabsTrigger>
                                    <TabsTrigger value="mentors" className="whitespace-nowrap px-4 py-2 text-sm">Mentor Connect</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="feed">
                                <div className="grid md:grid-cols-12 gap-8">
                                    <div className="md:col-span-8">
                                        <CommunityFeed />
                                    </div>
                                    <div className="md:col-span-4 hidden md:block">
                                        {/* Sidebar for Feed */}
                                        <div className="sticky top-24 space-y-6">
                                            <div className="p-6 bg-accent/10 backdrop-blur-xl rounded-2xl border border-accent/20 shadow-sm hover:border-accent/40 transition-colors">
                                                <h3 className="font-bold flex items-center gap-2 mb-2"><Users2 className="w-4 h-4 text-accent" /> Network Status</h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed">Your local founder network is growing! 14 new startups joined this week.</p>
                                            </div>
                                            <div className="p-6 bg-background/40 backdrop-blur-md rounded-2xl border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                                                <h3 className="font-bold mb-4">Trending Topics</h3>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between items-center text-primary cursor-pointer hover:underline">
                                                        <span>#MSME_Grants_2024</span>
                                                        <span className="text-xs text-muted-foreground bg-muted px-2 rounded-full">42 posts</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-primary cursor-pointer hover:underline">
                                                        <span>#D2C_Marketing</span>
                                                        <span className="text-xs text-muted-foreground bg-muted px-2 rounded-full">18 posts</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-primary cursor-pointer hover:underline">
                                                        <span>#CoWorking_Spaces</span>
                                                        <span className="text-xs text-muted-foreground bg-muted px-2 rounded-full">12 posts</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="mentors">
                                <MentorBooking />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CommunityPage;
