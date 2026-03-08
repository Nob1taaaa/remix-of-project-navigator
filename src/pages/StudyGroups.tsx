import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Clock, GraduationCap, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudyGroup {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  subject: string;
  schedule: string | null;
  max_members: number | null;
  created_at: string;
}

const StudyGroupsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<"all" | "dsa" | "dbms" | "others">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", subject: "", schedule: "", max_members: "10" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth");
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadGroups();
      loadJoinedGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("study_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGroups(data || []);

      // Load member counts
      if (data && data.length > 0) {
        const { data: members, error: membersError } = await supabase
          .from("study_group_members")
          .select("group_id");

        if (!membersError && members) {
          const counts: Record<string, number> = {};
          members.forEach((m) => {
            counts[m.group_id] = (counts[m.group_id] || 0) + 1;
          });
          setMemberCounts(counts);
        }
      }
    } catch (error: any) {
      toast({ title: "Error loading groups", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadJoinedGroups = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("study_group_members")
      .select("group_id")
      .eq("user_id", user.id);

    if (data) {
      setJoinedGroups(new Set(data.map((d) => d.group_id)));
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;

    if (joinedGroups.has(groupId)) {
      // Leave group
      const { error } = await supabase
        .from("study_group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      setJoinedGroups((prev) => { const n = new Set(prev); n.delete(groupId); return n; });
      setMemberCounts((prev) => ({ ...prev, [groupId]: Math.max(0, (prev[groupId] || 1) - 1) }));
      toast({ title: "Left group" });
    } else {
      // Join group
      const { error } = await supabase
        .from("study_group_members")
        .insert({ group_id: groupId, user_id: user.id });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      setJoinedGroups((prev) => new Set(prev).add(groupId));
      setMemberCounts((prev) => ({ ...prev, [groupId]: (prev[groupId] || 0) + 1 }));
      toast({ title: "Joined group!" });
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !form.title.trim() || !form.subject.trim()) {
      toast({ title: "Missing fields", description: "Title and subject are required.", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("study_groups")
        .insert({
          creator_id: user.id,
          title: form.title.trim(),
          description: form.description.trim() || null,
          subject: form.subject.trim(),
          schedule: form.schedule.trim() || null,
          max_members: parseInt(form.max_members) || 10,
        })
        .select()
        .single();

      if (error) throw error;

      setGroups((prev) => [data, ...prev]);
      setIsCreateOpen(false);
      setForm({ title: "", description: "", subject: "", schedule: "", max_members: "10" });
      toast({ title: "Group created!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    const { error } = await supabase.from("study_groups").delete().eq("id", groupId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    toast({ title: "Group deleted" });
  };

  const filteredGroups = groups.filter((g) => {
    if (tab === "all") return true;
    if (tab === "dsa") return g.subject.toLowerCase().includes("dsa");
    if (tab === "dbms") return g.subject.toLowerCase().includes("dbms");
    return !g.subject.toLowerCase().includes("dsa") && !g.subject.toLowerCase().includes("dbms");
  });

  const Tab = ({ id, label }: { id: "all" | "dsa" | "dbms" | "others"; label: string }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.7rem] transition-colors ${
        tab === id
          ? "bg-primary text-primary-foreground"
          : "bg-primary/10 text-foreground hover:bg-primary/20 border border-primary/20"
      }`}
    >
      {label}
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
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-6">
      <header className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Study groups</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join or create focused groups for DSA, DBMS, CN, OS and more.
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 rounded-full"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Create study group
        </Button>
      </header>

      {/* Tabs */}
      <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-card/90 p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tab id="all" label="All" />
          <Tab id="dsa" label="DSA" />
          <Tab id="dbms" label="DBMS" />
          <Tab id="others" label="Others" />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-[0.7rem] text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>AI can suggest ideal groups based on your subjects and upcoming exams.</span>
        </div>
      </section>

      {/* Groups grid */}
      <section className="grid gap-4 md:grid-cols-2">
        {filteredGroups.length === 0 ? (
          <Card className="border-primary/20 bg-card/90 rounded-2xl md:col-span-2">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              No study groups yet. Create the first one!
            </CardContent>
          </Card>
        ) : (
          filteredGroups.map((group) => {
            const count = memberCounts[group.id] || 0;
            const isJoined = joinedGroups.has(group.id);
            const isCreator = group.creator_id === user?.id;

            return (
              <Card key={group.id} className="hover-scale border-primary/20 bg-card/90 shadow-sm rounded-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm font-semibold">{group.title}</CardTitle>
                      {group.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{group.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[0.65rem] text-foreground">
                      {count} / {group.max_members || 10}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" /> {group.subject}
                    </span>
                    {group.schedule && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {group.schedule}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {count} members
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={isJoined ? "outline" : "default"}
                      className="h-8 rounded-full text-[0.7rem]"
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      {isJoined ? "Leave group" : "Join group"}
                    </Button>
                    {isCreator && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full text-[0.7rem] border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create a study group</DialogTitle>
            <DialogDescription>Set up a new study group for your campus mates.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Group title *</Label>
              <Input
                placeholder="e.g. DSA Prep – Evening batch"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Subject *</Label>
              <Input
                placeholder="e.g. DSA, DBMS, CN"
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What will you study? Any prerequisites?"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Schedule</Label>
                <Input
                  placeholder="e.g. Mon, Wed, Fri 7 PM"
                  value={form.schedule}
                  onChange={(e) => setForm((p) => ({ ...p, schedule: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Max members</Label>
                <Input
                  type="number"
                  min={2}
                  value={form.max_members}
                  onChange={(e) => setForm((p) => ({ ...p, max_members: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateGroup}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default StudyGroupsPage;
