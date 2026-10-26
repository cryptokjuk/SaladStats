# Salad Stats

A mobile-friendly Progressive Web App (PWA) for keeping an eye on your [Salad](https://bit.ly/Salad-CryptoKJ) earnings on the go.

> **Unofficial fan project.** Salad Stats is not affiliated with, endorsed by, or supported by Salad Technologies. "Salad" is their trademark.

## Features

- **Dashboard**: current balance, earning rate, a count of machines currently online and recent earnings. Refreshes every 60 seconds and supports pull-to-refresh.
- **Earnings**: chart and list of the past 12 hours.
- **GPU Demand**: Salad's public GPU demand feed, with search, tier filters and sorting.
- **Settings**: session info, sign out, and light/dark/device appearance.
- **Installable PWA**: works on phones, with an offline fallback page and app icons.

## Privacy & security model

Salad Stats has **no database and no user accounts**. It does not store anything about you on the server.

1. You enter your Salad email. Salad emails you a one-time code, and the app checks it with Salad's API. Your Salad password is never seen.
2. Salad returns its own session cookies. The app compresses and **encrypts** them (AES-256-GCM, key derived from your `AUTH_SECRET`) and puts them in an `httpOnly`, `Secure`, `SameSite=Lax` cookie on **your own device**. JavaScript in the page cannot read it, and it is unreadable without the server's secret.
3. The cookie has no expiry date, so it disappears when you close the app or browser, and it also carries a hard **10-minute** limit. After that you sign in again.
4. **Sign out** deletes the cookie immediately.
5. Every stats/demand API route requires a valid session, and the sign-in route rejects cross-site requests.

The app talks to Salad's API at `https://app-api.salad.com`. This API is undocumented, so Salad may change it at any time.

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, next-themes.

## Getting started

You need Node.js 20.9 or newer and Yarn. No database is needed.

```bash
# 1. Install dependencies
yarn install

# 2. Configure environment
cp .env.example .env
#    then edit .env and set AUTH_SECRET to a long random value:
#    openssl rand -base64 32

# 3. Run it
yarn dev                    # development, http://localhost:3000
# or
yarn build && yarn start    # production
```

> Sign-in cookies are marked `Secure`, so in production the site must be served over **HTTPS**.

### Environment variables

| Variable | Required | What it does |
| --- | --- | --- |
| `AUTH_SECRET` | Yes | Encrypts the sign-in cookie. At least 32 random characters. Keep it private. Changing it signs everyone out. |
| `SITE_URL` | No | Your public address, used for social previews, robots.txt and the sitemap. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Turns on Google Analytics 4 with your own ID. Leave empty for no analytics. |

### Android app (optional)

To package the PWA as an Android app (for example with [PWABuilder](https://www.pwabuilder.com)), add your own `public/.well-known/assetlinks.json` with **your** package name and signing-key fingerprint.

## Security notes

- Never commit your `.env` file. It is already in `.gitignore`.
- Use a different `AUTH_SECRET` for every deployment.

## Licence

[MIT](LICENSE) — free to use, modify and distribute.

## Credits

Built by [CryptoKJ](https://x.com/CryptoKj_UK) & AI. If you find it useful, you can [buy me a coffee](https://buymeacoffee.com/cryptokj).
