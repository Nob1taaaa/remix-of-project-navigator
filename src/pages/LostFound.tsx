import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArchiveRestore, Search, MapPin, Sparkles, Activity } from "lucide-react";
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

interface LostFoundPost {
  id: string;
  user_id: string;
  type: string;
  title: string;
  location: string;
  approximate_time: string | null;
  description: string;
  is_resolved: boolean;
  created_at: string;
}

const LostFoundPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<"lost" | "found" | "">("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [when, setWhen] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "lost" | "found" | "mine">("all");
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) loadPosts();
  }, [user]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("lost_found_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({ title: "Error loading posts", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !type || !title.trim() || !location.trim() || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select lost/found and fill in title, location, and description.",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("lost_found_posts")
        .insert({
          user_id: user.id,
          type,
          title: title.trim(),
          location: location.trim(),
          approximate_time: when.trim() || null,
          description: description.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setPosts((prev) => [data, ...prev]);
      toast({ title: "Post added!", description: "Your post is now visible on the board." });
      setTitle("");
      setLocation("");
      setWhen("");
      setDescription("");
      setType("");
    } catch (error: any) {
      toast({ title: "Error adding post", description: error.message, variant: "destructive" });
    }
  };

  const handleRemovePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("lost_found_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast({ title: "Post removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
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
    all: posts.length,
    lost: posts.filter((p) => p.type === "lost").length,
    found: posts.filter((p) => p.type === "found").length,
    mine: posts.filter((p) => p.user_id === user?.id).length,
  };

  const TabButton = ({ id, label }: { id: "all" | "lost" | "found" | "mine"; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.7rem] transition-colors ${
        activeTab === id
          ? "bg-primary text-primary-foreground"
          : "bg-primary/10 text-foreground hover:bg-primary/20 border border-primary/20"
      }`}
    >
      {label}
      <span className="text-[0.65rem] opacity-80">· {tabStats[id]}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-3 pb-16 pt-5 sm:px-4 sm:pt-6 md:px-6 md:pt-8">
      <header className="mb-3 flex flex-col gap-2.5 sm:mb-4 sm:gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">Lost &amp; Found</h1>
          <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
            A central board to reconnect people with their lost items across campus.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Button size="sm" className="h-7 sm:h-8 rounded-full text-xs px-3" onClick={() => setType("lost")}>
            I lost something
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 sm:h-8 rounded-full border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10 text-xs px-3"
            onClick={() => setType("found")}
          >
            I found something
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <section className="mb-3 sm:mb-4 flex flex-col gap-2.5 rounded-xl sm:rounded-2xl border border-primary/20 bg-card/90 p-2.5 sm:p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <TabButton id="all" label="All" />
          <TabButton id="lost" label="Lost" />
          <TabButton id="found" label="Found" />
          <TabButton id="mine" label="My posts" />
        </div>
        <div className="flex items-center gap-2 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[0.7rem] text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span>AI can auto-match similar lost &amp; found posts.</span>
        </div>
      </section>

      {/* Search */}
      <section className="mb-4 sm:mb-6 flex rounded-xl sm:rounded-2xl border border-primary/20 bg-card/90 p-2.5 sm:p-3 md:p-4">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-foreground text-xs">
          <Search className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item, color, or location..."
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/80"
          />
        </div>
      </section>

      <section className="grid gap-4 sm:gap-5 md:gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Posts list */}
        <div className="space-y-3 sm:space-y-4">
          {filteredPosts.length === 0 ? (
            <Card className="border-primary/20 bg-card/90 rounded-xl sm:rounded-2xl">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                <ArchiveRestore className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                No posts yet. Be the first to report a lost or found item!
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => {
              const isOwner = post.user_id === user?.id;
              const isLost = post.type === "lost";

              return (
                <Card key={post.id} className="hover-scale border-primary/20 bg-card/90 shadow-sm rounded-xl sm:rounded-2xl overflow-hidden">
                  {/* Type color strip */}
                  <div className={`h-1.5 ${isLost ? "bg-gradient-to-r from-destructive/80 to-destructive/40" : "bg-gradient-to-r from-primary/80 to-primary/40"}`} />
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[0.7rem] font-bold px-2.5 py-0.5 ${
                        isLost ? "bg-destructive/15 border-destructive/40 text-destructive" : "bg-primary/15 border-primary/40 text-primary"
                      }`}>
                        {isLost ? "🔴 LOST" : "🟢 FOUND"}
                      </Badge>
                      <CardTitle className="text-sm sm:text-base font-bold text-foreground">{post.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-xs px-3 sm:px-4 pb-3 sm:pb-4">
                    <div className="flex gap-2.5 sm:gap-3">
                      <div className={`h-12 w-12 flex-shrink-0 rounded-lg border-2 flex items-center justify-center ${
                        isLost ? "border-destructive/30 bg-gradient-to-br from-destructive/15 to-destructive/5" : "border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5"
                      }`}>
                        <ArchiveRestore className="h-5 w-5 text-primary/60" />
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">{post.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/30 border border-accent-foreground/20 px-2.5 py-1 text-[0.72rem] font-medium text-accent-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {post.location}
                      </span>
                      {post.approximate_time && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-1 text-[0.7rem] font-medium text-primary">
                          🕐 {post.approximate_time}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={isLost ? "default" : "outline"}
                        className="h-7 rounded-full text-[0.7rem]"
                        onClick={() =>
                          toast({
                            title: isLost ? "Notify matches" : "Contact owner",
                            description: isLost
                              ? "AI can suggest matching 'found' posts using semantic search."
                              : "This will open a safe contact channel.",
                          })
                        }
                      >
                        {isLost ? "Notify me if found" : "I think this is mine"}
                      </Button>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-full text-[0.7rem] border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10"
                          onClick={() => handleRemovePost(post.id)}
                        >
                          Remove post
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
        <Card className="border-primary/20 bg-card/90 shadow-sm rounded-xl sm:rounded-2xl h-fit">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-semibold">Report a lost or found item</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
            <form className="space-y-2.5 text-xs" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-[0.75rem]">Type *</Label>
                <Select value={type} onValueChange={(v) => setType(v as "lost" | "found")}>
                  <SelectTrigger className="h-8 text-xs rounded-lg">
                    <SelectValue placeholder="Lost or found?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">I lost something</SelectItem>
                    <SelectItem value="found">I found something</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[0.75rem]">Short title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lost: black backpack in library"
                  className="h-8 text-xs rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[0.75rem]">Where *</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Block B stairway"
                  className="h-8 text-xs rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[0.75rem]">Approximate time</Label>
                <Input
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  placeholder="e.g. Today 3:30 PM"
                  className="h-8 text-xs rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[0.75rem]">Description *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the item, color, any identifiers..."
                  rows={3}
                  className="resize-none text-xs rounded-lg"
                />
              </div>
              <Button type="submit" className="mt-1 h-9 w-full rounded-full text-xs">
                Save to board
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default LostFoundPage;
