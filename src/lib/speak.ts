// Shared text-to-speech helper. Picks the most natural-sounding English voice
// available in the user's browser and caches the choice for snappy playback.

let cached: SpeechSynthesisVoice | null = null;
let warmed = false;

// Voices that tend to sound the most natural across platforms. Order matters —
// first match wins. These cover modern Chrome/Edge (Google/Microsoft Neural),
// Safari/iOS (Samantha, Ava, Allison), and Android (en-us-x-tpf-network).
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
  /en-us-x-tpf-network/i,
];

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  for (const re of PREFERRED) {
    const v = voices.find((v) => re.test(v.name));
    if (v) return v;
  }
  // Fall back to any English voice, preferring non-default (often higher quality).
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  return en.find((v) => /natural|premium|enhanced|neural/i.test(v.name)) ?? en[0] ?? voices[0];
}

function warm() {
  if (warmed || typeof window === "undefined" || !window.speechSynthesis) return;
  warmed = true;
  // Some browsers populate voices asynchronously.
  const handler = () => {
    cached = pickVoice();
  };
  cached = pickVoice();
  window.speechSynthesis.onvoiceschanged = handler;
}

export function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  warm();
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = cached ?? pickVoice();
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang || "en-US";
  } else {
    u.lang = "en-US";
  }
  // Slightly slower, slightly warmer than defaults — sounds less robotic.
  u.rate = 0.95;
  u.pitch = 1.05;
  u.volume = 1;
  synth.speak(u);
}
