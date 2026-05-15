# Quickstart: Weekly Focus App

**For**: Developer setting up the project for the first time.
**Stack**: Expo (React Native) + Hono API on Render + Supabase (PostgreSQL)

---

## Prerequisites

- Node.js 20+
- npm 10+
- Expo Go app on your phone (for mobile testing)
- A Supabase account (free tier works)
- A Render.com account (free tier works)
- An Anthropic account (for Claude API key)

---

## 1. Clone and install

```bash
git clone <repo-url>
cd weekly-focus

npm install              # installs root workspace deps
cd api && npm install    # install API deps
cd ../mobile && npm install  # install mobile deps
```

---

## 2. Set up Supabase

1. Create a new Supabase project at supabase.com
2. Go to **Settings → Database** and copy the connection string (use the
   "Session mode" URI — port 5432)
3. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this secret — API only)
4. Go to **Authentication → Providers** and enable Email auth
5. Create your user account manually: **Authentication → Users → Invite user**

---

## 3. Configure environment variables

**API** — create `api/.env`:
```
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
CRON_SECRET=any-random-string-you-choose
```

**Mobile** — create `mobile/.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000/v1
EXPO_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 4. Run database migrations

```bash
cd api
npm run db:migrate    # runs Drizzle migrations against your Supabase DB
npm run db:seed       # seeds default themes for your user
```

---

## 5. Run the API locally

```bash
cd api
npm run dev           # starts Hono on http://localhost:3000
```

Verify: `curl http://localhost:3000/v1/themes -H "Authorization: Bearer <your-jwt>"`
(Get the JWT by signing in via Supabase Auth in the mobile app and logging it.)

---

## 6. Run the mobile app

```bash
cd mobile
npx expo start        # opens Expo dev tools
```

Scan the QR code with Expo Go on your phone.
The app connects to `EXPO_PUBLIC_API_URL` (your local API by default).

---

## 7. Deploy the API to Render

1. Push the repo to GitHub
2. Create a new **Web Service** on Render pointing to the `api/` directory
3. Set the same environment variables from step 3 in Render's dashboard
4. Set **Build command**: `npm install && npm run build`
5. Set **Start command**: `npm run start`
6. Create a **Cron Job** on Render:
   - Command: `npm run jobs:run`
   - Schedule: `*/15 * * * *` (every 15 minutes)

---

## 8. Update mobile for production

Change `mobile/.env`:
```
EXPO_PUBLIC_API_URL=https://your-api.onrender.com/v1
```

Build for TestFlight/Play Store via `eas build` (Expo Application Services).

---

## Validation Checklist

- [ ] `GET /v1/themes` returns 5 pre-seeded themes
- [ ] Voice capture parses "Gym 4 times a week" into a Habit draft with target=4
- [ ] Completing a task shows an Undo snackbar
- [ ] Sunday: first app open triggers carry-over ritual
- [ ] Habit increment at target shows gold glow
- [ ] Goal Coach streams a response and produces a "Create this goal" button
