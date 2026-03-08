import { useState, useEffect } from "react";
import { ArrowRight, MessageCircle, Users, CalendarDays, HelpCircle, Compass, Sparkles, Zap, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

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

  return (
    <div className="text-foreground">
      <main className="mx-auto flex max-w-6xl flex-col gap-5 px-3 pb-12 pt-4 sm:gap-6 sm:px-4 md:gap-8 md:px-6 md:pt-10 lg:flex-row">
        {/* Left column */}
        <section className="flex-1 space-y-5 sm:space-y-6 animate-fade-in">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-primary/15 bg-card/60 backdrop-blur-xl p-5 sm:p-6 shadow-lg md:p-8">
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-[80px]" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-accent/12 blur-[80px]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-primary/5 blur-[60px]" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[0.65rem] font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  AI-Powered Campus Platform
                </div>
                <h1 className="max-w-xl text-balance text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                  Make your campus
                  <span className="bg-gradient-to-br from-primary via-accent-foreground to-primary bg-clip-text text-transparent">
                    {" "}brilliantly connected.
                  </span>
                </h1>
                <p className="max-w-xl text-sm text-muted-foreground leading-relaxed">
                  Events, lost &amp; found, study groups, and anonymous Q&amp;A – all in one place, powered by an AI campus assistant that never sleeps.
                </p>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <Button
                    className="hover-scale bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[var(--shadow-glow)] w-full sm:w-auto text-sm h-11 rounded-xl px-6"
                    onClick={() => navigate("/qa")}
                  >
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    Talk to Campus AI
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-foreground w-full sm:w-auto text-sm px-6"
                    onClick={() => navigate("/events")}
                  >
                    <CalendarDays className="mr-1.5 h-4 w-4 text-primary" />
                    Browse Events
                  </Button>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:flex sm:flex-wrap sm:gap-3">
                  {[
                    { icon: "🟢", label: "Real-time event board" },
                    { icon: "🤖", label: "AI smart recommendations" },
                    { icon: "📊", label: "Faculty-grade analytics" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1.5">
                      <span className="text-[0.6rem]">{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI chat preview */}
              <div className="mt-4 w-full max-w-xs shrink-0 rounded-2xl border border-primary/15 bg-card/80 backdrop-blur-xl p-3 shadow-lg sm:mt-0">
                <div className="mb-2.5 flex items-center justify-between text-[0.7rem] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary to-accent-foreground flex items-center justify-center">
                      <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-foreground">Campus AI</span>
                  </div>
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[0.6rem] font-medium text-primary">
                    ● Online
                  </span>
                </div>

                <div className="space-y-2 text-[0.72rem] leading-snug">
                  <div className="flex justify-end">
                    <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground shadow-sm">
                      Show me tech events for CSE this week.
                    </div>
                  </div>
                  <div className="flex justify-start animate-fade-in">
                    <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-secondary/70 px-3 py-2 text-secondary-foreground shadow-sm">
                      I found <span className="font-semibold text-primary">3 events</span> you may like:
                      <br />• HackNight 2025 – Today, 6 PM
                      <br />• System Design 101 – Thu, 4 PM
                      <br />• Career Panel – Sat, 11 AM
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-primary/5 border border-primary/10 px-2.5 py-1.5 text-[0.65rem] text-muted-foreground">
                  <span>Ask anything about your campus 💬</span>
                  <Compass className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                emoji: "📅",
                title: "Events this week",
                value: "12",
                desc: "live & upcoming events across campus",
                cta: "View all events",
                path: "/events",
                gradient: "from-primary to-primary/50",
                iconColor: "text-primary",
              },
              {
                emoji: "👥",
                title: "Study Groups",
                value: "8",
                desc: "curated spaces for DSA, DBMS, CN & more",
                cta: "Browse groups",
                path: "/study-groups",
                gradient: "from-accent-foreground to-accent-foreground/50",
                iconColor: "text-accent-foreground",
              },
              {
                emoji: "🎯",
                title: "AI Study Planner",
                value: "Plan",
                desc: "AI mentor designs a weekly prep plan for your goals",
                cta: "Start planning",
                path: "/planner",
                gradient: "from-primary/70 to-accent-foreground/50",
                iconColor: "text-primary",
              },
            ].map((card) => (
              <Card
                key={card.path}
                className="hover-scale cursor-pointer group border-primary/12 bg-card/70 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md hover:border-primary/25"
                onClick={() => navigate(card.path)}
              >
                <div className={`h-1 bg-gradient-to-r ${card.gradient}`} />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className={`text-[0.7rem] font-semibold ${card.iconColor} uppercase tracking-wider flex items-center gap-1.5`}>
                    <span>{card.emoji}</span> {card.title}
                  </CardTitle>
                  <Zap className={`h-4 w-4 ${card.iconColor} opacity-50 group-hover:opacity-100 transition-opacity`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{card.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
                  <span className={`mt-2 inline-flex items-center text-[0.7rem] font-semibold ${card.iconColor} group-hover:gap-2 transition-all`}>
                    {card.cta} <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Right column */}
        <aside className="w-full space-y-4 lg:w-80 lg:animate-slide-in-right">
          <Card className="border-primary/12 bg-card/70 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary/60 via-accent-foreground/40 to-primary/60" />
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-bold">Live campus stream</CardTitle>
                <p className="text-xs text-muted-foreground">Events, lost &amp; found, and hot questions</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[0.65rem] font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary pulse" />
                Live
              </span>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              {/* Event item */}
              <button className="flex w-full gap-3 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-transparent p-3 text-left hover-scale group" onClick={() => navigate("/events")}>
                <div className="mt-0.5 h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
                  <CalendarDays className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">HackNight 2025</p>
                  <p className="text-[0.72rem] font-medium text-primary mt-0.5">8 hour overnight build</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge className="bg-primary/10 border-primary/25 text-[0.6rem] text-primary font-semibold h-5">
                      <CalendarDays className="h-2.5 w-2.5 mr-0.5" /> Today · 6 PM
                    </Badge>
                    <Badge variant="outline" className="border-border/60 bg-background/50 text-[0.6rem] h-5">CSE</Badge>
                  </div>
                </div>
              </button>

              {/* Lost & Found item */}
              <button className="flex w-full gap-3 rounded-xl border border-primary/15 bg-gradient-to-r from-destructive/5 to-transparent p-3 text-left hover-scale" onClick={() => navigate("/lost-found")}>
                <div className="mt-0.5 h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center shadow-sm">
                  <span className="text-base">🔍</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-primary/10 border-primary/30 text-[0.6rem] font-bold text-primary h-5">FOUND</Badge>
                    <p className="text-sm font-bold text-foreground truncate">ID card near Block B</p>
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground mt-1">
                    AI suggests <span className="font-semibold text-primary">2 possible matches</span>
                  </p>
                </div>
              </button>

              {/* Q&A item */}
              <button className="flex w-full gap-3 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-transparent p-3 text-left hover-scale" onClick={() => navigate("/qa")}>
                <div className="mt-0.5 h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/30 to-accent-foreground/20 flex items-center justify-center shadow-sm">
                  <HelpCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">"How do I balance DSA &amp; labs?"</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[0.7rem] font-semibold text-primary">4 answers</span>
                    <span className="text-[0.65rem] text-muted-foreground">· AI summary ready</span>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Faculty card */}
          <Card className="border-primary/12 bg-card/70 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-accent-foreground/40 to-primary/40" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                🎓 For faculty &amp; coordinators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-muted-foreground">
              <p>Faculty and club coordinators get a focused view of what matters:</p>
              <ul className="space-y-1.5 pl-1">
                {[
                  "Approve & schedule events with AI-drafted descriptions",
                  "See which topics students struggle with in Q&A",
                  "Spot high-engagement clubs for better planning",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Floating AI button */}
      <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        <div className="hidden rounded-full bg-card/80 backdrop-blur-xl border border-primary/15 px-3 py-1.5 text-[0.7rem] text-muted-foreground shadow-lg md:block animate-fade-in">
          Ask anything about your campus, 24×7 💬
        </div>
        <Button
          size="icon"
          onClick={() => navigate("/qa")}
          className="hover-scale h-13 w-13 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-[var(--shadow-glow)] hover:shadow-lg transition-shadow"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
