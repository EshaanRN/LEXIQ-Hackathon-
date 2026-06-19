import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  text: z.string().min(1).max(400),
  // "word" voices are slower & more articulated; "sentence" is conversational.
  style: z.enum(["word", "sentence"]).default("word"),
});

/**
 * Premium TTS via the Lovable AI Gateway (OpenAI-compatible /audio/speech).
 * Returns base64 mp3 the client can play through an <audio> element.
 * Unauthenticated on purpose — pronunciation should work for guests too.
 * Throttled by short cache on the client side.
 */
export const speakWord = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        voice: "nova",
        input: data.text,
        response_format: "mp3",
        speed: data.style === "word" ? 0.92 : 1.0,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`TTS gateway failed: ${res.status} ${body.slice(0, 200)}`);
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    // Base64 encode
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const b64 = typeof btoa === "function" ? btoa(bin) : Buffer.from(buf).toString("base64");
    return { mime: "audio/mpeg", base64: b64 };
  });
