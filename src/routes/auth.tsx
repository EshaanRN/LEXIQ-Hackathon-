import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/", replace: true });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setErr(null);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) setErr(res.error.message ?? "Google sign-in failed");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 20 }}
          className="grid h-20 w-20 place-items-center rounded-3xl glow-primary"
          style={{ background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))" }}
        >
          <span className="font-display text-3xl font-black text-primary-foreground">SS</span>
        </motion.div>
        <h1 className="mt-5 font-display text-3xl font-bold text-white">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {mode === "signup"
            ? "Track your XP, build streaks, master SAT vocab."
            : "Pick up your streak where you left off."}
        </p>

        <button
          onClick={google}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-white py-3 font-display text-sm font-bold text-black transition hover:scale-[1.02]"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="my-5 flex w-full items-center gap-3 text-[10px] uppercase tracking-widest text-white/40">
          <span className="h-px flex-1 bg-white/15" /> or email <span className="h-px flex-1 bg-white/15" />
        </div>

        <form onSubmit={submit} className="w-full space-y-3 text-left">
          <input
            type="email"
            required
            placeholder="email@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="password (6+ chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none"
          />
          {err && <p className="text-xs text-danger">{err}</p>}
          <button
            disabled={loading}
            className="w-full rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-60"
          >
            {loading ? "..." : mode === "signup" ? "Sign Up" : "Log In"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="mt-6 text-xs text-white/60 underline-offset-4 hover:underline"
        >
          {mode === "signup" ? "Have an account? Log in" : "New here? Create account"}
        </button>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C33.8 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.4-.1-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C33.8 6.1 29.1 4 24 4c-7.5 0-14 4.2-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13.1-5l-6-5c-2 1.4-4.5 2.2-7.1 2.2-5.1 0-9.5-3.3-11.2-8L6.3 33C9.9 39.8 16.4 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5h-1.9V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6 5c4.2-3.8 6.7-9.5 6.7-16.2 0-1.3-.1-2.4-.1-3.5z" />
    </svg>
  );
}
