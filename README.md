# EOD Report

A Next.js web app where counsellors fill in a daily **End of Day** calling report.
On submit, a polished HTML email is generated and sent via the Gmail API to the
configured recipients.

![Built with Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## Features

- 📋 Structured form for **App Starts** and **Lead Manager** calling activity
- 🧮 Live stage / sub-stage tables with automatic stage and grand totals
- 📞 Call statistics (total calls, outgoing, talk time)
- 💡 Free-form key insights and an overall summary
- 📧 Server-side HTML email rendering and delivery via the Gmail API (OAuth2)
- 🎨 Clean, responsive UI built with Tailwind CSS

## Tech stack

| Layer    | Choice                          |
|----------|---------------------------------|
| Framework| Next.js 14 (App Router)         |
| Language | TypeScript                      |
| Styling  | Tailwind CSS                    |
| Email    | Gmail API via `googleapis`      |
| Hosting  | Vercel                          |

## Project structure

```
app/
  api/send-report/route.ts   API route that validates input and sends the email
  layout.tsx                 Root layout
  page.tsx                   Renders the form
  globals.css                Tailwind layers + component classes
components/
  EODForm.tsx                The full client-side form
lib/
  types.ts                   Types + stage/sub-stage definitions
  emailTemplate.ts           Builds the HTML email + subject
  gmail.ts                   Gmail API send helper
```

## Quick start

```bash
npm install
cp .env.local.example .env.local   # then fill in your Gmail OAuth credentials
npm run dev                         # http://localhost:3000
```

See [SETUP.md](./SETUP.md) for full Gmail API and Vercel deployment instructions.

## Configuration

Set these environment variables (locally in `.env.local`, on Vercel in project settings):

| Variable                | Description                                   |
|-------------------------|-----------------------------------------------|
| `GOOGLE_CLIENT_ID`      | OAuth2 client ID                              |
| `GOOGLE_CLIENT_SECRET`  | OAuth2 client secret                          |
| `GOOGLE_REFRESH_TOKEN`  | OAuth2 refresh token for the sending account  |
| `GMAIL_SENDER_EMAIL`    | The Gmail address that sends the report       |

Recipients are configured in [app/api/send-report/route.ts](./app/api/send-report/route.ts).

## Deploy

Push to GitHub and import the repo into [Vercel](https://vercel.com). Add the four
environment variables above, then deploy. Full walkthrough in [SETUP.md](./SETUP.md).
