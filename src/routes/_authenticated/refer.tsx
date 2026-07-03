import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Crown, Gift, Share2, Copy, Check, Sparkles } from "lucide-react";
import { getMyReferral, claimReferral } from "@/lib/referral.functions";

export const Route = createFileRoute("/_authenticated/refer")({
  ssr: false,
  component: ReferPage,
});

function ReferPage() {
  const fetchRef = useServerFn(getMyReferral);
  const submitClaim = useServerFn(claimReferral);
  const [code, setCode] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [monthGranted, setMonthGranted] = useState(false);
  const [yearGranted, setYearGranted] = useState(false);
  const [referredByCode, setReferredByCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [claimInput, setClaimInput] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const lastSnapRef = useRef<{ count: number; m: boolean; y: boolean } | null>(null);

  async function load() {
    try {
      const r = await fetchRef();
      const prev = lastSnapRef.current;
      setCode(r.code);
      setCount(r.count);
      setMonthGranted(r.monthGranted);
      setYearGranted(r.yearGranted);
      // Detect newly-granted rewards and notify
      if (prev) {
        if (!prev.y && r.yearGranted) fireReward("🎉 You just unlocked 1 YEAR of Lexiq Premium — free!");
        else if (!prev.m && r.monthGranted) fireReward("🎉 You just unlocked 1 MONTH of Lexiq Premium — free!");
        else if (r.count > prev.count) setToast(`Nice — ${r.count - prev.count} new sign-up${r.count - prev.count > 1 ? "s" : ""}!`);
      }
      lastSnapRef.current = { count: r.count, m: r.monthGranted, y: r.yearGranted };
    } catch {/* noop */}
  }

  function fireReward(msg: string) {
    setToast(msg);
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Lexiq Premium unlocked!", { body: msg, icon: "/favicon.ico" });
      }
    } catch {/* noop */}
  }

  useEffect(() => {
    load();
    // Ask once for notification permission so future grants can ping
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    } catch {/* noop */}
    // Poll every 30s while on this page, and refresh on focus
    const id = setInterval(load, 30000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://learnlexiq.com";
  const shareUrl = code ? `${origin}/?ref=${code}` : "";
  const monthGoal = 5;
  const yearGoal = 15;
  const target = count < monthGoal ? monthGoal : yearGoal;
  const pct = Math.min(100, Math.round((count / target) * 100));

  async function copy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {/* noop */}
  }
  async function share() {
    if (!shareUrl) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: "Try Lexiq — vocab that actually sticks",
          text: "I'm prepping for the SAT/ACT on Lexiq. Use my link to sign up — 5 friends = 1 free month of Premium, 15 = a full year!",
          url: shareUrl,
        });
        return;
      } catch {/* user cancelled */}
    }
    await copy();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <Link to="/avatar" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl font-bold">Get Free Premium</h1>
      </div>

      {/* Hero */}
      <div className="mt-5 overflow-hidden rounded-3xl p-5 ring-1 ring-gold/30"
        style={{ background: "linear-gradient(135deg, hsl(45 90% 55% / 0.15) 0%, hsl(280 50% 40% / 0.18) 100%)" }}>
        <div className="flex items-center gap-2 text-gold">
          <Crown className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Referral Rewards</span>
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight">
          Invite friends. Earn free Premium.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No credit card. No catch. Every friend who creates an account brings you closer.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-background/50 p-3 ring-1 ring-border">
            <p className="font-display text-2xl font-bold text-foreground">5</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">friends = 1 month free</p>
          </div>
          <div className="rounded-2xl bg-background/50 p-3 ring-1 ring-border">
            <p className="font-display text-2xl font-bold text-foreground">15</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">friends = 1 year free</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      {code && (
        <div className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-border">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">{count} / {target} sign-ups</span>
            <span className="text-muted-foreground">Code: <span className="font-mono text-foreground">{code}</span></span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full bg-gradient-to-r from-primary via-accent to-gold transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-center text-[10px] font-bold uppercase tracking-widest">
            <span className={count >= monthGoal ? "text-success" : "text-muted-foreground"}>
              {count >= monthGoal ? "✓ Month unlocked" : `${monthGoal - count} to a free month`}
            </span>
            <span className={count >= yearGoal ? "text-success" : "text-muted-foreground"}>
              {count >= yearGoal ? "✓ Year unlocked" : `${yearGoal - count} to a free year`}
            </span>
          </div>

          {(monthGranted || yearGranted) && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-gold/10 p-2.5 text-xs ring-1 ring-gold/40">
              <Crown className="h-4 w-4 text-gold" />
              <span className="font-semibold">
                {yearGranted ? "1 year of Premium unlocked — enjoy!" : "1 month of Premium unlocked!"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Share */}
      <div className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-border">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" />
          <p className="font-display text-sm font-bold uppercase tracking-widest">Your invite link</p>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-surface-2 p-2 ring-1 ring-border">
          <code className="flex-1 truncate px-2 font-mono text-sm">{shareUrl || "Loading…"}</code>
          <button onClick={copy} aria-label="Copy link" className="grid h-8 w-8 place-items-center rounded-full bg-surface-3 ring-1 ring-border hover:bg-surface-2">
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <button
          onClick={share}
          disabled={!code}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" /> Share with friends
        </button>
      </div>

      {/* How it works */}
      <div className="mt-4 rounded-3xl bg-card p-4 ring-1 ring-border">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-accent" />
          <p className="font-display text-sm font-bold uppercase tracking-widest">How it works</p>
        </div>
        <ol className="mt-3 space-y-3 text-sm">
          <Step n={1} title="Share your link" body="Drop it in your group chat, IG story, or text it to a friend." />
          <Step n={2} title="They sign up" body="Your link auto-applies your code when they create an account." />
          <Step n={3} title="You earn Premium" body="5 sign-ups = 1 free month. 15 sign-ups = 1 free year — applied instantly." />
          <Step n={4} title="We'll notify you" body="The app pings you the moment your reward unlocks." />
        </ol>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Fair-use: only real accounts count. Duplicate or fraudulent sign-ups don't qualify.
        </p>
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[92%] animate-in fade-in slide-in-from-bottom-4 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-bold text-primary-foreground shadow-2xl ring-1 ring-white/20">
          <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" />{toast}</span>
        </div>
      )}
    </main>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary ring-1 ring-primary/30">
        {n}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
    </li>
  );
}
