# Salad Stats

A mobile-friendly Progressive Web App (PWA) for keeping an eye on your [Salad](https://salad.com) earnings on the go.

> **Unofficial fan project.** Salad Stats is not affiliated with, endorsed by, or supported by Salad Technologies. "Salad" is their trademark.

## Features

- **Dashboard**: current balance, earning rate, a count of machines currently online and recent earnings. Refreshes automatically every 60 seconds and supports pull-to-refresh.
- **Earnings**: chart and list of the past 12 hours.
- **GPU Demand**: Salad's public GPU demand feed, with search, tier filters and sorting.
- **Settings**: connect or disconnect your Salad account, plus light/dark/device appearance.
- **Installable PWA**: works on phones, with offline fallback page and app icons.

## How sign-in works

You sign in with your Salad email. Salad emails you a one-time code, and the app verifies it with Salad's API. The app then stores **only** the Salad session cookies it needs to read your stats, on the server, in your own database. Your Salad password is never seen or stored.

The app talks to Salad's API at `https://app-api.salad.com`. This API is undocumented, so Salad may change it at any time.

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Auth.js (NextAuth v5), Prisma + PostgreSQL, Recharts.

## Getting started

You need Node.js 20.9 or newer, Yarn, and a PostgreSQL database.

```bash
# 1. Install dependencies (also generates the Prisma client)
yarn install

# 2. Configure environment
cp .env.example .env
#    then edit .env: set DATABASE_URL and a random AUTH_SECRET / NEXTAUTH_SECRET
#    (generate one with: openssl rand -base64 32)

# 3. Create the database tables
yarn prisma db push

# 4. Run it
yarn dev          # development, http://localhost:3000
# or
yarn build && yarn start   # production
```

### Optional settings

| Variable | What it does |
| --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Turns on Google Analytics 4 with your own measurement ID. Leave empty to disable analytics. |
| `SEED_TEST_EMAIL` / `SEED_TEST_PASSWORD` | Running `yarn prisma db seed` creates an email/password test account with these details. |

### Android app (optional)

To package the PWA as an Android app (for example with [PWABuilder](https://www.pwabuilder.com)), add your own `public/.well-known/assetlinks.json` containing **your** package name and signing-key fingerprint.

## Security notes

- Never commit your `.env` file. It is already in `.gitignore`.
- All Salad and stats API routes require a signed-in session.

## Licence

[MIT](LICENSE) — free to use, modify and distribute. If you do something cool with it, a shout-out is always appreciated but never required.

## Credits

Built by [CryptoKJ](https://x.com/CryptoKj_UK) & AI. If you find it useful, you can [buy me a coffee](https://buymeacoffee.com/cryptokj).
