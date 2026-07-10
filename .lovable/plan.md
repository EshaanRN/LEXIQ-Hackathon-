# Lexiq — 5-Minute Hackathon Demo Script

Three speakers, 5:00 total. Explanatory walkthrough, not a pitch. Record at 1080p, browser at 100% zoom, cursor highlighted. Sign in ahead of time so the demo account already has XP and a streak.

---

## SEGMENT 1 — INTRO + CORE LOOP (0:00 – 1:15) — **Eshaan**

### 0:00–0:15 — What it is
- **Screen:** Landing page (`/`), no scroll. Cursor still.
- **Eshaan:**
  > "This is Lexiq. It's a web app for SAT and ACT vocabulary — instead of flashcard decks, the study surface is a swipe feed. About a thousand SAT words and two hundred ACT words in the queue."

### 0:15–0:35 — Sign in, land on /app
- **Screen:** Click Get Started → auth → `/app`.
- **Mouse:** Click Get Started. If already signed in, go straight to `/app`.
- **Eshaan:**
  > "Signing in drops you straight into the feed. There's no placement test — the queue picks the next word based on what you've already marked known or unknown, so difficulty adjusts as you go."

### 0:35–1:15 — The swipe loop
- **Screen:** On `/app`. Swipe the first card right. Swipe the second card left — learn sheet opens. Let it sit for a beat, close it.
- **Mouse:** Swipe right, swipe left, close sheet.
- **Eshaan:**
  > "Right means you know it, and it's logged as mastered. Left pulls up the learn sheet — definition, example sentence, TTS pronunciation from the AI gateway with a browser-voice fallback. Close it and the word gets scheduled back into the queue for review. That's the loop: two seconds per card, and every swipe is a signal the app uses to pick the next one."
- **Transition:** "Ali will go through what's actually running on top of that."

---

## SEGMENT 2 — FEATURES + MECHANICS (1:15 – 3:15) — **Ali**

### 1:15–1:40 — Study mode selector
- **Screen:** Scroll up slightly so the StudyModeSelector is centered.
- **Mouse:** Toggle SAT·ACT → ACT only → back to SAT·ACT. The card underneath rebuilds each time.
- **Ali:**
  > "Up here is the exam filter. It rewrites the queue in place — flipping to ACT-only excludes any word not tagged for the ACT, so you never burn a swipe on something outside your test."

### 1:40–2:05 — HUD, streak, daily goal
- **Screen:** Point cursor at the top HUD.
- **Mouse:** Hover XP, rank bar, streak, daily goal bar for ~1s each.
- **Ali:**
  > "XP accumulates per correct swipe and per learn-sheet completion. The streak is date-based, resets at 5 AM local. Daily goal is a per-user XP target — hit it and the streak advances, miss it and it breaks. Rank is a tiered bracket driven off cumulative XP."

### 2:05–2:35 — Checkpoint quiz
- **Screen:** Swipe a couple more cards until the checkpoint modal appears (or navigate to `/checkpoint` directly).
- **Mouse:** Click Let's go, answer one question correctly on camera.
- **Ali:**
  > "Every N new words the app pauses for a checkpoint — a short multiple-choice quiz drawn from the words you just saw. It's spaced repetition on a short interval: if you skip it, the cycle resets, so you can't stack a streak without actually retaining anything."

### 2:35–3:00 — Search + keyboard
- **Screen:** Back on `/app`. Type "ephemeral" in the search bar, open the learn sheet from the result, close it. Then hands to keyboard: ArrowRight, ArrowLeft, Enter.
- **Mouse:** Type, click, close, then keyboard only.
- **Ali:**
  > "Search hits the local word index — any word in the deck by name. On desktop the whole feed is keyboard-driven: arrows swipe, space opens the sheet, enter skips. It's the same handlers as the touch gestures, just bound to keydown."

### 3:00–3:15 — Handoff
- **Ali:**
  > "Prajwal will show what the app does with all that swipe data."

---

## SEGMENT 3 — DATA, GROWTH, WRAP (3:15 – 5:00) — **Prajwal**

### 3:15–3:45 — Dashboard / mastery
- **Screen:** Click Dashboard in the bottom nav → `/dashboard`. Scroll slowly through mastery, SAT vs ACT split, weak-word list.
- **Mouse:** Hover a couple of stat tiles.
- **Prajwal:**
  > "Every swipe and every checkpoint answer writes to a per-word mastery record. The dashboard reads off that — overall mastery, breakdown by exam, and a weak-words list surfaced by the words with the lowest correct-rate. Tomorrow's queue leans on that list first."

### 3:45–4:15 — Referrals
- **Screen:** Navigate to `/refer`. Click Copy on the invite link. Show the referral tracker.
- **Mouse:** Copy button, then hover the tracker.
- **Prajwal:**
  > "Each account gets a referral code. The invite link is just learnlexiq.com with that code appended — when someone signs up and enters it, both accounts get linked. The tracker here shows how many referrals until a free month, then a free year. Both sides get notified on redemption."

### 4:15–4:40 — Premium / shop
- **Screen:** Quick pass through `/premium` then `/shop`. ~10s each.
- **Mouse:** Smooth clicks through the bottom nav.
- **Prajwal:**
  > "Premium unlocks the custom-test builder — you paste in your own word list and the AI gateway generates SAT-style questions against it — plus adaptive drills that pull from your weak words. Shop is cosmetics and streak freezes, checkout runs through Paddle."

### 4:40–5:00 — Wrap
- **Screen:** Back on `/app`. One clean card sitting on screen. No swipe.
- **Mouse:** Still.
- **Prajwal:**
  > "That's the whole app — swipe feed, adaptive queue, mastery tracking, referral loop, and an AI-generated practice layer on top. Happy to take questions."

---

## Production notes
- Highlighted cursor (macOS Accessibility → Pointer, or Mouseposé).
- Each speaker records their own voiceover after the screen recording.
- Hard cuts between segments, no fades.
- Pre-demo checklist:
  - Demo account with ~150 XP, 3-day streak, daily goal ~40% done.
  - Study mode set to SAT·ACT.
  - Ad interstitials disabled (already are in `/app`).
  - Browser at 100% zoom, 1440×900 window, no bookmarks bar.
- Backup: if the checkpoint doesn't trigger naturally during Ali's segment, cut to `/checkpoint` directly.

Total: **5:00** exactly.
