## Wire up Google AdSense

Prepare the app so real ads light up the moment you paste your `ca-pub-...` ID. Until then, current placeholders remain visible for free users (Premium users never see ads).

### Changes

1. **Env variable**
   - Add `VITE_ADSENSE_CLIENT=""` to `.env.development` and `.env.production`.
   - You'll fill in `ca-pub-XXXXXXXXXXXXXXXX` once approved.

2. **Load AdSense script in `src/routes/__root.tsx`**
   - In `head()`, when `VITE_ADSENSE_CLIENT` is set, inject:
     - `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXX" crossorigin="anonymous">`
     - `<meta name="google-adsense-account" content="ca-pub-XXX">` (helps verification).
   - Skip entirely when the env var is empty so unapproved builds don't ship the script.

3. **Update `src/components/AdSlot.tsx`**
   - If `VITE_ADSENSE_CLIENT` is set AND user is not Premium: render `<ins class="adsbygoogle" data-ad-client="ca-pub-XXX" data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true">` and push `(window.adsbygoogle = window.adsbygoogle || []).push({})` on mount.
   - Accept an optional `slot` prop (ad unit ID). Fall back to current placeholder if no client/slot configured.
   - Re-push on route change so ads refresh between pages.

4. **Update `src/components/AdInterstitial.tsx`**
   - Same pattern with a larger responsive unit; keep the existing dismiss/timing logic untouched.

5. **Docs comment**
   - Add a short comment in each ad component explaining where to get the slot ID from AdSense and that leaving `VITE_ADSENSE_CLIENT` empty keeps placeholders.

### What you'll do after approval
1. Set `VITE_ADSENSE_CLIENT` in both env files to your `ca-pub-...` ID.
2. In AdSense, create ad units and copy their slot IDs into the `slot` props (I'll mark the spots in code).
3. Republish — ads go live for free users only.

### Not included
- ads.txt: AdSense auto-handles this on `*.lovable.app`. For `learnlexiq.com`, you'll need to add an `ads.txt` file at the domain root after approval — I can add a route for that when you're ready.
- No business logic, premium gating, or webhook changes.
