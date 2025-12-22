import { useState, FormEvent } from "react";
import { ArchiveRestore, Search, MapPin, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type LostFoundType = "lost" | "found";

interface LostFoundPost {
  id: string;
  type: LostFoundType;
  title: string;
  location: string;
  when?: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  label: string;
  meta: string;
  badgeColor: "primary" | "destructive" | "accent";
  createdAt: string;
}

const LostFoundPage = () => {
  const { toast } = useToast();
  const currentUserId = "demo-user-1";

  const [type, setType] = useState<"lost" | "found" | "">("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [when, setWhen] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "lost" | "found" | "mine">("all");

  const [posts, setPosts] = useState<LostFoundPost[]>([
    {
      id: "p1",
      type: "found",
      title: "Found: ID card near Block B",
      location: "Block B stairway",
      when: "Today 3:30 PM",
      description:
        "Engineering college ID card with blue lanyard, found on the stairs outside Block B around 3:30 PM.",
      createdBy: "user-2",
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      id: "p2",
      type: "lost",
      title: "Lost: Black backpack in library",
      location: "Central library",
      when: "Yesterday evening",
      description:
        "Contains laptop charger and a DBMS notebook. Last seen on the first floor reading area yesterday evening.",
      createdBy: currentUserId,
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: "p3",
      type: "found",
      title: "Found: Wireless earbuds near cafeteria",
      location: "Main cafeteria",
      when: "This morning",
      description:
        "White earbuds in a small case, found on the table near the main cafeteria entrance this morning.",
      createdBy: "user-3",
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "a1",
      label: "ID card marked as \"potential match\"",
      meta: "2 min ago · Block B stairway",
      badgeColor: "primary",
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      id: "a2",
      label: "New lost post: Black backpack",
      meta: "25 min ago · Central library",
      badgeColor: "destructive",
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
      id: "a3",
      label: "Found earbuds marked as resolved",
      meta: "1 hour ago · Main cafeteria",
      badgeColor: "accent",
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
  ]);

  const handleQuickSelect = (value: "lost" | "found") => {
    setType(value);
    toast({
      title: value === "lost" ? "Report a lost item" : "Report a found item",
      description: "Fill the form on the right so the system can post it to the board.",
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!type || !title.trim() || !location.trim() || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select lost/found and fill in title, location, and description.",
      });
      return;
    }

    const newPost: LostFoundPost = {
      id: `p-${Date.now()}`,
      type: type as LostFoundType,
      title: title.trim(),
      location: location.trim(),
      when: when.trim() || undefined,
      description: description.trim(),
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]);

    const activity: ActivityItem = {
      id: `a-${Date.now()}`,
      label: `${type === "lost" ? "New lost" : "New found"} post: ${newPost.title}`,
      meta: `Just now · ${newPost.location}`,
      badgeColor: type === "lost" ? "destructive" : "primary",
      createdAt: new Date().toISOString(),
    };

    setActivities((prev) => [activity, ...prev]);

    toast({
      title: "Post added to board",
      description: "This will be visible in the list and recent activity timeline.",
    });

    setTitle("");
    setLocation("");
    setWhen("");
    setDescription("");
    setType("");
  };

  const tabStats = {
    all: posts.length,
    lost: posts.filter((p) => p.type === "lost").length,
    found: posts.filter((p) => p.type === "found").length,
    mine: posts.filter((p) => p.createdBy === currentUserId).length,
  } as const;

  const TabButton = ({
    id,
    label,
  }: {
    id: "all" | "lost" | "found" | "mine";
    label: string;
  }) => (
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
      <span className="text-[0.65rem] opacity-80">· {tabStats[id]} posts</span>
    </button>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-6">
      <header className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Lost &amp; found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A central board to reconnect people with their lost items across campus.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Button
            size="sm"
            className="h-8 rounded-full"
            type="button"
            onClick={() => handleQuickSelect("lost")}
          >
            I lost something
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-full border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary/50"
            type="button"
            onClick={() => handleQuickSelect("found")}
          >
            I found something
          </Button>
        </div>
      </header>

      {/* Tabs & AI summary */}
      <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <TabButton id="all" label="All" />
          <TabButton id="lost" label="Lost" />
          <TabButton id="found" label="Found" />
          <TabButton id="mine" label="My posts" />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-[0.7rem] text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>
            AI summary (concept): <strong>3</strong> likely matches across lost &amp; found. In the real system this box
            would be generated by the model.
          </span>
        </div>
      </section>

      {/* Search + AI helper strip */}
      <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          <span>Search by item, color, or location (later: AI-powered semantic search).</span>
        </div>
        <Badge
          variant="outline"
          className="w-fit border-accent/60 bg-accent/10 text-[0.7rem] text-accent-foreground"
        >
          AI can auto-match similar lost &amp; found posts
        </Badge>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Dynamic posts list */}
        <div className="space-y-4">
          {posts
            .filter((post) => {
              if (activeTab === "all") return true;
              if (activeTab === "lost") return post.type === "lost";
              if (activeTab === "found") return post.type === "found";
              return post.createdBy === currentUserId;
            })
            .map((post) => {
              const isOwner = post.createdBy === currentUserId;
              const isLost = post.type === "lost";

              const badgeClasses = isLost
                ? "border-destructive/40 bg-destructive/10 text-[0.65rem] text-foreground"
                : "border-primary/40 bg-primary/10 text-[0.65rem] text-foreground";

              const previewBg = isLost
                ? "bg-gradient-to-br from-destructive/15 to-destructive/5"
                : post.location.includes("cafeteria")
                  ? "bg-gradient-to-br from-accent/20 to-accent/5"
                  : "bg-gradient-to-br from-primary/20 to-primary/5";

              return (
                <Card key={post.id} className="hover-scale border-border/70 bg-card/80 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex gap-3">
                      <div className={`h-14 w-14 flex-shrink-0 rounded-xl border-2 border-primary/30 flex items-center justify-center ${previewBg}`}>
                        <ArchiveRestore className="h-6 w-6 text-primary/60" />
                      </div>
                      <p className="text-muted-foreground">{post.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {post.location}
                      </span>
                      <Badge variant="outline" className={badgeClasses}>
                        {isLost ? "Lost" : "Found"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant={isLost ? "default" : "outline"}
                        className="h-8 rounded-full text-[0.7rem]"
                        type="button"
                        onClick={() =>
                          toast({
                            title: isLost ? "Notify matches (demo)" : "Contact owner (demo)",
                            description: isLost
                              ? "Later, AI can suggest matching 'found' posts using semantic search."
                              : "Later this will open a safe contact channel without exposing phone numbers or emails.",
                          })
                        }
                      >
                        {isLost ? "Notify me if someone finds it" : "I think this is mine"}
                      </Button>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full text-[0.7rem] border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10"
                          type="button"
                          onClick={() => {
                            setPosts((prev) => prev.filter((p) => p.id !== post.id));
                            setActivities((prev) => [
                              {
                                id: `a-${Date.now()}`,
                                label: `Post removed: ${post.title}`,
                                meta: `Just now · ${post.location}`,
                                badgeColor: "accent",
                                createdAt: new Date().toISOString(),
                              },
                              ...prev,
                            ]);
                            toast({
                              title: "Post removed",
                              description: "Only the person who added a post can remove it from the board.",
                            });
                          }}
                        >
                          Remove post
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Structured form – demo of future backend */}
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Report a lost or found item</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3 text-xs" onSubmit={handleSubmit}>
              {/* ... keep existing code (lost & found form fields) */}
              <div className="space-y-1.5">
                <Label className="text-[0.75rem]">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as "lost" | "found")}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choose whether you lost or found something" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">I lost something</SelectItem>
                    <SelectItem value="found">I found something</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lf-title" className="text-[0.75rem]">
                  Short title
                </Label>
                <Input
                  id="lf-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lost: black backpack in library"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lf-location" className="text-[0.75rem]">
                  Where
                </Label>
                <Input
                  id="lf-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Block B stairway, main cafeteria, hostel gate"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lf-when" className="text-[0.75rem]">
                  Approximate time (optional)
                </Label>
                <Input
                  id="lf-when"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  placeholder="e.g. Today 3:30 PM, yesterday evening"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lf-description" className="text-[0.75rem]">
                  Description
                </Label>
                <Textarea
                  id="lf-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the item, color, any identifiers, and extra details so AI can match it accurately."
                  rows={4}
                  className="resize-none text-xs"
                />
              </div>

              <Button type="submit" className="mt-1 h-9 w-full rounded-full text-xs">
                Save to board
              </Button>

              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                Right now posts are stored in memory for this demo. In a full backend, these would be rows in a
                <strong className="mx-1">lost_found</strong> table, with the creator ID controlling who can delete them.
              </p>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Timeline view */}
      <section className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4" />
              Recent activity timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="relative pl-4">
              <div className="absolute left-1 top-0 h-full w-px bg-border/80" />
              {activities.length === 0 ? (
                <p className="text-[0.75rem] text-muted-foreground">
                  New posts and removals will appear here so everyone can track what changed recently.
                </p>
              ) : (
                activities
                  .slice(0, 10)
                  .map((item) => (
                    <div key={item.id} className="relative mb-3 flex flex-col gap-0.5 pl-5 last:mb-0">
                      <span
                        className={
                          "absolute left-0 top-1.5 h-2 w-2 rounded-full " +
                          (item.badgeColor === "primary"
                            ? "bg-primary"
                            : item.badgeColor === "destructive"
                              ? "bg-destructive"
                              : "bg-accent")
                        }
                      />
                      <p className="text-[0.78rem] font-medium">{item.label}</p>
                      <p className="text-[0.7rem] text-muted-foreground">{item.meta}</p>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI explainer */}
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              How AI matches items (for viva)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[0.7rem] text-muted-foreground">
            <p>
              You can explain this as a small pipeline layered on top of the database:
            </p>
            <ol className="list-decimal space-y-1 pl-4">
              <li>
                <strong>Store clean text</strong> &mdash; every post saves type, title, description, and location in the
                <code className="mx-1 px-1 text-primary font-medium">lost_found</code> table.
              </li>
              <li>
                <strong>Convert to vectors</strong> &mdash; an AI model turns each description into an embedding
                (high‑dimensional vector).
              </li>
              <li>
                <strong>Search for neighbours</strong> &mdash; when a new lost item is added, the system searches for nearby
                vectors from the "found" posts.
              </li>
              <li>
                <strong>Rank &amp; show suggestions</strong> &mdash; the top matches are shown as "AI suggested" results, which
                humans can confirm.
              </li>
            </ol>
            <p>
              This gives you a clear story to tell teachers: structured data in the database, plus an AI layer that adds
              intelligence without replacing human decisions.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-2xl border border-border/70 bg-card/80 p-4 text-xs text-muted-foreground md:p-5">
        <div className="flex items-center gap-2">
          <ArchiveRestore className="h-4 w-4" />
          <p className="font-medium text-foreground">How this helps in your project explanation</p>
        </div>
        <p className="mt-2">
          You can present this module as a structured alternative to scattered WhatsApp groups. The frontend already
          demonstrates search, posting, filtering, and a visual timeline. For the backend, you can explain how each post
          maps to a database row and how AI runs on top of this clean structure to match similar items.
        </p>
      </section>
    </main>
  );
};

export default LostFoundPage;
