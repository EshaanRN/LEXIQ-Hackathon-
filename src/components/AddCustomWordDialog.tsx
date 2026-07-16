import { useState } from "react";
import { X, Sparkles, Loader2, Plus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateCustomWord } from "@/lib/custom-vocab.functions";
import { addCustomWord } from "@/lib/custom-vocab";
import type { VocabWord } from "@/data/vocab";

interface Props {
  open: boolean;
  initialWord?: string;
  onClose: () => void;
  onAdded?: (w: VocabWord) => void;
}

type Draft = {
  word: string;
  partOfSpeech: string;
  difficulty: "easy" | "medium" | "hard";
  definition: string;
  studentDefinition: string;
  satContext: string;
  root: string;
  rootMeaning: string;
  example: string;
  synonyms: string[];
};

export function AddCustomWordDialog({ open, initialWord = "", onClose, onAdded }: Props) {
  const gen = useServerFn(generateCustomWord);
  const [word, setWord] = useState(initialWord);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  if (!open) return null;

  async function generate() {
    const w = word.trim();
    if (!w) return;
    setBusy(true); setError(null); setDraft(null);
    try {
      const out = await gen({ data: { word: w } });
      setDraft({
        word: out.word,
        partOfSpeech: out.partOfSpeech,
        difficulty: out.difficulty,
        definition: out.definition,
        studentDefinition: out.studentDefinition,
        satContext: out.satContext,
        root: out.root,
        rootMeaning: out.rootMeaning,
        example: out.example,
        synonyms: out.synonyms,
      });
    } catch (e) {
      console.error(e);
      setError("Couldn't generate. Try a different spelling.");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!draft) return;
    const entry = addCustomWord(draft);
    onAdded?.(entry);
    reset();
    onClose();
  }

  function reset() {
    setWord(""); setDraft(null); setError(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Add your own word</h2>
              <p className="text-[11px] text-muted-foreground">AI writes the definition, root, synonyms & example.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 ring-1 ring-border">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!draft && (
          <div className="space-y-3">
            <input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g. perspicacious"
              autoFocus
              className="w-full rounded-2xl bg-surface-2 px-4 py-3 text-sm text-foreground outline-none ring-1 ring-border focus:ring-primary/50"
              onKeyDown={(e) => { if (e.key === "Enter") generate(); }}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              onClick={generate}
              disabled={busy || !word.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-primary disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {busy ? "Generating…" : "Generate with AI"}
            </button>
          </div>
        )}

        {draft && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-surface-2 p-4 ring-1 ring-border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{draft.partOfSpeech} · {draft.difficulty}</p>
              <h3 className="font-display text-2xl font-bold text-gradient-primary">{draft.word}</h3>
              <p className="mt-2 text-sm">{draft.studentDefinition}</p>
              <p className="mt-2 text-xs text-muted-foreground">{draft.definition}</p>
              <p className="mt-3 text-[10px] uppercase tracking-widest text-primary">Synonyms</p>
              <p className="text-sm">{draft.synonyms.join(", ")}</p>
              <p className="mt-3 text-[10px] uppercase tracking-widest text-primary">Root</p>
              <p className="text-sm">{draft.rootMeaning}</p>
              <p className="mt-3 text-[10px] uppercase tracking-widest text-primary">Example</p>
              <p className="text-sm italic">"{draft.example}"</p>
              <p className="mt-3 text-[10px] uppercase tracking-widest text-primary">SAT-style</p>
              <p className="text-sm italic">"{draft.satContext}"</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDraft(null)}
                className="flex-1 rounded-full bg-surface-2 py-3 font-display text-xs font-bold uppercase tracking-widest ring-1 ring-border"
              >
                Retry
              </button>
              <button
                onClick={save}
                className="flex-1 rounded-full bg-primary py-3 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground glow-primary"
              >
                Add to my words
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
