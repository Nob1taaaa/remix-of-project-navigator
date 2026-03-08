import { useState } from "react";
import { HelpCircle, MessageCircle, ThumbsUp, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";

const QAPage = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"all" | "academics" | "careers" | "mine">("all");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
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
    const { data, error } = await supabase.functions.invoke<{ assistantMessage: string }>("qa-assistant", { body: { messages: nextMessages } });
    if (error) {
      toast({ title: "AI assistant error", description: "Unable to get a response. Try again.", variant: "destructive" });
      setIsSending(false); return;
    }
    const reply = data?.assistantMessage?.trim();
    if (reply) setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setIsSending(false);
  };

  const Tab = ({ id, label }: { id: "all" | "academics" | "careers" | "mine"; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[0.7rem] font-medium transition-all ${
        tab === id
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-primary/8 text-muted-foreground hover:bg-primary/15 hover:text-foreground border border-primary/15"
      }`}
    >{label}</button>
  );

  return (
    <main className="mx-auto max-w-6xl px-3 pb-16 pt-5 sm:px-4 sm:pt-6 md:px-6 md:pt-8">
      <PageHeader icon="❓" title="Anonymous Q&A" subtitle="A safe space for students to ask anything about academics, careers, or campus life.">
        <Button size="sm" className="h-8 rounded-full text-xs px-4" onClick={() => toast({ title: "Ask question", description: "Use the AI assistant below or post to the community board." })}>
          Ask a question
        </Button>
      </PageHeader>

      {/* Tabs + AI banner */}
      <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-primary/12 bg-card/60 backdrop-blur-sm p-3 text-xs md:flex-row md:items-center md:justify-between md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tab id="all" label="All" />
          <Tab id="academics" label="📖 Academics" />
          <Tab id="careers" label="💼 Careers" />
          <Tab id="mine" label="My questions" />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/15 px-3 py-2 text-[0.7rem] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>AI summarises long threads &amp; suggests draft answers</span>
        </div>
      </section>

      {/* Sample Q&A cards */}
      <section className="grid gap-4 md:grid-cols-2">
        {[
          {
            q: "How do I balance DSA practice with semester labs?",
            desc: "I'm in 3rd year CSE and feel like DSA prep and project labs are fighting for the same time.",
            badge: "Academics", badgeColor: "bg-primary/8 border-primary/20 text-primary",
            stat: "4 answers", statIcon: MessageCircle,
          },
          {
            q: "How to start preparing for off-campus placements from 2nd year?",
            desc: "I want to prepare early but feel overwhelmed: DSA, development, projects, CGPA...",
            badge: "Careers", badgeColor: "bg-accent/15 border-accent-foreground/20 text-accent-foreground",
            stat: "23 upvotes", statIcon: ThumbsUp,
          },
        ].map((item, i) => (
          <Card key={i} className="hover-scale group border-primary/12 bg-card/70 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden transition-all hover:shadow-md hover:border-primary/25">
            <div className="h-1 bg-gradient-to-r from-primary/50 to-accent-foreground/30" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-sm font-bold leading-snug">{item.q}</CardTitle>
                <Badge variant="outline" className={`${item.badgeColor} text-[0.6rem] shrink-0`}>{item.badge}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground pt-1">
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  <item.statIcon className="h-3.5 w-3.5" /> {item.stat}
                </span>
                <Button size="sm" variant="outline" className="h-7 rounded-full px-3 text-[0.65rem] border-primary/15"
                  onClick={() => toast({ title: i === 0 ? "AI Summary" : "Add answer", description: i === 0 ? "AI would summarise all answers." : "Opens answer form with optional AI draft." })}>
                  {i === 0 ? "View AI summary" : "Add answer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* AI Assistant */}
      <section className="mt-8 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="border-primary/12 bg-card/70 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-accent-foreground/50" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-primary-foreground" />
              </div>
              AI Campus Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <ScrollArea className="h-44 rounded-xl border border-primary/10 bg-background/40 p-3 text-xs">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary/50" />
                  </div>
                  <p className="max-w-xs text-[0.72rem]">Ask anything about academics, careers, or campus life. The AI assistant is concise and student-friendly.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-[0.7rem] leading-relaxed ${
                        m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary/70 text-secondary-foreground rounded-bl-sm"
                      }`}>
                        <span className="block text-[0.6rem] font-semibold opacity-70 mb-0.5">{m.role === "user" ? "You" : "AI Assistant"}</span>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="space-y-2">
              <Textarea
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Ask: How should I balance DSA with project work?"
                className="min-h-[72px] resize-none text-xs rounded-xl border-primary/15"
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.65rem] text-muted-foreground">Powered by AI via Lovable Cloud</p>
                <Button size="sm" className="h-8 rounded-full px-4 text-[0.7rem]" disabled={isSending || !input.trim()} onClick={sendMessage}>
                  {isSending ? "Thinking..." : "✨ Ask AI"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/12 bg-card/70 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-accent-foreground/30 to-primary/30" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Filter className="h-4 w-4 text-primary" /> Filtering &amp; moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <p>In the full version, this supports:</p>
            <ul className="space-y-1.5 pl-1">
              {[
                "Tag-based filters for subjects (DBMS, OS, CN, etc.)",
                "\"Solved\" status when faculty marks accepted answer",
                "Report button for admin moderation dashboard",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* How AI works section */}
      <section className="mt-6 rounded-2xl border border-primary/12 bg-card/60 backdrop-blur-sm p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg bg-primary/8 flex items-center justify-center">
            <HelpCircle className="h-4 w-4 text-primary" />
          </div>
          <p className="font-bold text-sm text-foreground">How this strengthens your CSE project</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3 text-xs text-muted-foreground">
          {[
            { emoji: "🔒", title: "Secure Design", desc: "Anonymous-facing UI with protected user identities in the backend" },
            { emoji: "🤖", title: "AI Integration", desc: "Backend function connected to LLM for smart answers and summaries" },
            { emoji: "🎓", title: "Real Use Cases", desc: "Doubts collection, faculty insights, and student guidance at scale" },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-primary/10 bg-card/50 p-3 space-y-1.5">
              <p className="text-sm">{item.emoji}</p>
              <p className="font-semibold text-foreground text-[0.75rem]">{item.title}</p>
              <p className="text-[0.7rem] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default QAPage;
