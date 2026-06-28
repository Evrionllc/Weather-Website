# Skyline — Weather Analytics Dashboard

A modern, single-page weather dashboard built with React + TypeScript. It pulls
live data from [Open-Meteo](https://open-meteo.com/) and presents current
conditions, hourly and 10-day forecasts, interactive charts, an animated
precipitation radar, air quality, sun/moon data, and derived analytical
insights — all behind adaptive theming that shifts with the weather and time of
day.

> Portfolio note: the architecture keeps data/logic (`src/api`, `src/lib`,
> `src/hooks`) cleanly separated from UI so the same core can later power a Tauri
> desktop app or a React Native / Expo mobile app.

## Features

- **Live data** — current, hourly (24h) and daily (10-day) forecasts from Open-Meteo.
- **Charts** — temperature curve + precipitation bars (Recharts, responsive & labelled).
- **Animated radar** — Leaflet map with OpenStreetMap tiles and a RainViewer
  precipitation overlay, play/pause and a frame scrubber, with required attribution.
- **Air quality** — US AQI with a pollutant breakdown and plain-language health note.
- **Sun & moon** — sunrise/sunset, a daylight arc, day length, and a locally
  computed moon phase.
- **Derived insights** — a *running-conditions score* and *UV-exposure guidance*,
  both computed from raw fields the API doesn't expose directly (`src/lib/insights.ts`).
- **Natural-language summary** — a one-line "what this actually means" sentence.
- **Adaptive theming** — palette derived from condition + day/night, plus
  auto/light/dark modes; respects `prefers-reduced-motion`.
- **Location** — opt-in browser geolocation, geocoding search with autocomplete,
  and `localStorage`-persisted favorites and unit/theme preferences.
- **Robust states** — every async surface handles loading, error and success.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · TanStack Query · Recharts ·
Leaflet · Framer Motion · Lucide icons · Vitest.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the dev server with HMR            |
| `npm run build`     | Type-check (`tsc -b`) and build for prod |
| `npm run preview`   | Preview the production build locally     |
| `npm run test`      | Run unit tests once (Vitest)             |
| `npm run test:watch`| Run unit tests in watch mode             |
| `npm run lint`      | Lint with Oxlint                         |

No API key is required — Open-Meteo is keyless for non-commercial use.

## Project structure

```
src/
├── api/         # Open-Meteo + RainViewer clients (fetch wrapper, typed)
├── hooks/       # useWeather (TanStack Query), geolocation, persisted state…
├── lib/         # Pure logic: formatting, theming, AQI, moon, derived insights
├── components/  # Cards + UI primitives (ui/)
├── types/       # API response types
├── App.tsx      # Layout, data wiring, adaptive theming
└── main.tsx     # QueryClientProvider entry
```

## Deployment

Deploys as a static SPA on **Vercel** or **Netlify** (configs included:
`vercel.json`, `netlify.toml`). Push to GitHub, import the repo, and the host
builds with `npm run build` and serves `dist/`. No environment variables are
needed for the default Open-Meteo setup.

If you switch to a provider whose key must stay secret, move those calls into a
serverless function and store the key as a **server-side** env var in the host's
dashboard — never in client code. See `.env.example`.

## Attribution & licensing

This project is built to respect every source's terms — re-verify them yourself,
as licenses change:

- **Weather & air quality:** [Open-Meteo](https://open-meteo.com/), data under
  CC BY 4.0. Attribution is shown in the footer.
- **Map tiles:** © [OpenStreetMap](https://www.openstreetmap.org/copyright)
  contributors (attribution shown on the radar card).
- **Radar:** [RainViewer](https://www.rainviewer.com/) free API (attribution shown).
- **Reverse geocoding:** OpenStreetMap Nominatim — used sparingly (one call after
  a geolocation request); review their usage policy before heavy use.
- **Icons:** [Lucide](https://lucide.dev/) (ISC license).
- **Font:** Inter via Google Fonts (SIL Open Font License).

Don't strip the in-app attributions, and confirm current terms before any
commercial use.
