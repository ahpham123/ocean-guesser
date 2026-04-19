# 🌊 Ocean Guesser

GeoGuessr-style game for oceans and shorelines.

## Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Auth + DB**: Supabase (Postgres)
- **Maps**: Mapbox GL JS
- **Images**: Google Street View API (easy), Mapbox Satellite (hard)

## Getting Started

1. Clone the repo and install dependencies:
```bash
   git clone https://github.com/YOUR_ORG/ocean-guesser.git
   cd ocean-guesser
   npm install
```

2. Copy `.env.example` to `.env.local` and fill in your keys:
```bash
   cp .env.example .env.local
```

3. Run the dev server:
```bash
   npm run dev
```

## Branch Strategy
- `main` — production only, protected
- `dev` — integration branch, open PRs here
- `feature/*` — your work goes here

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |