import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Plus, Share2, Facebook, Twitter, Instagram, Linkedin, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Mock data
const MOCK_CONNECTED_ACCOUNTS = [
  { id: "fb", name: "Facebook", icon: <Facebook className="w-5 h-5 text-blue-600" />, connected: true, handle: "@startupdesk" },
  { id: "tw", name: "Twitter", icon: <Twitter className="w-5 h-5 text-sky-500" />, connected: true, handle: "@startupdesk_ai" },
  { id: "in", name: "LinkedIn", icon: <Linkedin className="w-5 h-5 text-blue-700" />, connected: false, handle: "" },
  { id: "ig", name: "Instagram", icon: <Instagram className="w-5 h-5 text-pink-600" />, connected: true, handle: "@startupdesk.official" }
];

const MOCK_SCHEDULED_POSTS = [
  { id: 1, content: "Launch day is finally here! 🚀 Check out our new AI features...", platforms: ["fb", "tw"], date: "2026-03-20", time: "10:00 AM", status: "scheduled" },
  { id: 2, content: "5 Tips for founders: 1. Stay lean. 2. Talk to users...", platforms: ["tw", "in"], date: "2026-03-21", time: "02:30 PM", status: "draft" },
  { id: 3, content: "We just hit 10k users! Thank you to our amazing community 🎉", platforms: ["fb", "ig", "tw"], date: "2026-03-15", time: "09:00 AM", status: "published" }
];

export default function SocialMediaDashboard() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [scheduledPosts, setScheduledPosts] = useState(MOCK_SCHEDULED_POSTS);
  const [accounts, setAccounts] = useState(MOCK_CONNECTED_ACCOUNTS);
  
  // New Post State
  const [isComposing, setIsComposing] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postDate, setPostDate] = useState("");
  const [postTime, setPostTime] = useState("");

  const toggleAccount = (id: string) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === id) {
        const newStatus = !acc.connected;
        toast.success(`${acc.name} ${newStatus ? 'connected' : 'disconnected'} successfully!`);
        return { ...acc, connected: newStatus, handle: newStatus ? "@your_handle" : "" };
      }
      return acc;
    }));
  };

  const togglePlatformSelection = (id: string) => {
    if (selectedPlatforms.includes(id)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
    } else {
      setSelectedPlatforms([...selectedPlatforms, id]);
    }
  };

  const handleSchedulePost = () => {
    if (!newPostContent) return toast.error("Post content cannot be empty.");
    if (selectedPlatforms.length === 0) return toast.error("Select at least one platform.");
    if (!postDate || !postTime) return toast.error("Select a valid date and time.");

    const newPost = {
      id: Date.now(),
      content: newPostContent,
      platforms: selectedPlatforms,
      date: postDate,
      time: postTime,
      status: "scheduled"
    };

    setScheduledPosts([newPost, ...scheduledPosts]);
    toast.success("Post scheduled successfully!");
    
    // Reset
    setNewPostContent("");
    setSelectedPlatforms([]);
    setPostDate("");
    setPostTime("");
    setIsComposing(false);
    setActiveTab("calendar");
  };

  const getPlatformIcon = (id: string) => accounts.find(a => a.id === id)?.icon;

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Header />
      <main className="flex-1 bg-muted/20 py-8 px-4">
        <div className="container max-w-6xl mx-auto space-y-8">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Share2 className="w-8 h-8 text-primary" />
                Social Media Studio
              </h1>
              <p className="text-muted-foreground mt-1">Manage, schedule, and publish your content across all platforms.</p>
            </div>
            <Button size="lg" onClick={() => setIsComposing(!isComposing)} className="shadow-lg">
              {isComposing ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Compose Post</>}
            </Button>
          </div>

          {/* Composer Panel (Collapsible) */}
          {isComposing && (
            <Card variant="glass" className="border-border/50 shadow-sm animate-in slide-in-from-top-4">
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
                <CardDescription>Draft your message and schedule it for publication.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Platform Selector */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Platforms</label>
                  <div className="flex flex-wrap gap-3">
                    {accounts.filter(a => a.connected).map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => togglePlatformSelection(acc.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedPlatforms.includes(acc.id) 
                            ? "border-primary bg-primary/10 text-primary font-semibold" 
                            : "border-muted/50 bg-background hover:border-primary/50"
                        }`}
                      >
                        {acc.icon} {acc.name}
                      </button>
                    ))}
                    {accounts.filter(a => a.connected).length === 0 && (
                      <p className="text-sm text-destructive">No accounts connected. Please connect accounts below first.</p>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="space-y-3">
                   <label className="text-sm font-medium flex justify-between">
                     Post Content
                     <span className="text-muted-foreground font-normal">{newPostContent.length}/280 characters</span>
                   </label>
                   <Textarea 
                      placeholder="What do you want to share with your audience? Try using your generated Ad copies here!"
                      className="min-h-[120px] resize-none text-base"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                   />
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4"/> Publish Date</label>
                    <Input type="date" value={postDate} onChange={(e) => setPostDate(e.target.value)} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4"/> Publish Time</label>
                    <Input type="time" value={postTime} onChange={(e) => setPostTime(e.target.value)} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 flex justify-end gap-3 rounded-b-lg">
                <Button variant="outline" onClick={() => setIsComposing(false)}>Cancel</Button>
                <Button onClick={handleSchedulePost}><Calendar className="w-4 h-4 mr-2" /> Schedule Post</Button>
              </CardFooter>
            </Card>
          )}

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar">
              <TabsList className="inline-flex w-auto md:w-[400px] grid-cols-2 gap-2 bg-muted/40 backdrop-blur-xl border border-border/50 p-2 rounded-2xl shadow-sm">
                <TabsTrigger value="calendar" className="whitespace-nowrap px-4 py-2 text-sm">Content Organizer</TabsTrigger>
                <TabsTrigger value="accounts" className="whitespace-nowrap px-4 py-2 text-sm">Connected Accounts</TabsTrigger>
              </TabsList>
            </div>
            
            {/* Calendar Tab */}
            <TabsContent value="calendar" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Upcoming List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Scheduled & Recent Posts
                  </h3>
                  
                  {scheduledPosts.length === 0 ? (
                    <Card className="border-dashed"><CardContent className="p-8 text-center text-muted-foreground">No posts scheduled yet.</CardContent></Card>
                  ) : (
                    scheduledPosts.map(post => (
                      <Card key={post.id} className="overflow-hidden hover:shadow-md transition-all">
                        <div className={`h-1.5 w-full ${post.status === 'published' ? 'bg-green-500' : post.status === 'scheduled' ? 'bg-primary' : 'bg-amber-400'}`} />
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div className="flex gap-2">
                              {post.platforms.map(p => (
                                <div key={p} className="p-1.5 bg-muted rounded-md">{getPlatformIcon(p)}</div>
                              ))}
                            </div>
                            <Badge variant={post.status === 'published' ? "default" : post.status === 'scheduled' ? "secondary" : "outline"} className={`capitalize ${post.status === 'published' ? 'bg-green-500 hover:bg-green-600 font-bold' : ''}`}>
                              {post.status}
                            </Badge>
                          </div>
                          <p className="text-foreground line-clamp-2 leading-relaxed mb-4">{post.content}</p>
                          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {post.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {post.time}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Quick Stats sidebar */}
                <div className="space-y-6">
                  <Card variant="glass" className="border-border/50 shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-base">Weekly Overview</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/10">
                        <span className="text-sm font-medium text-primary">Scheduled</span>
                        <span className="text-lg font-bold">{scheduledPosts.filter(p => p.status === 'scheduled').length}</span>
                      </div>
                      <div className="flex justify-between items-center bg-green-500/5 p-3 rounded-lg border border-green-500/20">
                        <span className="text-sm font-medium text-green-700 dark:text-green-500">Published</span>
                        <span className="text-lg font-bold">{scheduledPosts.filter(p => p.status === 'published').length}</span>
                      </div>
                      <div className="flex justify-between items-center bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-500">Drafts</span>
                        <span className="text-lg font-bold">{scheduledPosts.filter(p => p.status === 'draft').length}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card variant="glass" className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-sm">
                     <CardContent className="p-5 text-center space-y-2">
                       <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                       <h3 className="font-bold">Need Content?</h3>
                       <p className="text-sm text-muted-foreground">Use the SmartBiz AI agent or the Ad Generator tool to instantly create engaging copy.</p>
                       <Button variant="link" className="text-primary font-semibold" onClick={() => window.location.href = "/profile"}>Go to Ad Generator →</Button>
                     </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Accounts Tab */}
            <TabsContent value="accounts" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {accounts.map(acc => (
                  <Card variant="glass" key={acc.id} className={`overflow-hidden transition-all border-border/50 ${acc.connected ? 'border-primary/50 shadow-md bg-primary/5' : ''}`}>
                    <CardContent className="p-6 text-center flex flex-col items-center gap-4">
                      <div className={`p-4 rounded-full ${acc.connected ? 'bg-background shadow-inner' : 'bg-muted'}`}>
                        <div className="scale-150">{acc.icon}</div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{acc.name}</h3>
                        {acc.connected ? (
                           <p className="text-sm font-medium text-primary mt-1">{acc.handle}</p>
                        ) : (
                           <p className="text-sm text-muted-foreground mt-1">Not connected</p>
                        )}
                      </div>
                      <Button 
                        variant={acc.connected ? "outline" : "default"} 
                        className={`w-full ${acc.connected ? 'text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30' : ''}`}
                        onClick={() => toggleAccount(acc.id)}
                      >
                        {acc.connected ? "Disconnect" : "Connect Account"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
