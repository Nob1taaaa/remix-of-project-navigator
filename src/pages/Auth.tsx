import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, GraduationCap, Shield } from "lucide-react";
import logoImage from "@/assets/logo.png";

const RATE_LIMIT_MS = 3000; // 3 seconds between attempts
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60000; // 1 minute lockout after max attempts

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    if (now < lockedUntil) {
      const secsLeft = Math.ceil((lockedUntil - now) / 1000);
      toast({ title: "Too many attempts", description: `Please wait ${secsLeft}s before trying again.`, variant: "destructive" });
      return false;
    }
    if (now - lastAttempt < RATE_LIMIT_MS) {
      toast({ title: "Slow down", description: "Please wait a moment before trying again.", variant: "destructive" });
      return false;
    }
    const newCount = now - lastAttempt > LOCKOUT_MS ? 1 : attemptCount + 1;
    if (newCount > MAX_ATTEMPTS) {
      setLockedUntil(now + LOCKOUT_MS);
      setAttemptCount(0);
      toast({ title: "Too many attempts", description: "You've been temporarily locked out. Try again in 1 minute.", variant: "destructive" });
      return false;
    }
    setAttemptCount(newCount);
    setLastAttempt(now);
    return true;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkRateLimit()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
      toast({ title: "Account created!", description: "Check your email to confirm your account." });
      setEmail(""); setPassword(""); setFullName("");
    } catch (error: any) {
      toast({ title: "Error signing up", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Welcome back!", description: "You've successfully signed in." });
    } catch (error: any) {
      toast({ title: "Error signing in", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({ title: "Enter your email", description: "Type your email above, then click Forgot password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Reset link sent!", description: "Check your email for the password reset link." });
      setForgotMode(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/15 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-primary/5 blur-[80px]" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo & branding */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
            <img
              src={logoImage}
              alt="Campus Innovation"
              className="relative h-16 w-16 rounded-2xl bg-card/90 p-1.5 shadow-lg object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Campus{" "}
              <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                Innovation
              </span>
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Your smart campus companion — events, groups & AI assistant
            </p>
          </div>
        </div>

        <Card className="border-primary/15 bg-card/80 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-accent-foreground to-primary" />
          <CardHeader className="space-y-1 pb-4 pt-5">
            <CardTitle className="text-lg font-semibold text-center flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Welcome aboard
            </CardTitle>
            <CardDescription className="text-center text-xs">
              Sign in to access all campus features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-secondary/60 p-1">
                <TabsTrigger value="signin" className="rounded-lg text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email" className="text-xs">Email</Label>
                    <Input id="signin-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10 rounded-xl border-primary/20 bg-background/60 focus:border-primary/40" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password" className="text-xs">Password</Label>
                    <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-10 rounded-xl border-primary/20 bg-background/60 focus:border-primary/40" />
                  </div>
                  <Button type="submit" className="w-full h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[var(--shadow-glow)] hover:shadow-lg transition-shadow" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                  <button type="button" onClick={() => { setForgotMode(true); handleForgotPassword(); }} className="w-full text-center text-xs text-primary hover:underline mt-1">
                    Forgot password?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name" className="text-xs">Full Name</Label>
                    <Input id="signup-name" type="text" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="h-10 rounded-xl border-primary/20 bg-background/60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-xs">Email</Label>
                    <Input id="signup-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-10 rounded-xl border-primary/20 bg-background/60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-xs">Password</Label>
                    <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-10 rounded-xl border-primary/20 bg-background/60" />
                  </div>
                  <Button type="submit" className="w-full h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-[var(--shadow-glow)] hover:shadow-lg transition-shadow" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trust badges */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[0.65rem] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /> AI Powered</span>
          <span className="inline-flex items-center gap-1"><GraduationCap className="h-3 w-3 text-primary" /> Campus Ready</span>
          <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3 text-primary" /> Secure</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;
