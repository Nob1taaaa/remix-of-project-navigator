import { useState } from "react";
import { Users, Clock, GraduationCap, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const StudyGroupsPage = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"all" | "dsa" | "dbms" | "others">("all");

  const Tab = ({ id, label }: { id: "all" | "dsa" | "dbms" | "others"; label: string }) => (
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
          onClick={() => toast({ title: "Create group (demo)", description: "Later this opens a form and saves to DB." })}
        >
          + Create study group
        </Button>
      </header>

      {/* Subject tabs + AI helper */}
      <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tab id="all" label="All" />
          <Tab id="dsa" label="DSA" />
          <Tab id="dbms" label="DBMS" />
          <Tab id="others" label="Others" />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2 text-[0.7rem] text-secondary-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>
            AI can later suggest ideal groups based on subjects you struggle with and upcoming exams.
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="hover-scale border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">DSA Prep – Evening batch</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Daily practice for arrays, trees, and dynamic programming with timed contests.
                </p>
              </div>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[0.65rem] text-primary">
                6 / 8 seats
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 7:00 – 8:30 PM · Mon, Wed, Fri
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> 3rd year CSE
              </span>
            </div>
            <Button
              size="sm"
              className="h-8 rounded-full text-[0.7rem]"
              onClick={() =>
                toast({
                  title: "Join group (demo)",
                  description: "In the full version, this links your user ID to this group in a join table.",
                })
              }
            >
              Request to join
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-scale border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">DBMS Exam Sprint</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  7-day revision plan with previous year questions and viva-style practice.
                </p>
              </div>
              <Badge variant="outline" className="border-border/80 bg-secondary text-[0.65rem]">
                Open
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" /> Mixed branches
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> 12 members
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-full text-[0.7rem]"
              onClick={() =>
                toast({
                  title: "View syllabus (demo)",
                  description: "Later this can fetch a syllabus/plan from the database or AI-generated outline.",
                })
              }
            >
              View plan
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
              Study rhythm timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="relative pl-4">
              <div className="absolute left-1 top-0 h-full w-px bg-border/80" />
              <div className="relative mb-3 flex flex-col gap-0.5">
                <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-primary" />
                <p className="text-[0.78rem] font-medium">DSA group finished tree problems sprint</p>
                <p className="text-[0.7rem] text-muted-foreground">Yesterday · 2 contests completed</p>
              </div>
              <div className="relative mb-3 flex flex-col gap-0.5">
                <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-accent" />
                <p className="text-[0.78rem] font-medium">New DBMS crash course group created</p>
                <p className="text-[0.7rem] text-muted-foreground">Today · 7-day plan</p>
              </div>
              <div className="relative flex flex-col gap-0.5">
                <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-emerald-400" />
                <p className="text-[0.78rem] font-medium">Evening batch reached full capacity</p>
                <p className="text-[0.7rem] text-muted-foreground">In 30 minutes · 8 / 8 members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              How AI helps study groups (for viva)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[0.7rem] text-muted-foreground">
            <p>
              Explain this as a personal "study coach" on top of the <code className="mx-1 rounded bg-secondary px-1">study_groups</code>
              and <code className="mx-1 rounded bg-secondary px-1">group_members</code> tables:
            </p>
            <ol className="list-decimal space-y-1 pl-4">
              <li>Create groups with subjects, difficulty, schedule, and capacity.</li>
              <li>Track which subjects a student joins or leaves over time.</li>
              <li>
                Ask the AI model to suggest a balanced weekly plan and which groups best match upcoming exams.
              </li>
              <li>Optionally generate practice questions or revision topics inside each group.</li>
            </ol>
            <p>
              This shows how you combine relational data, user behaviour, and AI to improve how students study.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default StudyGroupsPage;
