import { useEffect, useState } from "react";
import { Share2, Copy, Check, Gift, Crown } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getMyReferral } from "@/lib/referral.functions";

export function ReferralCard() {
  const fetchRef = useServerFn(getMyReferral);
  const [code, setCode] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [monthGranted, setMonthGranted] = useState(false);
  const [yearGranted, setYearGranted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchRef()
      .then((r) => {
        setCode(r.code);
        setCount(r.count);
        setMonthGranted(r.monthGranted);
        setYearGranted(r.yearGranted);
      })
      .catch(() => {});
  }, [fetchRef]);

  if (!code) return null;
  const origin = typeof window !== "undefined" ? window.location.origin : "https://learnlexiq.com";
  const shareUrl = `${origin}/?ref=${code}`;
  const monthGoal = 5;
  const yearGoal = 15;
  const target = count < monthGoal ? monthGoal : yearGoal;
  const pct = Math.min(100, Math.round((count / target) * 100));

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {/* noop */}
  }
  async function share() {
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
    <div className="rounded-3xl bg-card p-4 ring-1 ring-border">
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-primary" />
        <p className="font-display text-sm font-bold uppercase tracking-widest">Earn free Premium</p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Share Lexiq with at least <span className="font-bold text-foreground">5 friends</span> using your code.
        When they create accounts: <span className="font-bold text-foreground">10 sign-ups = 1 month</span> Premium ·
        <span className="font-bold text-foreground"> 20 = 1 year</span>. Free, no card needed.
      </p>

      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-surface-2 p-2 ring-1 ring-border">
        <code className="flex-1 truncate px-2 font-mono text-sm">{shareUrl}</code>
        <button onClick={copy} aria-label="Copy link" className="grid h-8 w-8 place-items-center rounded-full bg-surface-3 ring-1 ring-border hover:bg-surface-2">
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </button>
        <button onClick={share} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground">
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>{count} / {target} sign-ups</span>
          <span>Your code: <span className="font-mono text-foreground">{code}</span></span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px] font-bold uppercase tracking-widest">
          <span className={count >= starterGoal ? "text-success" : "text-muted-foreground"}>5 invited</span>
          <span className={count >= monthGoal ? "text-success" : "text-muted-foreground"}>10 = month</span>
          <span className={count >= yearGoal ? "text-success" : "text-muted-foreground"}>20 = year</span>
        </div>
      </div>

      {(monthGranted || yearGranted) && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-gold/10 p-2 text-xs ring-1 ring-gold/40">
          <Crown className="h-4 w-4 text-gold" />
          <span>
            {yearGranted ? "1 year of Premium unlocked — enjoy!" : "1 month of Premium unlocked!"}
          </span>
        </div>
      )}
    </div>
  );
}
