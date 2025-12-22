import { useState } from "react";
import { HelpCircle, MessageCircle, ThumbsUp, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const QAPage = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"all" | "academics" | "careers" | "mine">("all");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage = { role: "user" as const, content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    const { data, error } = await supabase.functions.invoke<{
      assistantMessage: string;
    }>("qa-assistant", {
      body: { messages: nextMessages },
    });

    if (error) {
      console.error("AI assistant error:", error);
      toast({
        title: "AI assistant error",
        description: "Unable to get a response right now. Please try again.",
        variant: "destructive",
      });
      setIsSending(false);
      return;
    }

    const reply = data?.assistantMessage?.trim();
    if (reply) {
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    }
    setIsSending(false);
  };

  const Tab = ({ id, label }: { id: "all" | "academics" | "careers" | "mine"; label: string }) => (
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
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Anonymous Q&amp;A</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A safe space for students to ask anything about academics, careers, or campus life.
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 rounded-full"
          onClick={() => toast({ title: "Ask question (demo)", description: "Later this opens a form and stores a post." })}
        >
          Ask a question
        </Button>
      </header>

      {/* Tabs + AI banner */}
      <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tab id="all" label="All" />
          <Tab id="academics" label="Academics" />
          <Tab id="careers" label="Careers" />
          <Tab id="mine" label="My questions" />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-secondary/70 px-3 py-2 text-[0.7rem] text-secondary-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>
            AI can later summarise long threads for faculty and suggest first‑draft answers for students.
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="hover-scale border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-sm font-semibold">
                How do I balance DSA practice with semester labs?
              </CardTitle>
              <Badge variant="outline" className="border-border/70 bg-secondary text-[0.65rem]">
                Academics
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              I&apos;m in 3rd year CSE and feel like DSA prep and project labs are fighting for the same time. Any routines that
              worked for you?
            </p>
            <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" /> 4 answers
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full px-3 text-[0.7rem]"
                onClick={() =>
                  toast({
                    title: "AI summary (demo)",
                    description: "In the full app, AI would summarise all answers for quick review.",
                  })
                }
              >
                View AI summary
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-sm font-semibold">
                How to start preparing for off-campus placements from 2nd year?
              </CardTitle>
              <Badge variant="outline" className="border-accent/60 bg-accent/10 text-[0.65rem] text-accent-foreground">
                Careers
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              I want to prepare early but feel overwhelmed: DSA, development, projects, CGPA, networking – where to start?
            </p>
            <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" /> 23 upvotes
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full px-3 text-[0.7rem]"
                onClick={() =>
                  toast({
                    title: "Answer (demo)",
                    description: "Later this lets logged-in users post answers with optional AI draft assistance.",
                  })
                }
              >
                Add answer
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* AI assistant chat */}
      <section className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              AI assistant for quick guidance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <ScrollArea className="h-40 rounded-lg border border-border/60 bg-background/40 p-3 text-xs">
              {messages.length === 0 ? (
                <p className="text-muted-foreground">
                  Ask anything about academics, careers, or campus life. The assistant uses your OpenAI key via the backend
                  and is designed to be concise and student-friendly.
                </p>
              ) : (
                <div className="space-y-2">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        m.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-[0.7rem] leading-relaxed ${
                          m.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/80 text-secondary-foreground"
                        }`}
                      >
                        <span className="block text-[0.65rem] font-medium opacity-80">
                          {m.role === "user" ? "You" : "Assistant"}
                        </span>
                        <span>{m.content}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask a question like: How should I balance DSA with project work?"
                className="min-h-[72px] resize-none text-xs"
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.7rem] text-muted-foreground">
                  Responses are generated via a Lovable Cloud function using your OpenAI API key.
                </p>
                <Button
                  size="sm"
                  className="h-8 rounded-full px-3 text-[0.7rem]"
                  disabled={isSending || !input.trim()}
                  onClick={sendMessage}
                >
                  {isSending ? "Thinking..." : "Ask AI"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Filter className="h-4 w-4" />
              Filtering &amp; moderation concepts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p>
              In the full version, this list would support filters by tags, solved/unsolved, and most liked answers. Admins
              can hide or remove abusive questions.
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Tag‑based filters for subjects (DBMS, OS, CN, etc.).</li>
              <li>"Solved" status once a faculty or admin marks an accepted answer.</li>
              <li>Report button that sends posts to the admin dashboard.</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              How AI summarises Q&amp;A (for viva)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[0.7rem] text-muted-foreground">
            <p>
              You can explain this module as a combination of anonymous forums, moderation, and AI summarisation:
            </p>
            <ol className="list-decimal space-y-1 pl-4">
              <li>Store questions and answers in tables linked to user IDs.</li>
              <li>
                When a thread gets long, send the text to an AI model with instructions to highlight key points and next
                actions.
              </li>
              <li>Show the summary at the top so faculty can quickly see what students are struggling with.</li>
              <li>
                Optionally generate first‑draft answers that seniors or teachers can edit instead of writing from scratch.
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-2xl border border-border/70 bg-card/80 p-4 text-xs text-muted-foreground md:p-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <p className="font-medium text-foreground">How this strengthens your CSE project</p>
        </div>
        <p className="mt-2">
          This module combines anonymous forums, moderation workflows, and an AI assistant. Questions and answers are
          linked to user IDs in the backend while the UI shows pseudonyms to protect identity.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Demonstrates secure data design with anonymous-facing UI and protected identities.</li>
          <li>Showcases practical AI usage via a backend function connected to an LLM.</li>
          <li>Covers real campus use-cases: doubts collection, faculty insights, and student guidance.</li>
        </ul>
      </section>
    </main>
  );
};

export default QAPage;
