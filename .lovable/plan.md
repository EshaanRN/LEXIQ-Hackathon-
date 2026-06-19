## Wire up your AdSense publisher ID for verification

Your publisher ID from the screenshot: `ca-pub-2551071845015039`.

The app is already coded to inject the AdSense `<script>` tag site-wide when `VITE_ADSENSE_CLIENT` is set. We just need to fill it in and republish.

### Changes

1. Set `VITE_ADSENSE_CLIENT="ca-pub-2551071845015039"` in `.env.development`.
2. Set `VITE_ADSENSE_CLIENT="ca-pub-2551071845015039"` in `.env.production`.

That's it — no other code changes. Once set, every page's `<head>` will include exactly the snippet AdSense is asking for:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2551071845015039" crossorigin="anonymous"></script>
```

### What you do after I apply this

1. **Republish** the app (click Publish → Update) so the production build at `learnlexiq.com` ships the new script tag.
2. Wait ~1 minute for the deploy to go live, then load `https://learnlexiq.com` once in your browser to confirm the page renders.
3. Back in AdSense: tick **"I've placed the code"** and click **Verify**.
4. AdSense then queues your site for review (can take hours to a few days). Ads stay as placeholders until they approve you and you create ad units — that's a separate later step.

### Note on the other two methods in the screenshot
- **Meta tag**: also already supported by the same env var (we inject `<meta name="google-adsense-account">` too), so either AdSense method will pass once you republish.
- **Ads.txt**: not needed for verification. After approval, for `learnlexiq.com` you'll want an `ads.txt` file — I can add a route for that when you're ready.
