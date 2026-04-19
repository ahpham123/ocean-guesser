# OceanGuesser

A GeoGuessr-style game focused entirely on oceans and coastlines. Test your knowledge of the world's shores and open seas across two distinct game modes.

## Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Supabase (Postgres)
- **Street View**: Google Maps JavaScript API (easy mode)
- **Satellite Imagery**: Local images (hard mode)
- **Guess Map**: Mapbox GL JS

## Game Modes

**Easy** — Explore real coastal locations using interactive Google Street View panoramas. Look around 360° and drop a pin on the world map to make your guess.

**Hard** — Identify your location from a satellite image of the open ocean. No landmarks, no coastlines — just water.

## Features
- 5 rounds per game with a 60 second timer per round
- Interactive Street View panorama for easy mode (pan and zoom, no movement)
- Satellite imagery sourced from local files for hard mode
- Mapbox satellite guess map with pin placement
- After submitting a guess, the correct location and your guess are both shown on the map with a line drawn between them
- Score calculated using haversine distance — closer guesses score higher, up to 5000 points per round (25000 max)
- Unique locations per game session — no duplicate images
- Invalid or uncovered Street View locations are automatically replaced mid-session
- Score-based result messages that vary by difficulty and performance
- Confetti celebration for high scores
- Leaderboard per mode showing top 10 scores
- Submit your name to the leaderboard after finishing a game
- Your rank is shown after submitting

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

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Database

Two tables in Supabase Postgres:

**locations** — pre-seeded library of coordinates used in gameplay
| column | type | description |
|--------|------|-------------|
| id | uuid | primary key |
| lat | decimal | latitude |
| lng | decimal | longitude |
| ocean | text | ocean name |
| mode | text | easy or hard |
| heading | int | Street View heading (easy only) |
| image_filename | text | local image file (hard only) |

**scores** — leaderboard entries written after each completed game
| column | type | description |
|--------|------|-------------|
| id | uuid | primary key |
| player_name | text | name entered by player |
| score | int | final score out of 25000 |
| mode | text | easy or hard |
| created_at | timestamptz | submission time |

## Scoring
| Distance | Score |
|----------|-------|
| 0 km | 5000 |
| 500 km | 2840 |
| 1000 km | 1839 |
| 2000 km | 676 |
| 5000 km | 82 |
| 10000 km | 3 |

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |