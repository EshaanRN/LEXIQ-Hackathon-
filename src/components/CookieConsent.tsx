import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "lexiq:cookie-consent";
const OPEN_EVENT = "lexiq:open-cookie-settings";

export type ConsentValue = {
  necessary: true;
  analytics: boolean;
  ads: boolean;
  at: string;
};

export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentValue;
    if (typeof parsed?.analytics !== "boolean") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasAdConsent() {
  return readConsent()?.ads === true;
}

/** Reopen the preferences panel from anywhere (e.g. footer link). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** Global Privacy Control / Do Not Track — treat as a refusal of optional cookies. */
function signalsOptOut() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string };
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
}

const ADSENSE_CLIENT = "ca-pub-2551071845015039";

function loadAdScript() {
  if (document.getElementById("adsense-script")) return;
  const s = document.createElement("script");
  s.id = "adsense-script";
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(s);
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      if (existing.ads) loadAdScript();
      setAnalytics(existing.analytics);
      setAds(existing.ads);
      return;
    }
    if (signalsOptOut()) {
      save(false, false);
      return;
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    const onOpen = () => {
      const existing = readConsent();
      setAnalytics(existing?.analytics ?? false);
      setAds(existing?.ads ?? false);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  function save(nextAnalytics: boolean, nextAds: boolean) {
    const value: ConsentValue = {
      necessary: true,
      analytics: nextAnalytics,
      ads: nextAds,
      at: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* storage unavailable — stay opted out for this session */
    }
    if (nextAds) loadAdScript();
    setOpen(false);
    setDetails(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur">
        <h2 id="cookie-consent-title" className="font-display text-sm font-bold text-foreground">
          Cookies on Lexiq
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          We use cookies that are strictly necessary to sign you in and save your progress. With your
          permission we'd also use optional cookies for analytics and advertising. Read our{" "}
          <Link to="/cookies" className="underline hover:text-foreground">
            Cookie Policy
          </Link>
          .
        </p>

        {details && (
          <div className="mt-3 space-y-2">
            <Row label="Strictly necessary" description="Sign-in, security, saving your progress." locked />
            <Row
              label="Analytics"
              description="Aggregated, de-identified usage stats so we can improve lessons."
              checked={analytics}
              onChange={setAnalytics}
            />
            <Row
              label="Advertising"
              description="Ads on the free tier may set their own cookies. Premium never shows ads."
              checked={ads}
              onChange={setAds}
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => save(true, true)}
            className="rounded-full bg-primary px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Accept all
          </button>
          <button
            onClick={() => save(false, false)}
            className="rounded-full border border-border px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-foreground transition hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Reject optional
          </button>
          {details ? (
            <button
              onClick={() => save(analytics, ads)}
              className="rounded-full border border-border px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-foreground transition hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Save choices
            </button>
          ) : (
            <button
              onClick={() => setDetails(true)}
              className="rounded-full px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Manage
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  description,
  checked,
  onChange,
  locked,
}: {
  label: string;
  description: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3">
      <input
        type="checkbox"
        checked={locked ? true : !!checked}
        disabled={locked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        aria-label={label}
      />
      <span>
        <span className="block text-xs font-semibold text-foreground">
          {label}
          {locked && <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">Always on</span>}
        </span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}
