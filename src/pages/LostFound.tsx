import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArchiveRestore, Search, MapPin, Sparkles, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import PageHeader from "@/components/PageHeader";

interface LostFoundPost {
  id: string; user_id: string; type: string; title: string; location: string;
  approximate_time: string | null; description: string; is_resolved: boolean; created_at: string;
}

const LostFoundPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<"lost" | "found" | "">("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [when, setWhen] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "lost" | "found" | "mine">("all");
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth"); else setUser(session.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth"); else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => { if (user) loadPosts(); }, [user]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase.from("lost_found_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({ title: "Error loading posts", description: error.message || "Could not load posts. Refresh the page.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !type || !title.trim() || !location.trim() || !description.trim()) {
      toast({ variant: "destructive", title: "Missing information", description: "Please fill in all required fields including the type (lost/found)." }); return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from("lost_found_posts").insert({
        user_id: user.id, type, title: title.trim(), location: location.trim(),
        approximate_time: when.trim() || null, description: description.trim(),
      }).select().single();
      if (error) throw error;
      setPosts((prev) => [data, ...prev]);
      toast({ title: "Post added! ✅", description: "Your post is now visible on the board." });
      setTitle(""); setLocation(""); setWhen(""); setDescription(""); setType("");
    } catch (error: any) { toast({ title: "Error", description: error.message || "Could not save post. Try again.", variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  const handleRemovePost = async (postId: string) => {
    try {
      const { error } = await supabase.from("lost_found_posts").delete().eq("id", postId);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({ title: "Post removed" });
    } catch (error: any) { toast({ title: "Error", description: error.message || "Could not remove post.", variant: "destructive" }); }
  };

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "lost") return post.type === "lost";
    if (activeTab === "found") return post.type === "found";
    if (activeTab === "mine") return post.user_id === user?.id;
    return true;
  }).filter((post) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return post.title.toLowerCase().includes(q) || post.description.toLowerCase().includes(q) || post.location.toLowerCase().includes(q);
  });

  const tabStats = {
    all: posts.length, lost: posts.filter((p) => p.type === "lost").length,
    found: posts.filter((p) => p.type === "found").length, mine: posts.filter((p) => p.user_id === user?.id).length,
  };

  const TabButton = ({ id, label }: { id: "all" | "lost" | "found" | "mine"; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.7rem] font-medium transition-all ${
        activeTab === id
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-primary/8 text-muted-foreground hover:bg-primary/15 hover:text-foreground border border-primary/15"
      }`}
    >
      {label}
      <span className="text-[0.6rem] opacity-70 bg-background/20 rounded-full px-1.5">{tabStats[id]}</span>
    </button>
  );

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center gap-2">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading posts...</p>
    </div>
  );

  return (
    <main className="mx-auto max-w-6xl px-3 pb-16 pt-5 sm:px-4 sm:pt-6 md:px-6 md:pt-8">
      <PageHeader icon="📍" title="Lost & Found" subtitle="A central board to reconnect people with their lost items across campus.">
        <div className="relative flex items-center rounded-full bg-muted/60 border border-primary/12 p-0.5 text-xs">
          <div
            className="absolute top-0.5 bottom-0.5 rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: 'calc(50% - 2px)',
              left: type === "lost" ? '2px' : 'calc(50%)',
              background: type === "lost"
                ? 'linear-gradient(to right, hsl(var(--destructive) / 0.9), hsl(var(--destructive) / 0.7))'
                : 'linear-gradient(to right, hsl(var(--primary) / 0.8), hsl(var(--primary) / 0.6))',
            }}
          />
          <button
            onClick={() => setType("lost")}
            className={`relative z-10 h-8 rounded-full px-3 sm:px-4 font-medium transition-colors duration-200 text-[0.7rem] sm:text-xs ${
              type === "lost" ? "text-destructive-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🔴 Lost
          </button>
          <button
            onClick={() => setType("found")}
            className={`relative z-10 h-8 rounded-full px-3 sm:px-4 font-medium transition-colors duration-200 text-[0.7rem] sm:text-xs ${
              type === "found" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🟢 Found
          </button>
        </div>
      </PageHeader>

      {/* Tabs */}
      <section className="mb-4 flex flex-col gap-2.5 rounded-2xl border border-primary/12 bg-card/60 backdrop-blur-sm p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <TabButton id="all" label="All" />
          <TabButton id="lost" label="🔴 Lost" />
          <TabButton id="found" label="🟢 Found" />
          <TabButton id="mine" label="My posts" />
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/15 px-3 py-2 text-[0.7rem] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span>AI auto-matches similar lost &amp; found posts</span>
        </div>
      </section>

      {/* Search */}
      <section className="mb-5 flex rounded-2xl border border-primary/12 bg-card/60 backdrop-blur-sm p-3 md:p-4">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-primary/15 bg-background/60 px-3 py-2 text-foreground text-xs">
          <Search className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by item, color, or location..." className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/60" />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Posts */}
        <div className="space-y-3 order-2 lg:order-1">
          {filteredPosts.length === 0 ? (
            <Card className="border-primary/12 bg-card/70 rounded-2xl">
              <CardContent className="py-10 text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-3">
                  <ArchiveRestore className="h-6 w-6 text-primary/50" />
                </div>
                <p className="text-sm font-medium text-foreground">No posts found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {search ? "Try a different search term." : "Be the first to report a lost or found item!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => {
              const isOwner = post.user_id === user?.id;
              const isLost = post.type === "lost";

              return (
                <Card key={post.id} className="group relative border-0 bg-card/80 backdrop-blur-xl shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl p-[1px] pointer-events-none">
                    <div className={`h-full w-full rounded-2xl sm:rounded-3xl ${
                      isLost 
                        ? "bg-gradient-to-br from-destructive/25 via-transparent to-destructive/10" 
                        : "bg-gradient-to-br from-primary/25 via-transparent to-primary/10"
                    }`} />
                  </div>
                  <div className={`h-1 ${isLost ? "bg-gradient-to-r from-destructive via-destructive/60 to-transparent" : "bg-gradient-to-r from-primary via-primary/60 to-transparent"}`} />
                  
                  <CardHeader className="relative pb-2 px-4 sm:px-5 pt-4 sm:pt-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm ${
                        isLost 
                          ? "bg-gradient-to-br from-destructive/20 to-destructive/5 border border-destructive/20" 
                          : "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
                      }`}>
                        <span className="text-sm sm:text-base">{isLost ? "😟" : "😊"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge className={`text-[0.55rem] sm:text-[0.6rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md mb-0.5 ${
                          isLost ? "bg-destructive/10 border-destructive/25 text-destructive" : "bg-primary/10 border-primary/25 text-primary"
                        }`}>
                          {isLost ? "LOST" : "FOUND"}
                        </Badge>
                        <CardTitle className="text-sm sm:text-[0.95rem] font-bold text-foreground truncate leading-tight">{post.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-3 text-xs px-4 sm:px-5 pb-4 sm:pb-5">
                    <p className="text-muted-foreground text-[0.75rem] sm:text-[0.8rem] leading-relaxed line-clamp-3">{post.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-accent/15 border border-accent-foreground/10 px-2.5 py-1 sm:py-1.5 text-[0.65rem] sm:text-[0.7rem] font-medium text-accent-foreground shadow-sm">
                        <MapPin className="h-3 w-3" /> {post.location}
                      </span>
                      {post.approximate_time && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-primary/8 border border-primary/12 px-2.5 py-1 sm:py-1.5 text-[0.65rem] sm:text-[0.7rem] font-medium text-primary shadow-sm">
                          <Clock className="h-3 w-3" /> {post.approximate_time}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        size="sm"
                        className={`h-8 rounded-xl text-[0.65rem] sm:text-[0.7rem] px-3 sm:px-4 font-semibold shadow-sm transition-all duration-200 hover:shadow-md ${
                          isLost 
                            ? "bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground" 
                            : "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                        }`}
                        onClick={() => toast({ title: isLost ? "Notify matches" : "Contact owner", description: isLost ? "AI will suggest matching 'found' posts." : "Opens a safe contact channel." })}
                      >
                        {isLost ? "🔔 Notify if found" : "🙋 This is mine"}
                      </Button>
                      {isOwner && (
                        <Button size="sm" variant="ghost" className="h-8 rounded-xl text-[0.65rem] sm:text-[0.7rem] px-3 text-destructive/70 hover:text-destructive hover:bg-destructive/8" onClick={() => handleRemovePost(post.id)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Form */}
        <Card className="border-primary/12 bg-card/70 backdrop-blur-sm shadow-sm rounded-2xl h-fit overflow-hidden order-1 lg:order-2">
          <div className="h-1 bg-gradient-to-r from-primary/50 to-accent-foreground/30" />
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              ✍️ Report an item
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <form className="space-y-3 text-xs" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-[0.75rem]">Type *</Label>
                <Select value={type} onValueChange={(v) => setType(v as "lost" | "found")}>
                  <SelectTrigger className="h-9 text-xs rounded-xl border-primary/15">
                    <SelectValue placeholder="Lost or found?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">🔴 I lost something</SelectItem>
                    <SelectItem value="found">🟢 I found something</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[0.75rem]">Short title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Lost: black backpack" className="h-9 text-xs rounded-xl border-primary/15" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[0.75rem]">Where *</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Block B stairway" className="h-9 text-xs rounded-xl border-primary/15" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[0.75rem]">Approximate time</Label>
                <Input value={when} onChange={(e) => setWhen(e.target.value)} placeholder="e.g. Today 3:30 PM" className="h-9 text-xs rounded-xl border-primary/15" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[0.75rem]">Description *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the item, color, any identifiers..." rows={3} className="resize-none text-xs rounded-xl border-primary/15" />
              </div>
              <Button type="submit" className="mt-2 h-9 w-full rounded-xl text-xs bg-gradient-to-r from-primary to-primary/80 shadow-sm" disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving...</> : "Save to board"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default LostFoundPage;
