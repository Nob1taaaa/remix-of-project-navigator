import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, MapPin, Clock, Loader2, MessageCircle, Calendar } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  metadata: any;
  created_at: string;
}

interface PrivateChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  userId: string;
  postTitle: string;
  onItemReturned: () => void;
}

const PrivateChat = ({ open, onOpenChange, chatId, userId, postTitle, onItemReturned }: PrivateChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showMeetup, setShowMeetup] = useState(false);
  const [meetupLocation, setMeetupLocation] = useState("");
  const [meetupTime, setMeetupTime] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !chatId) return;
    loadMessages();

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "lost_found_messages", filter: `chat_id=eq.${chatId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [open, chatId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await supabase.from("lost_found_messages").select("*").eq("chat_id", chatId).order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  const sendMessage = async (content: string, type = "text", metadata: any = null) => {
    if (!content.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.from("lost_found_messages").insert({
        chat_id: chatId,
        sender_id: userId,
        content: content.trim(),
        message_type: type,
        metadata,
      });
      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSending(false);
    }
  };

  const handleSendMeetup = async () => {
    if (!meetupLocation.trim() || !meetupTime) {
      toast({ variant: "destructive", title: "Missing info", description: "Please set both location and time." });
      return;
    }
    try {
      const { error } = await supabase.from("lost_found_meetups").insert({
        chat_id: chatId,
        suggested_by: userId,
        location: meetupLocation.trim(),
        meet_time: new Date(meetupTime).toISOString(),
      });
      if (error) throw error;
      await sendMessage(`📍 Meetup suggested!\nLocation: ${meetupLocation}\nTime: ${new Date(meetupTime).toLocaleString()}`, "meetup");
      setShowMeetup(false);
      setMeetupLocation("");
      setMeetupTime("");
      toast({ title: "📍 Meetup suggested!", description: "Waiting for the other student to confirm." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleItemReturned = async () => {
    await sendMessage("✅ I confirm the item has been returned! 🎉", "return_confirmation");
    onItemReturned();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col rounded-3xl border-primary/15 bg-card/95 backdrop-blur-xl p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-primary/10">
          <DialogTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            Private Chat — {postTitle}
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[200px] max-h-[400px]">
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">No messages yet. Say hi! 👋</p>
          )}
          {messages.map((msg) => {
            const isOwn = msg.sender_id === userId;
            const isMeetup = msg.message_type === "meetup";
            const isReturn = msg.message_type === "return_confirmation";
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                  isReturn
                    ? "bg-gradient-to-r from-primary/20 to-accent/30 border border-primary/20 text-foreground"
                    : isMeetup
                    ? "bg-accent/20 border border-accent-foreground/15 text-foreground"
                    : isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/40 border border-primary/10 text-foreground"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[0.6rem] mt-1 ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Meetup form */}
        {showMeetup && (
          <div className="mx-4 mb-2 rounded-2xl bg-accent/10 border border-accent-foreground/12 p-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" /> Suggest Meetup</p>
            <div className="space-y-1.5">
              <Label className="text-[0.7rem]">Campus Location</Label>
              <Input value={meetupLocation} onChange={(e) => setMeetupLocation(e.target.value)} placeholder="e.g. Library entrance" className="h-8 text-xs rounded-xl border-primary/15" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[0.7rem]">Date & Time</Label>
              <Input type="datetime-local" value={meetupTime} onChange={(e) => setMeetupTime(e.target.value)} className="h-8 text-xs rounded-xl border-primary/15" />
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" className="flex-1 h-8 text-[0.7rem] rounded-xl" onClick={() => setShowMeetup(false)}>Cancel</Button>
              <Button type="button" size="sm" className="flex-1 h-8 text-[0.7rem] rounded-xl bg-gradient-to-r from-primary to-primary/80" onClick={handleSendMeetup}>Send</Button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-primary/10 px-4 py-3 flex gap-2">
          <div className="flex gap-1.5">
            <Button type="button" size="sm" variant="outline" className="h-9 rounded-xl text-[0.7rem] px-2.5" onClick={() => setShowMeetup(!showMeetup)} title="Suggest Meetup">
              <MapPin className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-9 rounded-xl text-[0.7rem] px-2.5 text-primary border-primary/20 hover:bg-primary/10" onClick={handleItemReturned} title="Mark as Returned">
              ✅
            </Button>
          </div>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-9 text-xs rounded-xl border-primary/15"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(newMessage); } }}
          />
          <Button type="button" size="sm" className="h-9 w-9 rounded-xl bg-gradient-to-r from-primary to-primary/80 p-0" onClick={() => sendMessage(newMessage)} disabled={sending || !newMessage.trim()}>
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivateChat;
