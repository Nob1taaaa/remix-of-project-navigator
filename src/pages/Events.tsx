import { useState, useEffect } from "react";
import { CalendarDays, Filter, MapPin, ArrowRight, Sparkles, Activity, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import PageHeader from "@/components/PageHeader";

type Event = Tables<"events">;

interface ActivityItem {
  id: string;
  label: string;
  meta: string;
  color: "primary" | "accent" | "success";
}

const EventsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"all" | "today" | "week" | "mine">("all");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [interestedEvents, setInterestedEvents] = useState<Set<string>>(new Set());
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEventForm, setNewEventForm] = useState({
    title: "", description: "", event_date: "", location: "", category: "",
  });

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
    if (user) { loadEvents(); loadInterestedEvents(); }
  }, [user]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: true });
      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({ title: "Error loading events", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const loadInterestedEvents = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("event_attendees").select("event_id").eq("user_id", user.id);
      if (error) throw error;
      setInterestedEvents(new Set(data?.map(item => item.event_id) || []));
      if (data && data.length > 0) {
        setActivities(data.slice(0, 5).map((item, i) => ({
          id: `a-${i}`, label: "You marked an event as interested", meta: "Previously", color: "primary" as const,
        })));
      }
    } catch (error: any) { console.error("Error loading interested events:", error); }
  };

  const filteredEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return event.title.toLowerCase().includes(query) || event.description?.toLowerCase().includes(query) || event.location?.toLowerCase().includes(query) || event.category?.toLowerCase().includes(query);
  });

  const handleMarkInterested = async (event: Event) => {
    if (!user) return;
    if (interestedEvents.has(event.id)) { toast({ title: "Already marked", description: `You have already marked interest for ${event.title}.` }); return; }
    try {
      const { error } = await supabase.from("event_attendees").insert({ event_id: event.id, user_id: user.id });
      if (error) throw error;
      setInterestedEvents((prev) => new Set(prev).add(event.id));
      setActivities((prev) => [{ id: `a-${Date.now()}`, label: `You marked ${event.title} as interested`, meta: "Just now", color: "primary" }, ...prev]);
      toast({ title: "Interest marked!", description: `${event.title} added to your activity timeline.` });
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleRemoveEvent = async (eventId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId).eq("organizer_id", user.id);
      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast({ title: "Event removed" });
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const handleAddEvent = async () => {
    if (!user) return;
    if (!newEventForm.title.trim() || !newEventForm.description.trim() || !newEventForm.event_date.trim() || !newEventForm.location.trim()) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" }); return;
    }
    try {
      const { data, error } = await supabase.from("events").insert({
        title: newEventForm.title.trim(), description: newEventForm.description.trim(),
        event_date: new Date(newEventForm.event_date).toISOString(), location: newEventForm.location.trim(),
        category: newEventForm.category.trim() || "general", organizer_id: user.id,
      }).select().single();
      if (error) throw error;
      setEvents((prev) => [data, ...prev]);
      setActivities((prev) => [{ id: `a-${Date.now()}`, label: `New event: ${data.title}`, meta: "Just now", color: "accent" }, ...prev]);
      toast({ title: "Event added!" });
      setIsAddEventDialogOpen(false);
      setNewEventForm({ title: "", description: "", event_date: "", location: "", category: "" });
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
  };

  const Tab = ({ id, label }: { id: "all" | "today" | "week" | "mine"; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[0.7rem] font-medium transition-all ${
        tab === id
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-primary/8 text-muted-foreground hover:bg-primary/15 hover:text-foreground border border-primary/15"
      }`}
    >{label}</button>
  );

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><p className="text-muted-foreground animate-pulse">Loading events...</p></div>;
  }

  return (
    <main className="mx-auto max-w-6xl px-3 pb-16 pt-5 sm:px-4 sm:pt-6 md:px-6 md:pt-8">
      <PageHeader icon="📅" title="Campus Events" subtitle="Workshops, fests, club meets, and guest lectures curated for your campus.">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary/5 text-xs text-foreground">
            <CalendarDays className="h-3 w-3 mr-1 text-primary" /> {events.length} events
          </Badge>
          <Button size="sm" className="h-8 rounded-full text-xs" onClick={() => setIsAddEventDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Event
          </Button>
        </div>
      </PageHeader>

      {/* Tabs + AI */}
      <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-primary/12 bg-card/60 backdrop-blur-sm p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tab id="all" label="All" />
          <Tab id="today" label="Today" />
          <Tab id="week" label="This week" />
          <Tab id="mine" label="My events" />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/15 px-3 py-2 text-[0.7rem] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>AI highlights <strong className="text-foreground">most relevant</strong> events for you</span>
        </div>
      </section>

      {/* Search */}
      <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-primary/12 bg-card/60 backdrop-blur-sm p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-primary/15 bg-background/60 px-3 py-2 text-muted-foreground">
          <Search className="h-3.5 w-3.5 text-primary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events by title, club, or tag..." className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/60" />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 md:mt-0">
          <span className="inline-flex items-center gap-1.5 text-[0.65rem] text-muted-foreground"><Filter className="h-3 w-3" /> Filters:</span>
          {["Today", "CSE", "Technical"].map((f) => (
            <Button key={f} size="sm" variant="outline" className="h-6 rounded-full border-primary/15 bg-primary/5 text-[0.65rem] px-2.5 hover:bg-primary/10" onClick={() => setSearch(f.toLowerCase())}>{f}</Button>
          ))}
        </div>
      </section>

      {/* Events grid */}
      <section className="grid gap-4 md:grid-cols-2">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover-scale group border-primary/12 bg-card/70 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md hover:border-primary/25">
            <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-accent-foreground/40" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-bold text-foreground truncate">{event.title}</CardTitle>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">{event.description}</p>
                </div>
                {event.category && (
                  <Badge className="bg-primary/10 border-primary/25 text-primary text-[0.65rem] font-semibold px-2.5 py-0.5 shrink-0">
                    {event.category}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 border border-primary/20 px-2.5 py-1 text-[0.72rem] font-semibold text-primary">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {new Date(event.event_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 border border-accent-foreground/15 px-2.5 py-1 text-[0.72rem] font-medium text-accent-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {event.location}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-card" />
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent/40 to-accent/10 border-2 border-card" />
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/8 border-2 border-card text-[0.55rem] font-semibold text-primary">+18</div>
                </div>
                <div className="flex items-center gap-2">
                  {user && event.organizer_id === user.id && (
                    <Button size="sm" variant="outline" className="h-7 rounded-full px-3 text-[0.65rem] border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => handleRemoveEvent(event.id)}>Remove</Button>
                  )}
                  <Button
                    size="sm"
                    className={`h-7 rounded-full px-3 text-[0.65rem] font-semibold ${interestedEvents.has(event.id) ? "bg-primary/10 text-primary border border-primary/25 hover:bg-primary/15" : ""}`}
                    variant={interestedEvents.has(event.id) ? "outline" : "default"}
                    onClick={() => handleMarkInterested(event)}
                    disabled={interestedEvents.has(event.id)}
                  >
                    {interestedEvents.has(event.id) ? "✓ Interested" : <>Mark interested <ArrowRight className="ml-1 h-3 w-3" /></>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed border-primary/15 bg-card/40 shadow-none rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="h-12 w-12 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Add a new event</p>
              <p className="text-xs text-muted-foreground mt-1">Create a workshop, hackathon, or meet-up</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 rounded-full px-4 text-xs border-primary/20" onClick={() => setIsAddEventDialogOpen(true)}>
              Add an event
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Timeline */}
      <section className="mt-8 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="border-primary/12 bg-card/70 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary/40 to-accent-foreground/30" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Activity className="h-4 w-4 text-primary" /> Your activity timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="relative pl-4">
              <div className="absolute left-2 top-0 h-full w-px bg-gradient-to-b from-primary/30 to-transparent" />
              {activities.length === 0 ? (
                <p className="text-[0.75rem] text-muted-foreground py-4">
                  When you interact with events, they will appear in your personal timeline ✨
                </p>
              ) : (
                activities.map((item) => (
                  <div key={item.id} className="relative mb-3 flex flex-col gap-0.5 pl-4 last:mb-0">
                    <span className={`absolute left-1.5 top-1 h-2.5 w-2.5 rounded-full ring-2 ring-card ${item.color === "primary" ? "bg-primary" : item.color === "accent" ? "bg-accent-foreground" : "bg-primary/60"}`} />
                    <p className="text-[0.78rem] font-medium">{item.label}</p>
                    <p className="text-[0.7rem] text-muted-foreground">{item.meta}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/12 bg-card/70 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-accent-foreground/30 to-primary/30" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Sparkles className="h-4 w-4 text-primary" /> How AI curates events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-[0.7rem] text-muted-foreground">
            <p>AI recommendation layer on top of events:</p>
            <ol className="list-decimal space-y-1.5 pl-4">
              <li>Store events with tags like branch, year, type</li>
              <li>Track activity (interested, viewed) per user</li>
              <li>AI scores events based on profile + history</li>
              <li>Show highest-scoring as "Recommended for you"</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">📅 Add a new event</DialogTitle>
            <DialogDescription>Fill in the details for your event. Visible to all students.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event title *</Label>
              <Input id="title" placeholder="e.g. Club showcase" value={newEventForm.title} onChange={(e) => setNewEventForm((p) => ({ ...p, title: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" placeholder="Brief description" value={newEventForm.description} onChange={(e) => setNewEventForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event_date">Date & Time *</Label>
              <Input id="event_date" type="datetime-local" value={newEventForm.event_date} onChange={(e) => setNewEventForm((p) => ({ ...p, event_date: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" placeholder="e.g. Main auditorium" value={newEventForm.location} onChange={(e) => setNewEventForm((p) => ({ ...p, location: e.target.value }))} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g. CSE, Technical" value={newEventForm.category} onChange={(e) => setNewEventForm((p) => ({ ...p, category: e.target.value }))} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddEventDialogOpen(false); setNewEventForm({ title: "", description: "", event_date: "", location: "", category: "" }); }} className="rounded-xl">Cancel</Button>
            <Button onClick={handleAddEvent} className="rounded-xl">Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default EventsPage;
