# EOD Report — Setup & Deployment Guide

## What this is
A Next.js web app where counsellors fill a daily EOD form.
On submit → a formatted HTML email is sent via Gmail API to:
- siddharth.garg@mastersunion.org
- soma.charan@mastersunion.org

---

## Step 1 — Clone & install

```bash
cd eod-report
npm install
```

---

## Step 2 — Google Cloud / Gmail API setup

You only do this ONCE.

### 2a. Create a Google Cloud project

1. Go to https://console.cloud.google.com
2. Click **New Project** → name it `EOD Report`
3. Select the project

### 2b. Enable Gmail API

1. Go to **APIs & Services → Library**
2. Search **Gmail API** → click **Enable**

### 2c. Create OAuth credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: `EOD Report`
5. Authorized redirect URIs: add `https://developers.google.com/oauthplayground`
6. Click **Create**
7. Copy your **Client ID** and **Client Secret** — save them

### 2d. Get a Refresh Token

1. Go to https://developers.google.com/oauthplayground
2. Click the ⚙️ gear icon (top right) → check **Use your own OAuth credentials**
3. Enter the Client ID and Client Secret you just copied
4. In the left panel, find **Gmail API v1** → select `https://mail.google.com/`
5. Click **Authorize APIs** → sign in with the Gmail account that will SEND emails
6. Click **Exchange authorization code for tokens**
7. Copy the **Refresh token** — save it

---

## Step 3 — Local environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
GOOGLE_CLIENT_ID=<your client id>
GOOGLE_CLIENT_SECRET=<your client secret>
GOOGLE_REFRESH_TOKEN=<your refresh token>
GMAIL_SENDER_EMAIL=your.email@mastersunion.org
```

Test locally:
```bash
npm run dev
# Open http://localhost:3000
```

---

## Step 4 — Deploy to Vercel

### 4a. Push to GitHub

```bash
git init
git add .
git commit -m "Initial EOD report app"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_ORG/eod-report.git
git push -u origin main
```

### 4b. Deploy on Vercel

1. Go to https://vercel.com → **New Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click **Environment Variables** and add all four:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`
   - `GMAIL_SENDER_EMAIL`
5. Click **Deploy**

Vercel gives you a URL like: `https://eod-report.vercel.app`

### 4c. Share the link

Send this URL to all counsellors. That's it — they open it, fill it, submit.

---

## How to add a new counsellor
Nothing to do — the form has a **name field**. Any counsellor can use the same URL.

## How to add a new recipient
Open `app/api/send-report/route.ts` and add to the `RECIPIENTS` array:
```ts
const RECIPIENTS = [
  'siddharth.garg@mastersunion.org',
  'soma.charan@mastersunion.org',
  'new.person@mastersunion.org', // ← add here
]
```
Then redeploy (push to GitHub → Vercel auto-deploys).

## How to add a new call sub-stage
Open `lib/types.ts` and add to `APP_STAGES` or `LM_STAGES`:
```ts
{
  stage: 'Not Interested',
  subStages: [...existing..., 'New reason here'],
}
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "invalid_grant" error | Refresh token expired — redo Step 2d |
| Email not arriving | Check spam; verify GMAIL_SENDER_EMAIL is correct |
| Build fails on Vercel | Check all 4 env vars are set in Vercel dashboard |
| Form shows but submit fails | Check Vercel Function logs in dashboard |
