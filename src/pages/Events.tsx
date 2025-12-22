import { useState, useEffect } from "react";
import { CalendarDays, Filter, MapPin, ArrowRight, Sparkles, Activity, Search, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

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
    title: "",
    description: "",
    event_date: "",
    location: "",
    category: "",
  });

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
    if (user) {
      loadEvents();
      loadInterestedEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInterestedEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("event_attendees")
        .select("event_id")
        .eq("user_id", user.id);

      if (error) throw error;
      
      const eventIds = new Set(data?.map(item => item.event_id) || []);
      setInterestedEvents(eventIds);

      // Load activities based on interested events
      if (data && data.length > 0) {
        const activities: ActivityItem[] = data.slice(0, 5).map((item, index) => ({
          id: `a-${index}`,
          label: `You marked an event as interested`,
          meta: "Previously",
          color: "primary" as const,
        }));
        setActivities(activities);
      }
    } catch (error: any) {
      console.error("Error loading interested events:", error);
    }
  };

  const filteredEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      event.title.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query) ||
      event.category?.toLowerCase().includes(query)
    );
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleMarkInterested = async (event: Event) => {
    if (!user) return;

    if (interestedEvents.has(event.id)) {
      toast({
        title: "Already marked",
        description: `You have already marked interest for ${event.title}.`,
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("event_attendees")
        .insert({
          event_id: event.id,
          user_id: user.id,
        });

      if (error) throw error;

      setInterestedEvents((prev) => new Set(prev).add(event.id));
      setActivities((prev) => [
        {
          id: `a-${Date.now()}`,
          label: `You marked ${event.title} as interested`,
          meta: "Just now",
          color: "primary",
        },
        ...prev,
      ]);

      toast({
        title: "Interest marked!",
        description: `${event.title} added to your activity timeline.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId)
        .eq("organizer_id", user.id);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast({
        title: "Event removed",
        description: "The event has been removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddEvent = async () => {
    if (!user) return;

    if (
      !newEventForm.title.trim() ||
      !newEventForm.description.trim() ||
      !newEventForm.event_date.trim() ||
      !newEventForm.location.trim()
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields (marked with *).",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("events")
        .insert({
          title: newEventForm.title.trim(),
          description: newEventForm.description.trim(),
          event_date: new Date(newEventForm.event_date).toISOString(),
          location: newEventForm.location.trim(),
          category: newEventForm.category.trim() || "general",
          organizer_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setEvents((prev) => [data, ...prev]);
      setActivities((prev) => [
        {
          id: `a-${Date.now()}`,
          label: `New event created: ${data.title}`,
          meta: "Just now · You organized",
          color: "accent",
        },
        ...prev,
      ]);

      toast({
        title: "Event added successfully!",
        description: "Your event is now visible to all students.",
      });

      setIsAddEventDialogOpen(false);
      setNewEventForm({
        title: "",
        description: "",
        event_date: "",
        location: "",
        category: "",
      });
    } catch (error: any) {
      toast({
        title: "Error adding event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const Tab = ({ id, label }: { id: "all" | "today" | "week" | "mine"; label: string }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.7rem] transition-colors ${
        tab === id
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-6">
      <header className="mb-4 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Campus events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Workshops, fests, club meets, and guest lectures curated for your campus.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
            <CalendarDays className="h-3.5 w-3.5" /> Total events: {events.length}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSignOut}
            className="h-7 rounded-full px-3 text-[0.7rem]"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Tabs + AI overview */}
      <section className="mb-4 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tab id="all" label="All" />
          <Tab id="today" label="Today" />
          <Tab id="week" label="This week" />
          <Tab id="mine" label="My events" />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2 text-[0.7rem] text-secondary-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>
            AI can later highlight <strong>most relevant</strong> events for each student based on branch, year, and past
            interest.
          </span>
        </div>
      </section>

      {/* Filters + search */}
      <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title, club, or tag"
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/80"
          />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 md:mt-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-2.5 py-1">
            <Filter className="h-3.5 w-3.5" /> Quick filters
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 rounded-full border-border/80 text-[0.7rem]"
            onClick={() => setSearch("today")}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 rounded-full border-border/80 text-[0.7rem]"
            onClick={() => setSearch("cse")}
          >
            CSE only
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 rounded-full border-border/80 text-[0.7rem]"
            onClick={() => setSearch("technical")}
          >
            Technical
          </Button>
        </div>
      </section>

      {/* Main events grid */}
      <section className="grid gap-4 md:grid-cols-2">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="hover-scale border-border/70 bg-card/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-semibold">{event.title}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
                </div>
                {event.category && (
                  <Badge
                    variant="outline"
                    className="border-primary/40 bg-primary/10 text-[0.65rem] text-primary"
                  >
                    {event.category}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> 
                  {new Date(event.event_date).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {event.location}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-secondary" />
                  <div className="h-6 w-6 rounded-full bg-secondary" />
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[0.6rem]">
                    +18
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user && event.organizer_id === user.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 rounded-full px-3 text-[0.7rem]"
                      onClick={() => handleRemoveEvent(event.id)}
                    >
                      Remove
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="h-7 rounded-full px-3 text-[0.7rem]"
                    onClick={() => handleMarkInterested(event)}
                    disabled={interestedEvents.has(event.id)}
                  >
                    {interestedEvents.has(event.id) ? "Already interested" : "Mark as interested"}
                    <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed border-border/70 bg-background/40 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Add a future club event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <p>
              Create an upcoming workshop, hackathon, or meet-up. This will be saved to the shared events board and
              visible to all students.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 rounded-full px-3 text-[0.7rem]"
              onClick={() => setIsAddEventDialogOpen(true)}
            >
              Add an event
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Timeline + AI explainer */}
      <section className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4" />
              Your activity timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="relative pl-4">
              <div className="absolute left-2 top-0 h-full w-px bg-border/80" />
              {activities.length === 0 ? (
                <p className="text-[0.75rem] text-muted-foreground">
                  When you interact with events (interested, register, create), they will appear here in your personal timeline.
                </p>
              ) : (
                activities.map((item) => (
                  <div key={item.id} className="relative mb-3 flex flex-col gap-0.5 pl-4 last:mb-0">
                    <span
                      className={
                        "absolute left-1.5 top-1 h-2.5 w-2.5 rounded-full ring-2 ring-card " +
                        (item.color === "primary"
                          ? "bg-primary"
                          : item.color === "accent"
                            ? "bg-accent"
                            : "bg-emerald-400")
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

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              How AI curates events (for viva)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[0.7rem] text-muted-foreground">
            <p>
              You can describe this as a recommendation layer on top of the <code className="mx-1 rounded bg-secondary px-1">events</code>
              table:
            </p>
            <ol className="list-decimal space-y-1 pl-4">
              <li>
                Store events with tags like branch, year, type, and difficulty.
              </li>
              <li>
                Track basic activity (interested, viewed) for each user.
              </li>
              <li>
                Use an AI model to score events for a student, based on profile + history.
              </li>
              <li>
                Show the highest‑scoring ones first as "Recommended for you" on the homepage.
              </li>
            </ol>
            <p>
              This connects data modelling, simple analytics, and AI into one clear story your teachers will appreciate.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add a new event</DialogTitle>
            <DialogDescription>
              Fill in the details for your event. This will be visible to all students on campus.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event title *</Label>
              <Input
                id="title"
                placeholder="e.g. Club showcase"
                value={newEventForm.title}
                onChange={(e) =>
                  setNewEventForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the event"
                value={newEventForm.description}
                onChange={(e) =>
                  setNewEventForm((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event_date">Date & Time *</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={newEventForm.event_date}
                onChange={(e) =>
                  setNewEventForm((prev) => ({ ...prev, event_date: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g. Main auditorium"
                value={newEventForm.location}
                onChange={(e) =>
                  setNewEventForm((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                placeholder="e.g. CSE, Technical, Cultural"
                value={newEventForm.category}
                onChange={(e) =>
                  setNewEventForm((prev) => ({ ...prev, category: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddEventDialogOpen(false);
                setNewEventForm({
                  title: "",
                  description: "",
                  event_date: "",
                  location: "",
                  category: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default EventsPage;