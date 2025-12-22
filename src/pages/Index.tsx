import { useState, useEffect } from "react";
import { ArrowRight, Bell, MessageCircle, Sparkles, Users, CalendarDays, HelpCircle, Search, Compass, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import logoImage from "@/assets/logo.png";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  const handleAiClick = () => {
    navigate("/qa");
  };

  const handleNotificationsClick = () => {
    toast({
      title: "Notifications",
      description: "In the full version this will show event reminders and announcements.",
    });
  };

  const handlePrimaryCta = () => {
    navigate("/qa");
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src={logoImage} 
              alt="Campus Innovation Hackathon Logo" 
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-contain bg-white/90 p-1 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-semibold tracking-tight sm:text-sm md:text-base">Campus Innovation</span>
                <Badge
                  variant="secondary"
                  className="border-primary/20 bg-primary/10 text-[0.55rem] sm:text-[0.65rem] uppercase tracking-wide text-foreground"
                >
                  Hackathon
                </Badge>
              </div>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Innovate. Create. Code.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-foreground shadow-sm transition-colors hover:bg-primary/10 md:flex"
              type="button"
              onClick={() =>
                toast({
                  title: "Global search (demo)",
                  description: "Later this can filter events, groups, and Q&A from the database.",
                })
              }
            >
              <Search className="mr-1 h-3.5 w-3.5 text-primary" />
              <span>Search events, groups, questions…</span>
            </button>
            <Button
              size="icon"
              variant="outline"
              className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10"
              type="button"
              onClick={handleNotificationsClick}
            >
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground" />
              <span className="absolute right-1 top-1 inline-flex h-1.5 w-1.5 rounded-full bg-primary pulse" />
            </Button>
            {user ? (
              <>
                <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-accent/70 text-xs font-semibold text-primary-foreground md:flex">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-primary/10"
                  onClick={handleSignOut}
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-[0.65rem] sm:text-xs h-7 sm:h-8 px-2.5 sm:px-3 rounded-full border-primary/20 bg-primary/5 text-foreground hover:bg-primary/10"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-3 pb-24 pt-4 sm:gap-6 sm:px-4 md:gap-8 md:px-6 md:pt-10 lg:flex-row">
        {/* Left column – hero & highlights */}
        <section className="flex-1 space-y-4 sm:space-y-5 md:space-y-6 animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/20 bg-background/80 p-4 sm:p-5 shadow-[var(--shadow-soft)] md:p-8">
            <div className="pointer-events-none absolute -left-10 top-[-40px] h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-[-40px] h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <h1 className="max-w-xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                  Make your campus
                  <span className="bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent">
                    {" "}
                    brilliantly connected.
                  </span>
                </h1>
                <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                  Events, lost &amp; found, study groups, and anonymous Q&amp;A – all in one place, powered by an AI campus
                  assistant that never sleeps.
                </p>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <Button
                    className="hover-scale bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-[var(--shadow-glow)] w-full sm:w-auto text-sm"
                    type="button"
                    onClick={handlePrimaryCta}
                  >
                    Talk to Campus AI
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                  <button
                    className="story-link text-xs font-medium text-muted-foreground text-center sm:text-left"
                    type="button"
                    onClick={() =>
                      toast({
                        title: "Demo journey", 
                        description: "Scroll down and imagine these sections wired to real data and AI.",
                      })
                    }
                  >
                    Explore live demo journey
                  </button>
                </div>

                <div className="mt-3 sm:mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:gap-4">
                  <div className="flex items-center gap-2 bg-primary/5 rounded-full px-3 py-1.5 border border-primary/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Real-time event board
                  </div>
                  <div className="flex items-center gap-2 bg-primary/5 rounded-full px-3 py-1.5 border border-primary/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    AI smart recommendations
                  </div>
                  <div className="flex items-center gap-2 bg-primary/5 rounded-full px-3 py-1.5 border border-primary/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Faculty-grade analytics
                  </div>
                </div>
              </div>

              {/* Hero assistant preview */}
              <div className="mt-4 w-full max-w-xs shrink-0 rounded-xl sm:rounded-2xl border border-primary/20 bg-card/90 p-2.5 sm:p-3 shadow-lg backdrop-blur-xl sm:mt-0">
                <div className="mb-2 flex items-center justify-between text-[0.7rem] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="h-3 w-3 text-primary" />
                    <span>Campus AI</span>
                  </div>
                  <span className="rounded-full bg-secondary/70 px-2 py-0.5 text-[0.65rem] text-secondary-foreground">
                    Online
                  </span>
                </div>

                <div className="space-y-2 text-[0.72rem] leading-snug">
                  <div className="flex justify-end">
                    <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-primary/90 px-3 py-2 text-primary-foreground shadow-sm">
                      Show me tech events for CSE this week.
                    </div>
                  </div>
                  <div className="flex justify-start animate-fade-in">
                    <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-secondary/70 px-3 py-2 text-secondary-foreground shadow-sm">
                      I found <span className="font-medium">3 events</span> you may like:
                      <br />
                      • HackNight 2025 – Today, 6 PM
                      <br />
                      • System Design 101 – Thu, 4 PM
                      <br />
                      • Career Panel – Sat, 11 AM
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[0.7rem] text-muted-foreground">
                  <span>Ask anything about your campus.</span>
                  <Compass className="h-3.5 w-3.5 text-accent" />
                </div>
              </div>
            </div>
          </div>

          {/* Highlight cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <Card className="hover-scale border-primary/20 bg-card/90 shadow-sm rounded-xl sm:rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">This week</CardTitle>
                <CalendarDays className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">12</div>
                <p className="mt-1 text-xs text-muted-foreground">live &amp; upcoming events across campus.</p>
              </CardContent>
            </Card>

            <Card className="hover-scale border-primary/20 bg-card/90 shadow-sm rounded-xl sm:rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Study groups</CardTitle>
                <Users className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">8</div>
                <p className="mt-1 text-xs text-muted-foreground">curated spaces for DSA, DBMS, CN &amp; more.</p>
              </CardContent>
            </Card>

            <Card
              className="hover-scale cursor-pointer border-primary/20 bg-card/90 shadow-sm rounded-xl sm:rounded-2xl"
              onClick={() => navigate("/planner")}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Study &amp; placements</CardTitle>
                <HelpCircle className="h-4 w-4 text-amber-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">Plan</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  open an AI mentor that designs a weekly prep plan for your goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Right column – streams */}
        <aside className="w-full space-y-3 sm:space-y-4 lg:w-80 lg:animate-slide-in-right">
          {/* Events stream */}
          <Card className="border-primary/20 bg-card/90 shadow-sm rounded-xl sm:rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-semibold">Live campus stream</CardTitle>
                <p className="text-xs text-muted-foreground">Events, lost &amp; found, and hot questions.</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse" />
                Live
              </span>
            </CardHeader>
              <CardContent className="space-y-3 text-xs">
              <button
                type="button"
                className="flex w-full gap-2.5 sm:gap-3 rounded-xl border border-primary/15 bg-primary/5 p-2.5 sm:p-3 text-left hover-scale"
                onClick={() => navigate("/events")}
              >
                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-primary/80 to-primary/40" />
                <div>
                  <p className="text-[0.78rem] font-medium">HackNight 2025 – 8 hour overnight build</p>
                  <p className="text-[0.7rem] text-muted-foreground">Starts today · 6:00 PM · Innovation Lab</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge
                      variant="outline"
                      className="border-primary/40 bg-primary/10 text-[0.65rem] text-primary"
                    >
                      CSE
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-border/70 bg-background/60 text-[0.65rem]"
                    >
                      Hackathon
                    </Badge>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className="flex w-full gap-2.5 sm:gap-3 rounded-xl border border-primary/15 bg-primary/5 p-2.5 sm:p-3 text-left hover-scale"
                onClick={() => navigate("/lost-found")}
              >
                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-accent/80 to-accent/40" />
                <div>
                  <p className="text-[0.78rem] font-medium">Found: ID card near Block B</p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    AI suggests 2 possible matches based on lost posts.
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge
                      variant="outline"
                      className="border-accent/50 bg-accent/10 text-[0.65rem] text-accent-foreground"
                    >
                      Lost &amp; Found
                    </Badge>
                  </div>
                </div>
              </button>

              <button
                type="button"
                className="flex w-full gap-2.5 sm:gap-3 rounded-xl border border-primary/15 bg-primary/5 p-2.5 sm:p-3 text-left hover-scale"
                onClick={() => navigate("/qa")}
              >
                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-amber-300/90 to-amber-500/50" />
                <div>
                  <p className="text-[0.78rem] font-medium">
                    Anonymous: "How do I balance DSA &amp; semester labs?"
                  </p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    4 answers · AI summary ready for quick review.
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge
                      variant="outline"
                      className="border-border/70 bg-background/60 text-[0.65rem]"
                    >
                      Q&amp;A
                    </Badge>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* For teachers & admins */}
          <Card className="border-primary/20 bg-card/90 shadow-sm rounded-xl sm:rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">For faculty &amp; coordinators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>
                CampusConnect AI is not just for students. Faculty and club coordinators get a focused view of what
                matters:
              </p>
              <ul className="list-disc space-y-1 pl-4">
                <li>Approve &amp; schedule events in seconds with AI-drafted descriptions.</li>
                <li>See which topics students are struggling with in anonymous Q&amp;A.</li>
                <li>Spot high-engagement clubs and events for better planning.</li>
              </ul>
              <p className="text-[0.7rem] text-muted-foreground/90">
                In your final project report, you can highlight this as an analytics and decision-support layer for
                teachers and administration.
              </p>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Floating AI entrypoint + demo chat panel */}
      <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        <div className="hidden rounded-full bg-background/80 px-3 py-1.5 text-[0.7rem] text-muted-foreground shadow-lg backdrop-blur-xl md:block animate-fade-in">
          Ask anything about your campus, 24×7.
        </div>
        <Button
          size="icon"
          type="button"
          onClick={handleAiClick}
          className="hover-scale h-12 w-12 rounded-full bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>

    </div>
  );
};

export default Index;
