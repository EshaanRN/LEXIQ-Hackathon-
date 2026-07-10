# Lexiq — 5-Minute Hackathon Demo Script

Three speakers, ~1:40 each. Total runtime: 5:00. Record at 1080p, browser zoomed to 100%, cursor highlighted. Preview URL: `learnlexiq.com` (or the published Lovable URL). Sign in ahead of time on a second profile so the demo account already has some XP + streak visible.

---

## SEGMENT 1 — HOOK + PROBLEM (0:00 – 1:40) — **Eshaan**

### Time: 0:00–0:20 — Cold open
- **Screen:** Landing page (`/`) fully loaded. Do NOT scroll yet. Cursor parked bottom-center.
- **Mouse:** Still.
- **Eshaan:**
  > "Every year, over three million students take the SAT or ACT — and every single one of them is told the same thing: 'just memorize a giant list of vocabulary words.' Flashcards, PDFs, Quizlet decks from 2014. It's boring, it doesn't stick, and honestly — nobody finishes them. So we built something students actually *want* to open."

### Time: 0:20–0:45 — Reveal the product
- **Screen:** Slowly scroll the landing page from top to the "How it works" section. Pause 1s on the hero.
- **Mouse:** Hover the hero CTA, then hover a feature card.
- **Eshaan:**
  > "This is **Lexiq** — a swipe-based vocabulary game for the SAT and ACT. Think Tinder meets Duolingo, but every swipe is a word that could show up on your test. Over a thousand SAT words, two hundred ACT words, all tagged, all leveled, all built into a game loop with XP, streaks, and checkpoints."

### Time: 0:45–1:10 — Sign in / enter the app
- **Screen:** Click "Get Started" → auth screen → sign in with the pre-set demo account → land on `/app`.
- **Mouse:** Click "Get Started" button. If already signed in, go straight to `/app`.
- **Eshaan:**
  > "Here's the core experience. The moment you sign in, you're dropped into the feed. No setup, no 40-question placement test — Lexiq figures out what you know as you play."

### Time: 1:10–1:40 — First swipes (the "aha")
- **Screen:** On `/app`. Card is visible with the top word.
- **Mouse:** Swipe the first card RIGHT ("know it"). Wait for next card. Swipe LEFT on the second card — the learn sheet opens. Read the definition out loud briefly, then close.
- **Eshaan:**
  > "Swipe right if you know the word — instant XP. Swipe left if you don't, and Lexiq opens a quick learn sheet with the definition, an example sentence, and pronunciation you can actually hear. That's the entire learning loop. It takes about two seconds per word — which means a student can knock out fifty words on the bus ride to school."
- **Transition:** "But here's where it gets interesting — Ali's going to show you what's happening under the hood."

---

## SEGMENT 2 — CORE FEATURES + DEPTH (1:40 – 3:20) — **Ali**

### Time: 1:40–2:05 — Study mode selector
- **Screen:** Still on `/app`. Scroll up slightly so the StudyModeSelector is centered.
- **Mouse:** Click **SAT · ACT** → then **ACT only** → then back to **SAT · ACT**. The card underneath updates live.
- **Ali:**
  > "Every student's timeline is different. Maybe you have the ACT in July and the SAT in September. With one tap, you can flip between SAT-only, ACT-only, or a mixed deck. The queue rebuilds instantly — so you're never wasting a swipe on a word that isn't on your test."

### Time: 2:05–2:30 — Daily goal + HUD
- **Screen:** Point cursor at the top HUD — XP counter, streak flame, rank bar, daily goal bar.
- **Mouse:** Hover each element for ~1s.
- **Ali:**
  > "Up top you've got everything a game needs to keep you coming back: XP, your rank, a streak that resets at 5 AM, and a daily goal bar. Hit the goal, keep the streak. Miss a day, and Nox — our owl mascot — will absolutely guilt-trip you about it."

### Time: 2:30–2:55 — Checkpoint quiz
- **Screen:** Swipe a few more cards until the checkpoint modal appears (or navigate to `/checkpoint` directly if it hasn't triggered yet).
- **Mouse:** Click "Let's go." Answer one question correctly on camera.
- **Ali:**
  > "Every few new words, Lexiq pauses you for a checkpoint — a micro-quiz on exactly what you just learned. This is spaced repetition disguised as a game. Skip it, and the cycle restarts — so you can't cheese your way to an empty streak."

### Time: 2:55–3:20 — Search + keyboard power features
- **Screen:** Back on `/app`. Use the search bar to search a word (e.g. "ephemeral"), open the learn sheet, close it. Then press ArrowRight, ArrowLeft, Enter to demonstrate keyboard control.
- **Mouse:** Type in search, click a result, close, then hands to keyboard.
- **Ali:**
  > "Power users get a full keyboard mode — arrows to swipe, enter to skip, space to open the sheet. And the search bar means any word in the deck is one keystroke away. This is built to be fast — because studying is a habit, and habits die the second your app feels slow."
- **Transition:** "Prajwal's going to close us out with the stuff that makes Lexiq more than just a study app."

---

## SEGMENT 3 — DIFFERENTIATION + CLOSE (3:20 – 5:00) — **Prajwal**

### Time: 3:20–3:45 — Dashboard / mastery tracking
- **Screen:** Click Dashboard in the bottom nav → `/dashboard`. Scroll slowly through mastery breakdown, SAT vs ACT progress, weak-word list.
- **Mouse:** Hover a couple of stat tiles.
- **Prajwal:**
  > "Behind every swipe, Lexiq is building a model of the student. This is the dashboard — mastery tracked per word, per exam, weak words surfaced automatically so tomorrow's session focuses on what you actually got wrong yesterday. Teachers can look at this and know exactly where a kid is stuck."

### Time: 3:45–4:10 — Referral / growth loop
- **Screen:** Navigate to `/refer`. Copy the referral link visibly.
- **Mouse:** Click the copy button. Show the tracker (X of Y friends → free month → free year).
- **Prajwal:**
  > "Every user gets a personal invite link to learnlexiq.com. Refer friends, unlock free premium — a month, then a full year. Both sides get notified when it happens. It's a growth loop baked into the product, not bolted on."

### Time: 4:10–4:35 — Premium / shop / polish
- **Screen:** Quick tour: `/premium` → `/shop` → back to `/app`. Fast, ~7s each.
- **Mouse:** Smooth clicks through the bottom nav.
- **Prajwal:**
  > "There's a full monetization layer — premium tier, an in-game shop, avatars, cosmetic unlocks. Kids will pay for streak freezes. We know, we tested it."

### Time: 4:35–5:00 — Close + thank you
- **Screen:** Return to `/app`. Let one clean card sit on screen. Do NOT swipe.
- **Mouse:** Still.
- **Prajwal:**
  > "So that's Lexiq. A thousand-plus SAT words, two hundred ACT words, a real game loop, real mastery tracking, and a growth engine — built in one weekend. We think test prep shouldn't feel like punishment. It should feel like the app you can't put down on the bus. Thank you to the judges — we'd love to answer any questions."

---

## Production notes
- **Cursor:** enable a highlighted cursor (macOS: Accessibility → Pointer size + color; or use Cursor Highlighter / Mouseposé).
- **Audio:** each speaker records their own voiceover after the screen recording — cleaner than live narration.
- **Cuts:** hard cut between the three segments; do NOT fade. Keeps energy up.
- **Pre-demo checklist:**
  - Signed in as demo account with ~150 XP, 3-day streak, daily goal ~40% done.
  - Study mode set to SAT · ACT.
  - Ad interstitials disabled (they already are in `/app`).
  - Browser at 100% zoom, 1440×900 window, no bookmarks bar.
- **Backup:** record a second take of the checkpoint segment — if it doesn't trigger naturally, cut to `/checkpoint` directly.

Total: **5:00** exactly, 1:40 per speaker.
