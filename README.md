# CarbonTwin AI

CarbonTwin AI helps individuals understand, track, and reduce their carbon footprint through simple daily actions and personalized climate insights.

## Problem Statement

People often want to reduce their climate impact, but carbon data can feel technical, guilt-heavy, and hard to act on. CarbonTwin AI turns everyday lifestyle choices into readable footprint estimates, daily tracking, budgets, missions, and AI-supported suggestions.

## Solution Overview

CarbonTwin AI is a full-stack personal climate intelligence app. Users create a baseline footprint, track daily actions through Eco Quest, review dashboards and budgets, receive AI Coach recommendations, complete missions, and grow a CarbonTwin avatar as their habits improve.

## Key Features

- Baseline carbon footprint calculator with bill upload, payment screenshot estimation, manual units, and smart estimate flows
- Daily Eco Quest quick and detailed logging with no-travel and no-shopping options
- Dashboard analytics with category breakdowns, empty states, progress, and carbon equivalents
- AI Eco Coach with Gemini support and rule-based fallback grounded in stored user data
- Carbon budget planner with baseline-aware suggestions
- Missions, proof validation, rewards, badges, and inline proof status UX
- CarbonTwin avatar/world, leaderboard, battles, profile, and goal setting
- JWT auth, protected routes, onboarding-aware redirects, and MongoDB persistence

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React
- Backend: Node.js, Express, TypeScript, Mongoose, Zod, JWT, bcrypt
- Database: MongoDB, with development-only in-memory fallback
- AI/OCR: Google Gemini optional, Tesseract.js/PDF text extraction for supported uploads

## Architecture

```text
client/
  src/components/    Shared UI and feature components
  src/context/       Auth context
  src/lib/           API, types, shared frontend utilities
  src/pages/         Route-level screens
  src/services/      Frontend API clients
  src/styles.css     Global styles

server/
  src/config/        Environment and database setup
  src/controllers/   Controller-level request handlers where used
  src/middleware/    Auth middleware
  src/models/        Mongoose models and indexes
  src/routes/        API route groups
  src/services/      Business logic, validation, AI/OCR, persistence helpers
  src/tests/         Node test runner coverage for key utilities
  src/utils/         Carbon math, budget math, scoring, dates
```

## Setup

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
```

For real persistence, set `MONGODB_URI`. If it is omitted in development, the server uses in-memory data and prints a warning.

## Environment Variables

Server (`server/.env`):

```bash
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:5174
MONGODB_URI=mongodb+srv://username:password@cluster.example.mongodb.net/carbontwin
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=
```

Client (`client/.env`):

```bash
VITE_API_BASE_URL=http://localhost:4000/api
```

`JWT_SECRET` is required in production. `GEMINI_API_KEY` is optional; without it, AI Coach uses deterministic fallback recommendations from user data.

## How To Run

Frontend and backend together:

```bash
npm run dev
```

Separately:

```bash
npm run server
npm run dev --workspace client -- --host 127.0.0.1 --port 5174
```

Production build checks:

```bash
npm run typecheck
npm run test
npm run build
npm run build --workspace server
npm start --workspace server
```

Useful local URLs:

- Frontend: `http://127.0.0.1:5174`
- Backend API: `http://localhost:4000/api`
- Health check: `http://localhost:4000/api/health`

## Testing Checklist

Automated:

- Carbon calculator utility estimates category totals
- Budget split and usage summaries
- Electricity payment screenshot extraction rules
- Mission proof expected-proof guidance
- Public leaderboard scoring output

Manual:

1. Signup, login, logout, and login persistence
2. Onboarding: welcome, profile, calculator baseline, goal, budget, first Eco Quest
3. Calculator: bill upload, payment screenshot, manual units, smart estimate
4. Eco Quest: no travel, low/medium/high travel, no shopping, save, refresh
5. Dashboard: empty state, baseline state, logged-data state
6. Budget planner: suggested budget, save, refresh
7. AI Coach: Gemini when configured, fallback when missing
8. Missions: start, proof upload, rejected/needs-review/verified status, claim reward
9. Shop purchase/equip and profile display
10. Battles create/join/progress
11. Leaderboard and profile privacy display
12. Logout/login data persistence with MongoDB

## Security Notes

- Passwords are hashed with bcrypt.
- JWT signing uses `JWT_SECRET`; production startup fails if it is missing.
- User-specific APIs use auth middleware and `req.user.id`.
- Public responses use sanitized user objects and do not expose `passwordHash`.
- CORS uses `CLIENT_URL`; local dev origins are allowed only outside production.
- Uploads validate file type and size.
- Bill/payment uploads are temporary and deleted after validation.
- Mission proof uploads are validated from temp files; only metadata and extracted validation snippets are stored.
- Do not commit `.env`, API keys, MongoDB URIs, JWT secrets, `uploads/`, `dist/`, or `node_modules/`.

## Accessibility Notes

- Core form inputs and selects use visible labels.
- Option cards are keyboard-accessible buttons with focus states and pressed state.
- Icon-only layout buttons include accessible labels where used.
- Error messages are visible text, not color-only indicators.
- Mission proof validation status appears inline near the mission action.
- Landing page, dashboard, calculator, Eco Quest, budget, and missions use headings and helper text for option groups.

## Problem Alignment

- Understand: baseline calculator, dashboard category breakdowns, carbon equivalents, and profile goals.
- Track: Eco Quest, daily history, budget planner, streaks, missions, and progress.
- Reduce: AI Coach, missions, budget suggestions, goals, and actionable no-guilt recommendations.
- Simple actions: quick logs, no-travel/no-shopping choices, guided calculator flows, and mission cards.
- Personalized insights: dashboard and coach outputs are based on each user’s saved baseline, logs, goals, and mission state.

Gamification exists to support behavior change and carbon reduction; user-specific stats stay inside authenticated pages.

## Repository Size Notes

The repository is configured to exclude generated and large local artifacts:

- `node_modules/`
- `dist/` and `build/`
- `.env*`
- `uploads/`
- temp/cache/coverage/log files
- local OCR `*.traineddata`

Before submission:

```bash
git status --short
find . -maxdepth 3 -type f -size +1M -not -path './node_modules/*' -not -path './.git/*'
```

Only source, config examples, lockfiles, and documentation should be committed.

## Future Improvements

- Add broader integration tests for authenticated workflows.
- Add rate limiting for auth and upload endpoints before public deployment.
- Add object storage with signed URLs if long-term proof file retention is required.
- Add code splitting for the largest frontend chunks.
- Add deeper accessibility testing with automated tooling.
