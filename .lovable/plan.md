# Lexiq — Hackathon Deliverables

Two sections:
- **A.** 5-minute demo script (Eshaan → Ali → Prajwal)
- **B.** Devpost write-up answers

Record at 1080p, browser at 100% zoom, highlighted cursor. Sign in ahead of time so the demo account already has XP and a streak.

---

# A. 5-Minute Demo Script

## SEGMENT 1 — INTRO + CORE LOOP (0:00 – 1:15) — **Eshaan**

### 0:00–0:20 — Framing
- **Screen:** Landing page (`/`). Cursor still.
- **Eshaan:**
  > "This is Lexiq. Since the 2016 redesign, SAT reading scores are at an all-time low, and the digital redesign didn't fix it — Craft-and-Structure and Information-and-Ideas are still vocabulary-bound. We surveyed around 2,000 students in our area and the pattern was consistent: flashcards lose to phone scroll. So instead of fighting that behavior, we rebuilt a spaced-repetition scheduler behind a swipe feed. Same underlying signal as SM-2 or Leitner — TikTok-style input surface."

### 0:20–0:40 — Sign in, land on `/app`
- **Screen:** Click Get Started → auth → `/app`.
- **Eshaan:**
  > "Signing in drops you straight into the feed. About 1,000 SAT words and 200 ACT words are tagged in the corpus. No placement test — every swipe is a binary recall signal the scheduler uses to pick the next card."

### 0:40–1:15 — The swipe loop
- **Screen:** Swipe right on the first card. Swipe left on the second — learn sheet opens. Beat, then close it.
- **Eshaan:**
  > "Right means known — we log a hit and bump the per-word mastery score. Left opens the learn sheet: definition, Latin and Greek roots, synonyms, an example sentence, and TTS pronunciation running through the Lovable AI Gateway on `gpt-4o-mini-tts`, with the browser's SpeechSynthesis as a fallback if the gateway 402s. Under the hood each word carries a mastery score `m` in `[0, 100]`, updated as `m ← m + α·(hit − m)` — an EMA on the recall signal. The scheduler is a priority queue keyed on that score, so weak words surface first. That's the loop — roughly two seconds a card, every swipe feeds the queue."
- **Handoff:** "Ali will walk through what runs on top of it."

---

## SEGMENT 2 — FEATURES + MECHANICS (1:15 – 3:15) — **Ali**

### 1:15–1:35 — Study mode selector
- **Screen:** StudyModeSelector centered. Toggle SAT·ACT → ACT-only → back.
- **Ali:**
  > "The exam filter is a set filter over the ~1,200-word corpus by exam tag. Toggling rewrites the in-memory queue in place — no refetch, no page reload. Flip to ACT-only and any SAT-exclusive word drops out of the priority queue instantly."

### 1:35–2:00 — Root-family targeting
- **Screen:** Trigger a left-swipe on a word with a clear root (e.g. *ephemeral* → root cluster).
- **Ali:**
  > "When you miss a word, we don't just re-queue that lemma — we surface its root family. Each word carries Latin and Greek root tags; we approximate a root-embedding space and do a k-nearest-neighbours lookup, so missing *ephemeral* pulls in *ephemera*, *diurnal*, *temporal*. Weaknesses generalize across morphology instead of one token at a time."

### 2:00–2:20 — HUD math
- **Screen:** Hover XP, rank bar, streak, daily goal.
- **Ali:**
  > "XP is per correct swipe plus learn-sheet completion. Streak is a date-diff with a 5 AM local rollover so a late-night session still counts. Rank is a piecewise bracket function of cumulative XP — tiered thresholds, not linear. Daily goal is a per-user XP target; hit it and the streak advances, miss and it breaks."

### 2:20–2:50 — Checkpoint quiz
- **Screen:** Swipe until the checkpoint modal appears (or `/checkpoint`). Choose verbal, answer one on camera.
- **Ali:**
  > "Every N new items — user-configurable — the scheduler pauses for a checkpoint drawn from the words you just saw. Two modes: typed MCQ, or verbal. Verbal pipes your mic through speech-to-text, then an LLM grader scores three things: language ID, pronunciation, and semantic fit of the example sentence you give. Failed items get reinserted at the head of the priority queue until mastered — you can't stack a streak without actually retaining anything."

### 2:50–3:15 — Search, keyboard, handoff
- **Screen:** Search "ephemeral", open the sheet, close it. Then arrows, space, enter.
- **Ali:**
  > "Search is a local index over the corpus. On desktop the whole feed is keyboard-driven — arrows swipe, space opens the sheet, enter skips — bound to the same handlers as the touch gestures. Prajwal will show what the app does with all that swipe data."

---

## SEGMENT 3 — DATA, GROWTH, WRAP (3:15 – 5:00) — **Prajwal**

### 3:15–3:50 — Dashboard / mastery
- **Screen:** `/dashboard`. Scroll through mastery, SAT vs ACT split, weak-word list.
- **Prajwal:**
  > "Every swipe and every checkpoint answer writes to a per-word mastery record. The dashboard aggregates that into overall mastery, an SAT-vs-ACT split, and a weak-words list. The ranking uses a Laplace-smoothed correct-rate — `(hits + 1) / (attempts + 2)` — so one miss out of two doesn't outrank twenty out of fifty. Tomorrow's queue leans on that list first."

### 3:50–4:20 — Referrals
- **Screen:** `/refer`. Copy invite link, hover the tracker.
- **Prajwal:**
  > "Each account gets a signed referral code. The invite link is `learnlexiq.com` with that code appended — when someone signs up and enters it, both accounts get linked and notified. The tracker shows referrals-to-free-month, then referrals-to-free-year — tiered rewards keyed on redemption count."

### 4:20–4:45 — Premium / shop
- **Screen:** `/premium`, then `/shop`.
- **Prajwal:**
  > "Premium unlocks the custom-test builder — paste your own word list and we call `gemini-3-flash-preview` through the gateway with a strict Zod schema on the response, so every output is a validated 4-choice MCQ with a correct index and explanation. Adaptive drills pull from that same Laplace-smoothed weak-words list. Shop is cosmetics and streak freezes, checkout runs through Paddle."

### 4:45–5:00 — Wrap
- **Screen:** Back on `/app`, one clean card. Still.
- **Prajwal:**
  > "That's Lexiq — swipe feed, adaptive priority-queue scheduler, root-family generalization, mastery tracking, ASR-plus-LLM verbal grader, referral loop, and an AI-generated practice layer. Validated with over a thousand student testers plus teacher and parent feedback. Happy to take questions."

---

## Production notes
- Highlighted cursor (macOS Accessibility → Pointer, or Mouseposé).
- Each speaker records voiceover after the screen recording.
- Hard cuts between segments, no fades.
- Pre-demo checklist:
  - Demo account with ~150 XP, 3-day streak, daily goal ~40% done.
  - Study mode: SAT·ACT.
  - Ad interstitials disabled (already are on `/app`).
  - 1440×900 window, 100% zoom, no bookmarks bar.
- Backup: if the checkpoint doesn't trigger during Ali's segment, cut to `/checkpoint` directly.

Total: **5:00**.

---

# B. Devpost Write-Up

## Inspiration

Since the 2016 redesign, SAT reading scores have trended down year over year, and the digital rewrite didn't reverse it — reading is at an all-time low despite an objectively easier test. The two reading domains hit hardest, Craft-and-Structure and Information-and-Ideas, are vocabulary-bound: if you don't know the words, no strategy recovers the points. I was one of those students.

The obvious answer is flashcards. The real problem is that students don't *use* them. I surveyed roughly 2,000 students in my area and the result was blunt — flashcards feel tedious, and students would rather scroll TikTok than review a deck. That's an engagement-versus-retention tradeoff: the best spaced-repetition system in the world loses to a feed that a student will actually open.

Lexiq is the compromise. Same spaced-repetition backend that powers Anki-style tools; TikTok-style input surface on top.

## What it does

Lexiq is a gamified vocabulary app for the SAT and ACT. The core interaction is a swipe: right if you know the word, left if you don't. Each swipe is a binary recall signal that updates a per-word mastery score `m ∈ [0, 100]` via an EMA-style rule `m ← m + α·(hit − m)`. A priority queue keyed on that score picks the next card, so weak words surface first.

When you swipe left, a learn sheet opens with the definition, Latin and Greek roots, synonyms, and an example sentence — plus pronunciation streamed from the Lovable AI Gateway (`gpt-4o-mini-tts`) with a browser TTS fallback. Roots aren't decorative. Each word carries root tags, and when you miss one we do a k-nearest-neighbours lookup in an approximated root-embedding space to surface the rest of the family. Miss *ephemeral* and the queue pulls in *ephemera*, *diurnal*, *temporal* — weaknesses generalize across morphology, not one lemma at a time.

Every N new items — user-configurable — the scheduler pauses for a checkpoint quiz drawn from the words you just saw. Two modes: typed MCQ, or verbal. Verbal pipes your mic through speech-to-text and an LLM grader that scores language ID, pronunciation, and whether the example sentence you produced is semantically coherent for that word's part of speech. Failed items get reinserted at the head of the priority queue until mastered, so a streak has to be earned.

## How I built it

Built on Lovable. As a hackathon beginner, Lovable let me move faster than hand-writing syntax — but the process that actually made the app good was iterative development: prompt → deploy → test with real users → refactor. Every cycle I'd research one interactive-education pattern (Duolingo's streak + verbal grader, Quizlet's deck semantics, Blooket's gamified feedback), integrate it, and re-test.

Technically: the AI features (custom-test generation, adaptive SAT questions, verbal grading, TTS) run through server functions with Zod-validated inputs and structured outputs, so every model call returns a schema-checked object instead of raw text — `QuestionSchema` enforces four choices, a `correctIndex ∈ {0..3}`, and an explanation. Data lives in Lovable Cloud (Supabase under the hood) with row-level security on every user-scoped table, so mastery records are per-user by design. Payments go through Paddle. Auth is Google OAuth.

Feedback loop: I shipped early builds to teachers, friends, parents, and around a thousand students, and every round of criticism became the next iteration. The app is smoother because it was tested, not because it was designed correctly on the first try.

## Challenges I ran into

Backend, specifically Google OAuth, was the hardest part. I had no prior experience wiring auth, and even Lovable needed help — I spent hours in tutorials working through the config until it stopped erroring on first sign-in.

The mascot and avatar pipeline also fought back. Lovable occasionally misinterpreted the source images and glitched the render, and avatars are core to the "interactive, not tedious" feel, so I couldn't just drop them.

Premium was the third: I wanted an ad-free tier with the custom-test builder and expanded resources so the app could sustain itself past the hackathon. I got the scaffolding in — Paddle checkout, gated routes, custom-test server function — but not everything I want the tier to include. That work continues.

## Accomplishments that I'm proud of

The verbal grader. The app actually listens to you pronounce a word, define it, and use it in a sentence, then gives you real feedback — ASR feeding an LLM rubric that scores language ID, pronunciation, and semantic fit. I expected this to take months. It turned out to be a well-scoped server function once I broke the rubric into discrete checks. That single feature moved Lexiq from "study tool" to "online tutor."

## What I learned

Vibe-coding is real, but the actual lesson is that feedback compounds. No matter how done an app feels, it isn't — real users will find the seams every time. Iterative development, test-in-the-loop, and treating criticism as the primary input are non-negotiable. Skipping any of that is how good ideas ship broken.

## What's next for LEXIQ

Same scheduler, new corpora. My cousin Moksha is drowning in MCAT vocab for the same reason I drowned in SAT vocab — it's tedious. The priority-queue scheduler, mastery model, and verbal grader don't care what the words are; only the corpus and root tags change. MCAT, LSAT, CLT, and GRE are all on the roadmap.

Beyond that: native mobile app, more hackathons for funding and network, and continued work on Premium. I've already bought `learnlexiq.com` — this is not a one-weekend project.
