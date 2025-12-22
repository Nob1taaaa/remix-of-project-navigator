import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Clock, BookOpen } from "lucide-react";
import { Session } from "@supabase/supabase-js";

const focusOptions = [
  "DSA & problem solving",
  "Core CS (OS/DBMS/CN)",
  "Development & projects",
  "Interview / placement prep",
  "Gate / higher studies",
];

const StudyPlannerPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [semester, setSemester] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [upcomingExams, setUpcomingExams] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [plan, setPlan] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoading(false);
        if (!session) {
          toast({
            title: "Login required",
            description: "Please sign in to use the Study Planner.",
          });
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const toggleFocus = (label: string) => {
    setSelectedFocus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label],
    );
  };

  const generatePlan = async () => {
    if (!hoursPerWeek.trim()) {
      toast({
        title: "Add weekly hours",
        description: "Tell the assistant roughly how many hours you can give per week.",
      });
      return;
    }

    setIsGenerating(true);
    setPlan("");

    const { data, error } = await supabase.functions.invoke<{ plan: string }>("study-planner", {
      body: {
        semester,
        targetRole,
        hoursPerWeek,
        focusAreas: selectedFocus,
        upcomingExams,
        extraContext,
      },
    });

    if (error) {
      console.error("Study planner error:", error);
      toast({
        title: "Could not generate plan",
        description: "The AI planner is unavailable right now. Please try again in a moment.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    if (data?.plan) {
      setPlan(data.plan.trim());
    }

    setIsGenerating(false);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 md:px-6">
      <header className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Personal Study &amp; Placement Planner
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Answer a few questions and let the AI mentor design a realistic weekly plan for your semester and
            placements.
          </p>
        </div>
        <Badge variant="outline" className="border-accent/50 bg-accent/10 text-[0.7rem] text-accent-foreground">
          <Sparkles className="mr-1 h-3.5 w-3.5" /> AI powered
        </Badge>
      </header>

      <section className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Tell the planner about you
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="semester">Semester / year</Label>
                <Input
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="e.g. 3rd year, 5th sem"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hours">Hours per week you can give *</Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  placeholder="e.g. 12"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="targetRole">Main goal or target role</Label>
              <Input
                id="targetRole"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. product-based SDE, ML, higher studies"
              />
            </div>

            <div className="space-y-1.5">
              <Label>What do you want to focus on?</Label>
              <div className="flex flex-wrap gap-2">
                {focusOptions.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleFocus(label)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[0.72rem] transition-colors ${
                      selectedFocus.includes(label)
                        ? "border-primary/70 bg-primary/10 text-primary"
                        : "border-border/70 bg-secondary/70 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exams">Upcoming exams / deadlines</Label>
              <Input
                id="exams"
                value={upcomingExams}
                onChange={(e) => setUpcomingExams(e.target.value)}
                placeholder="e.g. intern tests in Aug, university exams in Nov"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="extra">Anything else the planner should know?</Label>
              <Textarea
                id="extra"
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                placeholder="Mention lab-heavy weeks, backlogs, clubs, or constraints like no weekends."
                className="min-h-[80px] resize-none"
              />
            </div>

            <div className="pt-1">
              <Button
                className="h-9 rounded-full px-4 text-sm"
                onClick={generatePlan}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating your plan…" : "Generate my weekly plan"}
              </Button>
              <p className="mt-1 text-[0.72rem] text-muted-foreground">
                The plan is generated by an AI mentor via a Lovable Cloud function, using your inputs only.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-accent" />
              Your weekly roadmap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ScrollArea className="h-[340px] rounded-lg border border-border/60 bg-background/50 p-3 text-sm">
              {plan ? (
                <article className="prose prose-sm max-w-none dark:prose-invert">
                  {plan.split("\n").map((line, idx) => (
                    <p key={idx} className="whitespace-pre-wrap text-[0.86rem] leading-relaxed">
                      {line}
                    </p>
                  ))}
                </article>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                  <BookOpen className="h-8 w-8 text-muted-foreground/80" />
                  <p className="max-w-xs">
                    Your personalised timetable will appear here – including daily slots, non‑negotiable habits, and
                    4‑week milestones.
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default StudyPlannerPage;
