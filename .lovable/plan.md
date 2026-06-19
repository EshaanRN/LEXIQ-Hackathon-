## What's actually wrong

I checked the live site at `https://learnlexiq.com` and **neither the AdSense script nor the meta tag are in the HTML**. That's why AdSense keeps failing — it's not a "publish again" issue, the tag genuinely isn't there on the live build.

The code in `src/routes/__root.tsx` reads the publisher ID from `import.meta.env.VITE_ADSENSE_CLIENT`. The value is set in `.env.production`, but the production build isn't picking it up, so `ADSENSE_CLIENT` is `undefined` and the conditional drops both the script and the meta tag.

## Fix

1. **Stop depending on the env var.** Hardcode `ca-pub-2551071845015039` as a constant in `src/routes/__root.tsx` (right where `ADSENSE_CLIENT` is currently read from `import.meta.env`). This guarantees the tag ends up in the built HTML.
2. Leave the rest of the head() logic alone — the script entry and `google-adsense-account` meta tag are already correct, they just need a real value.
3. After the edit, you click **Publish → Update**. Wait ~1 minute, then load `https://learnlexiq.com` in a new tab and view source — you should see `pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2551071845015039` in the HTML.
4. Then go back to AdSense, tick **"I've placed the code"**, and click **Verify**.

## What I will NOT touch

- AdSlot / AdInterstitial components
- Any other route metadata
- `.env.*` files (they'll stay as-is but won't matter anymore)

## Why this will actually work this time

I verified with `curl https://learnlexiq.com` that the AdSense markup is currently missing from the live HTML. After hardcoding the ID + republishing, the same `curl` check will show the script tag present, which is exactly what AdSense's verifier looks for.