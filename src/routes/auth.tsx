import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { LoadingScreen } from "@/components/LoadingScreen";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

function friendlyError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Email or password is incorrect.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "An account with this email already exists. Try logging in.";
  if (m.includes("rate")) return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("network") || m.includes("fetch")) return "Network error. Check your connection.";
  return message;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) navigate({ to: "/", replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const emailParsed = emailSchema.safeParse(email);
    if (!emailParsed.success) {
      setErr(emailParsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    const pwParsed = passwordSchema.safeParse(password);
    if (!pwParsed.success) {
      setErr(pwParsed.error.issues[0]?.message ?? "Invalid password");
      return;
    }
    if (mode === "signup" && !accepted) {
      setErr("Please accept the Terms and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: emailParsed.data,
          password: pwParsed.data,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        // Supabase returns a user with empty identities array when the email is already registered.
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          throw new Error("An account with this email already exists. Try logging in instead.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailParsed.data,
          password: pwParsed.data,
        });
        if (error) throw error;
      }
      setHandoff(true);
      try {
        sessionStorage.setItem("lexiq:splash-shown", "1");
      } catch {}
      navigate({ to: "/", replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setErr(friendlyError(msg));
      setLoading(false);
    }
  }

  async function google() {
    setErr(null);
    if (mode === "signup" && !accepted) {
      setErr("Please accept the Terms and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (res.error) {
        setErr(friendlyError(res.error.message ?? "Google sign-in failed"));
        setLoading(false);
        return;
      }
      if (res.redirected) return; // browser is navigating away
      // Tokens received & session set — navigate to home which routes by onboarding state.
      setHandoff(true);
      try {
        sessionStorage.setItem("lexiq:splash-shown", "1");
      } catch {}
      navigate({ to: "/", replace: true });
    } catch (e: unknown) {
      setErr(friendlyError(e instanceof Error ? e.message : "Google sign-in failed"));
      setLoading(false);
    }
  }

  if (handoff) return <LoadingScreen message="Signing you in…" />;

  return (
    <main className="min-h-screen bg-black px-6 py-10">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 20 }}
          className="grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white/[0.04]"
        >
          <span className="font-display text-2xl font-black text-white">Lx</span>
        </motion.div>
        <h1 className="mt-5 font-display text-3xl font-bold text-white">
          {mode === "signup" ? "Create your Lexiq account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {mode === "signup"
            ? "Track XP, build streaks, master SAT & ACT vocab."
            : "Pick up your streak where you left off."}
        </p>

        <button
          onClick={google}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-white py-3 font-display text-sm font-bold text-black transition hover:scale-[1.01] disabled:opacity-60"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="my-5 flex w-full items-center gap-3 text-[10px] uppercase tracking-widest text-white/40">
          <span className="h-px flex-1 bg-white/15" /> or email <span className="h-px flex-1 bg-white/15" />
        </div>

        <form onSubmit={submit} className="w-full space-y-3 text-left" noValidate>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="Password (8+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/60 focus:outline-none"
          />

          {mode === "signup" && (
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-white"
              />
              <span>
                I accept the{" "}
                <Link to="/terms" className="font-semibold text-white underline underline-offset-2">
                  Terms and Privacy Policy
                </Link>
                .
              </span>
            </label>
          )}

          {err && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white py-3 font-display text-sm font-bold uppercase tracking-widest text-black transition hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "signup" ? "Create Account" : "Log In"}
          </button>
        </form>

        <button
          onClick={() => {
            setErr(null);
            setMode(mode === "signup" ? "login" : "signup");
          }}
          className="mt-6 text-xs text-white/60 underline-offset-4 hover:text-white hover:underline"
        >
          {mode === "signup" ? "Have an account? Log in" : "New here? Create account"}
        </button>

        <p className="mt-8 text-[10px] uppercase tracking-widest text-white/30">
          Secured by Lexiq · End-to-end encrypted sessions
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.7 4.7-6.2 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C33.8 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.4-.1-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C33.8 6.1 29.1 4 24 4c-7.5 0-14 4.2-17.7 10.7z" />
      <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13.1-5l-6-5c-2 1.4-4.5 2.2-7.1 2.2-5.1 0-9.5-3.3-11.2-8L6.3 33C9.9 39.8 16.4 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5h-1.9V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6 5c4.2-3.8 6.7-9.5 6.7-16.2 0-1.3-.1-2.4-.1-3.5z" />
    </svg>
  );
}
