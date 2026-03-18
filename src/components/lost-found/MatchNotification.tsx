import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchNotificationProps {
  matchCount: number;
  onView: () => void;
}

const MatchNotification = ({ matchCount, onView }: MatchNotificationProps) => {
  if (matchCount === 0) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-500 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 backdrop-blur-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">
            ✨ {matchCount} possible match{matchCount > 1 ? "es" : ""} found!
          </p>
          <p className="text-xs text-muted-foreground">AI detected similar items in the system</p>
        </div>
      </div>
      <Button type="button" size="sm" className="h-8 rounded-xl text-[0.7rem] bg-gradient-to-r from-primary to-primary/80" onClick={onView}>
        View Matches
      </Button>
    </div>
  );
};

export default MatchNotification;
