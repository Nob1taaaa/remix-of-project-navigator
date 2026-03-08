import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/PageHeader";

const QAPage = () => {
  const { toast } = useToast();
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
      setIsSending(false);
      return;
    }
    const reply = data?.assistantMessage?.trim();
    if (reply) setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setIsSending(false);
  };

  const quickQuestions = [
    "How do I balance DSA practice with semester labs?",
    "Best way to prepare for off-campus placements?",
    "How to start competitive programming?",
    "Tips for managing time during exam season?",
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 md:px-6 md:pt-8">
      <PageHeader
        icon="❓"
        title="Anonymous Q&A"
        subtitle="Ask anything about academics, careers, or campus life. The AI assistant gives concise, student-friendly answers."
      />

      {/* AI Chat — the main feature */}
      <Card className="border-primary/15 bg-card/80 backdrop-blur-sm shadow-md rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-primary/40" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            AI Campus Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-72 sm:h-80 rounded-xl border border-primary/10 bg-background/50 p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <div className="h-12 w-12 rounded-xl bg-primary/8 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary/40" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Ask me anything!</p>
                  <p className="text-xs mt-1 max-w-sm">I can help with academics, career guidance, campus life, study tips, and more.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-secondary/70 text-secondary-foreground rounded-bl-sm"
                      }`}
                    >
                      <span className="block text-[0.65rem] font-semibold opacity-60 mb-0.5">
                        {m.role === "user" ? "You" : "AI Assistant"}
                      </span>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-secondary/70 px-4 py-2.5 text-sm text-muted-foreground animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Quick questions */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
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
              placeholder="Type your question here..."
              className="min-h-[80px] resize-none text-sm rounded-xl border-primary/15"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Press Enter to send</p>
              <Button
                size="sm"
                className="h-9 rounded-full px-5 text-sm"
                disabled={isSending || !input.trim()}
                onClick={sendMessage}
              >
                {isSending ? "Thinking..." : "✨ Ask AI"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default QAPage;
