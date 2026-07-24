# Multi-Exam Vocab + Custom Decks

Scope you approved: full infrastructure + ~150 curated words per new exam (GRE, LSAT, MCAT, TOEFL, IELTS) + custom decks with manual, paste, CSV, and document upload.

This is 3 stages. I'll pause between stages so you can test before I burn the next batch of AI credits.

## Stage 1 — Data model + exam switcher (no AI cost)

**Types (`src/data/vocab.ts`)**
- Expand `ExamType` to `"sat" | "act" | "gre" | "lsat" | "mcat" | "toefl" | "ielts" | "both"`.
- Add optional `examVariants?: Partial<Record<ExamType, { definition; studentDefinition; example; satContext }>>` so one word (e.g. "inhibit") can have an MCAT-flavored card AND a general one — the swipe screen picks the variant matching the active exam.
- Split source data: keep `vocab.ts` for SAT/ACT; add `vocab-gre.ts`, `vocab-lsat.ts`, `vocab-mcat.ts`, `vocab-toefl.ts`, `vocab-ielts.ts` (empty arrays initially, filled in Stage 2). Aggregator `vocab-all.ts` merges.

**Filtering (`game-store.ts`)**
- Filter deck by active exam. `both` = union of all seeded exams.
- Bump `exam` column defaults; no DB migration needed (already `text`).

**UI**
- `StudyModeSelector`: replace 3-way toggle with a horizontal scrollable pill row (SAT / ACT / GRE / LSAT / MCAT / TOEFL / IELTS / Mixed). Each pill shows word count for that exam.
- Onboarding exam picker (`onboarding.tsx`): same list with a short description per exam.
- `SwipeCard`: badge shows active exam variant name (e.g. "MCAT context").

## Stage 2 — AI-seed each exam (~150 words) — costs credits

For each of GRE/LSAT/MCAT/TOEFL/IELTS I run a batched generation via `generateObject` on `google/gemini-3.5-flash` with an exam-specific system prompt:

- **GRE** — advanced academic vocab (nuance/tone words like "equivocate", "sanguine", "punctilious"). ~150 words.
- **LSAT** — legal/logical reasoning terminology ("jurisprudence", "obiter dictum", "ad hominem", "necessary condition", "sufficient condition"). ~150 words.
- **MCAT** — high-yield medical/scientific terms across bio/biochem/chem/psych ("allosteric", "endocytosis", "aliphatic", "operant conditioning"). Definitions written in scientific register, not general English. ~150 words.
- **TOEFL** — academic English for lectures/passages ("hypothesis", "phenomenon", "correlate"). ~150 words.
- **IELTS** — Band 7–9 Task 2 vocab, formal alternatives, collocations ("furthermore", "detrimental", "significantly"). ~150 words.

Each entry has the full `VocabWord` shape plus exam-specific example/context. I run all 5 batches in parallel from a one-shot server script (`scripts/seed-exam-vocab.ts` executed via node inside sandbox — writes JSON into `src/data/vocab-<exam>.ts`). Nothing user-facing changes at seed time; it's a build-time asset.

Estimated cost: ~5 batched calls × ~30k output tokens each on gemini-3.5-flash. Cheap relative to previous batch rewrites.

## Stage 3 — Custom Decks

**Schema (Cloud migration)**
```
custom_decks (id uuid pk, user_id uuid, name text, subject text, created_at)
custom_deck_words (id uuid pk, deck_id uuid fk, word text, part_of_speech,
  difficulty, definition, student_definition, example, synonyms text[], created_at)
```
Grants + RLS scoped to `auth.uid()`. `subject` (e.g. "MCAT bio", "AP Bio unit 3") drives AI context.

**Server functions (`src/lib/decks.functions.ts`)**
- `createDeck({ name, subject })`
- `listDecks()` / `getDeck(id)` / `deleteDeck(id)`
- `addWordsToDeck({ deckId, words[] })` — for each word, AI-generates the card fields with the deck's `subject` in the system prompt so "inhibit" in an MCAT deck returns the enzyme sense.
- `importDeckFromText({ deckId, text })` — splits by comma/newline, dedupes, then calls the same generator.
- `importDeckFromCsv({ deckId, csv })` — parses CSV (papaparse-style, no dep — 60 lines of code). Columns: `word` required; optional `definition`, `example` skip AI enrichment for that field.
- `importDeckFromDocument({ deckId, filename, base64, mime })` — server-side: send file as a `file` content block to `google/gemini-3.6-flash` with instruction "extract vocabulary terms a student should learn from these notes", then feed the extracted list back through the enrichment path.

**UI (`src/routes/_authenticated/decks.*.tsx`)**
- `decks.index.tsx` — list user's decks + "Create deck".
- `decks.$deckId.tsx` — deck detail: word list, "Add words" panel with 4 tabs (Manual / Paste / CSV / Document).
- Manual tab reuses existing `AddCustomWordDialog` pattern.
- Paste tab: textarea + "Enrich all" button.
- CSV tab: file input, previews parsed rows, then imports.
- Document tab: file input (PDF/DOCX/TXT), uploads to server fn.
- Studying a custom deck: BottomNav gets a "Decks" entry, opening a deck sets an in-memory active-deck filter (`useGame` gains `activeDeckId`); swipe screen shows those words instead of exam pool.

## Deliverable order

1. Stage 1 files (types, filter, UI switcher, onboarding) — one turn, no AI cost.
2. **You test** exam switching, confirm it feels right on preview.
3. Stage 2 seed script + run — one turn, uses AI credits.
4. **You test** each exam has real subject-specific words.
5. Stage 3 schema + server fns + UI — one or two turns depending on complexity of document parsing.
6. **You test** custom deck creation end-to-end.

## Out of scope for this plan

- Reaching the 4,000 / 3,000 / 6,000 word counts in your spec — that's tens of thousands of AI calls and I'd want you to explicitly greenlight the cost + timing separately (probably an overnight batch job, not a chat turn). 150 per exam gives real coverage for a demo; we can top-up per exam in later turns.
- Antonyms + collocations + memory aids as separate fields — I'll fold them into existing `synonyms` + `mnemonic` for now to avoid a schema change; can split later if you want richer cards.

Reply "go" and I'll start Stage 1. Or tell me which parts to trim.
