# Good news — you're in the right place

What you're seeing IS the callback section. Lexiq's new sign-in system uses **4 redirect URLs** instead of one. You'll paste all 4 into Google later. No `supabase.co` URL is needed anymore — that's an older format.

---

## Revised Step 1 — Copy all 4 redirect URLs

On the screen you're looking at right now:

1. Click the **copy icon** (the little square on the right) next to each of these 4 URLs, one at a time, and paste each into a notes app on its own line:
   - `https://oauth.lovable.app/callback`
   - `https://vocab-swipe-quest.lovable.app/~oauth/callback`
   - `https://learnlexiq.com/~oauth/callback`
   - `https://www.learnlexiq.com/~oauth/callback`

2. **Do NOT tick the checkboxes yet.** You'll come back and tick all 4 in the final step, after Google is set up.

3. **Leave Client ID and Client Secret blank for now** — you don't have them yet. Don't click Save.

Keep this Lexiq tab open in the background.

---

## Revised Step 4.6 — Add all 4 URLs to Google

When you reach Step 4 in Google Cloud Console, on the "Create OAuth client ID" page:

- Under **Authorized redirect URIs**, click **+ Add URI** and paste the first URL.
- Click **+ Add URI** again and paste the second.
- Repeat until all **4 URLs** from your notes are added (one per line).
- Then click **Create**.

Everything else in the original plan (Steps 2, 3, the rest of 4, and 5) stays exactly the same.

---

## Final step addition — tick the boxes

After you paste your Client ID and Client Secret into Lexiq in Step 5, also:
- Tick the checkbox next to **all 4 redirect URLs** on this same Lexiq screen.
- Then click **Save**.

---

Ready? Copy the 4 URLs into your notes, then move on to **Step 2** (create the Google Cloud project) from the original plan.
