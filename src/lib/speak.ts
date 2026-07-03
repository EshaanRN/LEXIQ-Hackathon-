// Premium pronunciation: tries the Lovable AI Gateway (OpenAI tts-1-hd "nova")
// for a natural voice, falls back to the best browser SpeechSynthesis voice.

import { speakWord as speakWordFn } from "@/lib/tts.functions";

const audioCache = new Map<string, string>(); // key -> object URL
let currentAudio: HTMLAudioElement | null = null;
let aiDisabled = false; // flip if the gateway repeatedly fails

const PREFERRED = [
  /Google US English/i,
  /Microsoft Aria/i,
  /Microsoft Jenny/i,
  /Microsoft Guy/i,
  /Microsoft Davis/i,
  /Ava \(Premium\)/i,
  /Ava \(Enhanced\)/i,
  /Allison/i,
  /Samantha/i,
  /Karen/i,
  /Daniel/i,
];

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  for (const re of PREFERRED) {
    const v = voices.find((v) => re.test(v.name));
    if (v) return v;
  }
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  return en.find((v) => /natural|premium|enhanced|neural/i.test(v.name)) ?? en[0] ?? voices[0];
}

function browserSpeak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang || "en-US";
  } else {
    u.lang = "en-US";
  }
  u.rate = 0.95;
  u.pitch = 1.05;
  u.volume = 1;
  synth.speak(u);
}

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// A 1-frame silent WAV data URL used to unlock <audio> playback inside the
// user gesture on iOS Safari and Chrome mobile. Without this, calling
// .play() *after* an awaited fetch loses the gesture context and either
// fails silently or delays several seconds until the OS grants playback.
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

export function speak(text: string, opts: { style?: "word" | "sentence" } = {}) {
  if (typeof window === "undefined") return;
  const style = opts.style ?? "word";
  const key = `${style}::${text}`;

  stopCurrent();

  // Create + start the Audio element SYNCHRONOUSLY while we still have the
  // user-gesture context. Priming with a silent clip unlocks playback so we
  // can swap `src` to the real audio the moment the network call resolves —
  // no perceptible mobile delay, no "play was blocked" fallback.
  const a = new Audio();
  a.preload = "auto";
  a.src = SILENT_WAV;
  currentAudio = a;
  const primed = a.play().catch(() => {});
  // Also nudge speechSynthesis awake so the browser fallback is instant if
  // the AI call fails.
  try { window.speechSynthesis?.resume(); } catch { /* noop */ }

  const swap = (url: string) => {
    if (currentAudio !== a) return; // superseded by a newer speak() call
    const start = () => {
      a.src = url;
      a.play().catch(() => browserSpeak(text));
    };
    // Wait for the silent prime to actually start before switching src, so
    // the second play() inherits the unlocked state.
    primed.then(start, start);
  };

  const cached = audioCache.get(key);
  if (cached) {
    swap(cached);
    return;
  }

  if (aiDisabled) {
    browserSpeak(text);
    return;
  }

  speakWordFn({ data: { text, style } })
    .then((res) => {
      if (currentAudio !== a) return;
      if (res.fallback) {
        if (res.reason === "payment_required" || res.reason === "missing_key") {
          aiDisabled = true;
        }
        browserSpeak(text);
        return;
      }
      window.speechSynthesis?.cancel();
      const blob = b64ToBlob(res.base64, res.mime);
      const url = URL.createObjectURL(blob);
      audioCache.set(key, url);
      swap(url);
    })
    .catch((err) => {
      console.warn("AI TTS failed, falling back to browser voice", err);
      aiDisabled = true;
      browserSpeak(text);
    });
}

function b64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64);
  const len = bin.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
