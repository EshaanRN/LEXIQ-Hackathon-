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

export function speak(text: string, opts: { style?: "word" | "sentence" } = {}) {
  if (typeof window === "undefined") return;
  const style = opts.style ?? "word";
  const key = `${style}::${text}`;

  stopCurrent();

  // Cached AI audio → play instantly.
  const cached = audioCache.get(key);
  if (cached) {
    const a = new Audio(cached);
    currentAudio = a;
    a.play().catch(() => browserSpeak(text));
    return;
  }

  if (aiDisabled) {
    browserSpeak(text);
    return;
  }

  // Kick off browser TTS immediately as a safety net while AI fetches,
  // then cancel it the instant the AI clip is ready.
  let cancelledBrowser = false;
  const safety = window.setTimeout(() => {
    if (!cancelledBrowser) browserSpeak(text);
  }, 250);

  speakWordFn({ data: { text, style } })
    .then((res) => {
      cancelledBrowser = true;
      window.clearTimeout(safety);
      window.speechSynthesis?.cancel();
      const blob = b64ToBlob(res.base64, res.mime);
      const url = URL.createObjectURL(blob);
      audioCache.set(key, url);
      const a = new Audio(url);
      currentAudio = a;
      a.play().catch(() => browserSpeak(text));
    })
    .catch((err) => {
      console.warn("AI TTS failed, falling back to browser voice", err);
      aiDisabled = true;
      window.clearTimeout(safety);
      if (!cancelledBrowser) browserSpeak(text);
    });
}

function b64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64);
  const len = bin.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
