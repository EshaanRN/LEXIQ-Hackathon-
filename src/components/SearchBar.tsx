import { useMemo, useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { VOCAB, type VocabWord } from "@/data/vocab";

interface Props {
  onSelect: (word: VocabWord) => void;
}

export function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const starts: VocabWord[] = [];
    const includes: VocabWord[] = [];
    for (const w of VOCAB) {
      const lw = w.word.toLowerCase();
      if (lw.startsWith(q)) starts.push(w);
      else if (lw.includes(q)) includes.push(w);
      if (starts.length >= 8) break;
    }
    return [...starts, ...includes].slice(0, 8);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(w: VocabWord) {
    onSelect(w);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative mx-5 mt-2">
      <div className="flex items-center gap-2 rounded-full bg-surface-2 px-3 py-2 ring-1 ring-border focus-within:ring-primary/50">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search any word…"
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          aria-label="Search vocabulary words"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border bg-card p-1 shadow-xl">
          {results.map((w) => (
            <button
              key={w.id}
              onClick={() => pick(w)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-surface-2"
            >
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-foreground">{w.word}</p>
                <p className="truncate text-xs text-muted-foreground">{w.studentDefinition}</p>
              </div>
              <span className="ml-2 shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {w.partOfSpeech}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && query && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-border bg-card p-4 text-center text-sm text-muted-foreground shadow-xl">
          No words match "{query}"
        </div>
      )}
    </div>
  );
}
