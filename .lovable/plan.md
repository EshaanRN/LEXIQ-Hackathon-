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

What inspired this project was watching how students actually study — or fail to study — for the SAT and ACT. Since the College Board's 2016 redesign, reading scores have trended down year after year, and the digital rewrite of both the SAT and ACT hasn't reversed the slide; the reading section is at its lowest average since the redesign despite an objectively easier test format. The two reading domains that hit hardest, Craft-and-Structure and Information-and-Ideas, are vocabulary-bound: the questions are answerable only if you know what the words mean, so no test-taking "strategy" recovers points a weak lexicon has already lost. I was one of those students, and the obvious answer — flashcards — is the wrong one in practice: after surveying roughly 2,000 students in my area, the consistent complaint was that decks are tedious and boring, and the phone wins every time. That's fundamentally an engagement-vs-retention tradeoff — the best spaced-repetition schedule in the world has expected retention `E[R] = p(open) · p(recall | open)`, and if `p(open) → 0` the whole product is zero regardless of the second term. Lexiq exists to fix the first factor: keep the spaced-repetition backend that actually works, but wrap it in a TikTok-style input surface students will voluntarily open.

## What it does

Unlike other flashcard apps, Lexiq uses a gamified, addictive loop where you learn vocabulary by swiping — right if you know the word, left if you don't — over a corpus of ~1,000 SAT and ~200 ACT words tagged by exam and by Latin/Greek root. Each swipe is treated as a binary recall signal `x_t ∈ {0, 1}`, and every word carries a mastery score `m ∈ [0, 100]` that updates as `m_{t+1} = m_t + α·(100·x_t − m_t)` with a learning rate `α ≈ 0.25` — an exponential moving average, so recent performance is weighted more heavily than the tail and the schedule adapts inside a session, not across weeks. The next card is chosen from a priority queue whose key is a weighted sum of `(100 − m)`, time-since-last-seen, and a small exploration term, which is a lightweight approximation of the SM-2 interval formula tuned for a swipe-speed interaction (~2 s per card) rather than an Anki-speed one (~10 s per card). Swiping left opens a learn sheet with definition, roots, synonyms, and an example sentence, and — this is the part I'm proud of — the miss doesn't just re-queue that one lemma; the system tags the word's Latin/Greek roots (`ephemer-`, `-luc-`, `mal-`, etc.) and pulls in its root-family neighbours via a k-nearest-neighbours lookup in an approximated root-embedding space, so missing *ephemeral* surfaces *ephemera*, *diurnal*, and *temporal* next, and weaknesses generalise across morphology instead of one token at a time. Every N new words — user-configurable checkpoint interval — the scheduler pauses for a checkpoint quiz drawn from what you just saw, in either a typed MCQ mode or a verbal mode where your microphone is piped through speech-to-text and an LLM rubric that grades language ID, pronunciation, and whether the example sentence you produced is semantically coherent for that word's part of speech; failed items are reinserted at the head of the priority queue until mastered, so the streak has to be earned.

## How I built it

I built Lexiq on Lovable. As a beginner to hackathons and to coding in general, Lovable was the most efficient way to get the idea out of my head — instead of learning framework syntax from zero, I could describe what I wanted, edit the generated code, and keep iterating; the workflow I converged on was iterative development, a tight `prompt → deploy → user-test → refactor` loop where each cycle produced measurable changes rather than a big-bang rewrite at the end. My first prompt was a detailed spec (further tightened by Claude Code) that captured the swipe loop, the mastery model, and the corpus split; from there every iteration was driven by real usage rather than my own guesses. I researched what makes learning apps sticky and folded in the specific mechanics that work in each — Duolingo's streak logic and verbal grading, Quizlet's deck semantics and search, and Blooket's gamified positive-feedback loops — then tested each addition end-to-end so no feature landed without an integration check. Technically, every AI-facing feature (custom-test generation, adaptive SAT questions from a struggle list, verbal grading, and TTS) runs through TanStack Start server functions with Zod-validated inputs and structured outputs, so a `QuestionSchema` enforces exactly 4 choices, `correctIndex ∈ {0, 1, 2, 3}`, and a bounded-length explanation — a schema-checked object comes back, never raw text, which cuts hallucination-shaped bugs to near zero. Data lives in Lovable Cloud with row-level security on every user-scoped table (`user_roles`, mastery records, referrals) so per-user isolation is enforced at the database layer instead of trusted to the client; payments go through Paddle, TTS through the `openai/gpt-4o-mini-tts` model on the Lovable AI Gateway with a browser `SpeechSynthesis` fallback if the gateway 402s, and MCQ generation through `google/gemini-3-flash-preview`. I then sent builds to teachers, friends, parents, and around a thousand students, and every round of criticism became the next iteration — the app is smoother because it was tested, not because I designed it correctly on the first try.

## Challenges I ran into

The hardest challenge was the backend, specifically wiring Google OAuth. I had never touched auth before, and even Lovable struggled with the OAuth callback and redirect-URI configuration, so I spent hours on tutorials working through the config and the session-attachment middleware until first-sign-in stopped erroring — the fix in the end was making sure the redirect URI was a same-origin public URL and that the client-side function middleware attached the bearer token on every server call. The second challenge was the mascot and avatar pipeline: Lovable occasionally misinterpreted source images and glitched the render, which mattered because avatars are load-bearing for the "interactive, not tedious" feel of the app — I ended up standardising the transparent-PNG import path and locking the mascot prompt so the render was deterministic across builds. The third challenge was Premium — I wanted an ad-free tier with the custom-test builder, adaptive drills, and expanded resources so the app could sustain itself past the hackathon, and I got the scaffolding in (Paddle checkout, gated routes, the `generateCustomQuiz` and `generateAdaptiveSatQuestions` server functions) but not everything I want the tier to include. Balancing the mastery-update learning rate `α` was subtler than expected: too high and one bad swipe tanks a well-learned word (`m` overshoots and the variance of the estimator blows up), too low and the schedule feels unresponsive (the EMA lags real ability, effective window ≈ `1/α` items), and I only found `α ≈ 0.25` after sweeping the `[0.1, 0.5]` interval against real users. That kind of "obvious in hindsight" tuning problem showed up in the streak rollover time, the Laplace prior `(hits + 1) / (attempts + 2)` on the weak-word ranking, and the checkpoint interval `N` too — every knob that looked like a single number was actually a bias-variance tradeoff curve.

## Accomplishments that I'm proud of

The accomplishment I'm most proud of is the verbal grader — the feature where the app listens to you pronounce a word, define it, and use it in a sentence, then gives real feedback. This was inspired by Duolingo's speaking exercises, and at first it felt like a reach: I assumed graded ASR plus semantic scoring would take months of ML tuning. It turned out to be a well-scoped pipeline once I decomposed the rubric into three independent scalar checks — a language-ID probability `L ∈ [0, 1]` from the ASR output, a pronunciation-similarity score `P ∈ [0, 1]` against the target phoneme sequence, and a semantic-coherence score `C ∈ [0, 1]` from an LLM prompted with the target word, its part of speech, and the user's sentence — combined as a weighted sum `S = w_1·L + w_2·P + w_3·C` with `w_1 + w_2 + w_3 = 1`, a pass threshold on `S`, and per-component minimums so a student can't compensate for zero pronunciation with a great sentence. Structuring it as three orthogonal components rather than one holistic "is this good?" call is what made it reliable, because each dimension is independently interpretable and independently tunable, and the whole rubric is basically a hand-designed linear classifier over three model outputs. That single feature moved Lexiq from "study tool" to "online tutor" in tester feedback, and it's the piece users mention first when they describe the app back to me.

## What I learned

From building Lexiq, the technical lesson was how much leverage schema-validated LLM outputs, EMA-style online updates, and a priority-queue scheduler give you over the naive "just re-show missed cards" flashcard model — a handful of equations replace a lot of hand-tuned logic. The bigger lesson is that feedback compounds and that no amount of clever design substitutes for shipping to real users: my own intuition was wrong about the ideal `α`, wrong about the checkpoint interval `N`, wrong about which mascot testers thought was cute, and wrong about which distractors in the MCQs were actually plausible — testers corrected all of those. Iterative development is not a slogan; it's a control loop where each release is a measurement and each next release is the correction, and skipping the measurement step is how good ideas ship broken. I also learned that most "AI features" are really plumbing problems — the hard part isn't the model call, it's the Zod schema, the RLS policy, the fallback path when the gateway 402s, and the client-side gesture wiring that has to match a keyboard handler exactly. Every one of those is a small, unglamorous engineering decision, and the app is good because I stopped treating them as afterthoughts.

## What's next for LEXIQ

The next step for Lexiq is corpus expansion. The scheduler, mastery model, root-family generalisation, and verbal grader are corpus-agnostic — only the word list and the root/tag metadata change — so extending Lexiq to the MCAT, LSAT, CLT, and GRE is a data problem, not an engineering problem. My cousin Moksha is currently studying for the MCAT and is drowning in exactly the same "boring, tedious, high-volume vocabulary" trap I was in for the SAT, and the same priority-queue-plus-EMA setup should compress her study time the same way it compressed mine. Beyond that, I want to ship Lexiq as a real native app rather than just a web build, and I'm entering it into additional hackathons to get funding, network, and continued critical feedback — I already own `learnlexiq.com` and treat this as a real product, not a competition submission. Longer-term features on the roadmap are a proper Bayesian mastery model — moving from a scalar EMA to a Beta-Binomial posterior `Beta(hits + 1, misses + 1)` over per-word recall probability, which gives calibrated credible intervals instead of a point estimate and lets the scheduler use posterior variance as an exploration bonus. On top of that, classroom mode for teachers with cohort-level mastery dashboards, and offline caching of the priority queue so students on flaky Wi-Fi can still get their daily reps in.
