# Setting Up Your Own Google Sign-In for Lexiq

Goal: replace the "Sign in to Lovable" text on the Google popup with "Sign in to Lexiq" + your logo. You'll do most of this in your Google account; I'll handle the last step inside Lexiq.

Total time: ~15 minutes. No coding required.

---

## Step 1 — Get your Lexiq callback URL (do this first)

You'll need this URL later in Google. Get it now so it's ready to paste.

1. In Lexiq (this app), look at the left/bottom navigation and click **More** (the `...` icon).
2. Click **Cloud**.
3. Click **Users** in the Cloud sub-tabs at the top.
4. Click the **gear icon** (Auth settings) in the top right of the Users page.
5. Scroll to **Sign-in methods** → click **Google** to expand it.
6. You'll see a line labeled **Callback URL (for OAuth)**. It looks like:
   `https://rykyguattotnfqxelhhc.supabase.co/auth/v1/callback`
7. Click the copy button next to it. Paste it into a notes app for now — you'll need it in Step 4.

Leave this tab open. You'll come back here in Step 5.

---

## Step 2 — Create a Google Cloud project

1. Open a new browser tab → go to https://console.cloud.google.com/
2. Sign in with the Google account you want to own this (your personal or business Google account).
3. If it asks you to agree to Google Cloud Terms of Service, check the box and click **Agree and continue**.
4. At the top of the page, click the **project dropdown** (it says "Select a project" or shows a project name).
5. In the popup, click **New Project** (top right).
6. Project name: type `Lexiq` → click **Create**.
7. Wait ~10 seconds. A notification will appear top-right when it's done.
8. Click the project dropdown again and select **Lexiq** so it becomes the active project.

---

## Step 3 — Configure the consent screen (what users see on the popup)

1. In the search bar at the top of Google Cloud, type `OAuth consent screen` → click the matching result.
2. If it asks "Get started", click **Get started**.
3. **App Information**:
   - App name: `Lexiq`
   - User support email: pick your email from the dropdown
   - Click **Next**
4. **Audience**: choose **External** → **Next**
5. **Contact Information**: enter your email → **Next**
6. **Finish**: check the "I agree" box → **Continue** → **Create**

7. Now in the left sidebar, click **Branding**:
   - **App logo**: upload your Lexiq logo (square PNG, under 1MB). This is what users will see on the popup.
   - **Application home page**: `https://learnlexiq.com`
   - **Application privacy policy link**: `https://learnlexiq.com/privacy`
   - **Application terms of service link**: `https://learnlexiq.com/terms`
   - **Authorized domains** → click **Add domain** → type `learnlexiq.com` → press Enter
   - Click **Save**

8. In the left sidebar, click **Audience**:
   - If status is "Testing", click **Publish app** → confirm. (Otherwise only test users can sign in.)

9. In the left sidebar, click **Data Access**:
   - Click **Add or remove scopes**
   - Check these three boxes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`
   - Click **Update** → **Save**

---

## Step 4 — Create the OAuth credentials

1. In the left sidebar, click **Clients** (or search "Credentials" at the top).
2. Click **+ Create Client** (or **Create Credentials → OAuth client ID**).
3. **Application type**: select **Web application**
4. **Name**: type `Lexiq Web`
5. Scroll to **Authorized redirect URIs** → click **+ Add URI**
6. Paste the callback URL you copied in Step 1.
7. Click **Create**.
8. A popup appears with **Client ID** and **Client Secret**.
   - Click the copy icon next to **Client ID** → paste into your notes
   - Click the copy icon next to **Client Secret** → paste into your notes
   - Keep these private — treat them like passwords.

---

## Step 5 — Give the credentials to Lexiq

Come back to me in chat and say: **"I have my Google credentials ready."**

I'll then open a secure form for you to paste your Client ID and Client Secret. They go straight into the backend — they won't appear in our chat. After that, the Google sign-in popup will show "Sign in to Lexiq" with your logo.

---

## What to do if something goes wrong

- **"This app isn't verified" warning when signing in**: normal for new OAuth apps. Click "Advanced" → "Go to Lexiq (unsafe)". To remove this warning later, submit your app for Google verification (takes a few days; not required to launch).
- **"Redirect URI mismatch" error**: the URL in Step 4.6 must match Step 1.6 exactly — no trailing slash, no typos. Re-copy and try again.
- **Can't find a menu item**: tell me which step you're on and what you see on screen.

Ready when you are — start with Step 1.
