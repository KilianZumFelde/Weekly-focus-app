# Research: Weekly Focus App

**Branch**: `002-weekly-focus-app` | **Date**: 2026-05-15

All decisions resolved from spec, constitution, and discovery documents.
No external research required — no NEEDS CLARIFICATION items remained.

---

## Decision Log

### Voice Input → Speech-to-Text

**Decision**: Device-native speech recognition via `@react-native-voice/voice`.

**Rationale**: The transcribed text string is what Claude needs — there is no
reason to upload audio. Device-native STT is free, low-latency, works in the
user's language automatically, and requires no audio upload infrastructure or
Whisper API costs. The transcribed string is sent to the backend which calls
Claude to parse intent.

**Alternatives considered**:
- Expo AV + Whisper API (OpenAI) — adds audio upload, storage, and cost with
  no UX benefit for this use case.
- expo-speech — text-to-speech, not speech-to-text; wrong direction.

---

### Week Flip Triggering

**Decision**: App-triggered on first open after Sunday 00:00 local time.
The mobile app compares the current local date to the last known `week_start`
stored in the user profile. If a new Sunday has passed, it calls
`POST /v1/internal/week-flip` (authenticated as the user). The server receives
the user's timezone in the request header and validates it server-side.

**Rationale**: Single-user app — no need for a server-side per-user cron that
checks timezones for thousands of users. App-triggered is simpler, cheaper,
and equally reliable for a solo user who opens the app at least once per week.

**Alternatives considered**:
- Server-side cron per user timezone — overkill for single user; complex
  timezone arithmetic on the server with no UX benefit.
- Clock-based server cron at midnight UTC — wrong; the user's local midnight
  could be any UTC offset.

---

### Render Free Tier — Keep-Alive Strategy

**Decision**: Use **UptimeRobot** (free) to ping the API health endpoint
(`GET /v1/health`) every 5 minutes. This prevents Render's free tier from
putting the service to sleep. No cost, no code changes needed — configured
entirely in the UptimeRobot dashboard.

**Alternatives considered**:
- Render paid tier ($7/month always-on) — valid but unnecessary while
  UptimeRobot solves the problem for free.

---

### Habit Danger-Zone Nudge & Reminder Scheduling

**Decision**: A single Render.com Cron Job runs every 15 minutes. It:
1. Checks pending task reminders with `fire_at ≤ now` and sends push notifications.
2. At 09:00 local (using stored user timezone), evaluates habit danger zones and sends nudges.

Push notifications are delivered via **Expo Push Notification Service** backed by
**Firebase Cloud Messaging (FCM)** — Android only. Free with no meaningful limits
for a single user. The backend stores the user's `expo_push_token` in the user profile.

**Rationale**: Task reminders need sub-hour granularity (spec says one-shot
at specific times like "9am Thursday"). 15-minute polling is close enough for
a personal app without over-engineering. Android-only means no APNS certificates
or Apple Developer account needed — FCM setup via Expo is straightforward.

**Alternatives considered**:
- Per-reminder scheduled jobs (BullMQ, etc.) — unnecessary infrastructure for
  a solo app; polling is simpler and sufficient.
- Hourly cron — too coarse for task reminders; user sets "9am Thursday" and
  fires at 10am instead.

---

### AI Goal Coach — Streaming vs. Request/Response

**Decision**: **Server-Sent Events (SSE)** streaming for the Goal Coach
(`POST /v1/ai/coach` returns `text/event-stream`). Regular JSON response
for voice parsing (`POST /v1/ai/parse`).

**Rationale**: The Coach is a conversational interface — streaming gives the
user the "typing" feel that makes it feel responsive. Voice parsing returns a
small structured JSON object where streaming adds no UX value.

**Alternatives considered**:
- Full request/response for Coach — user waits several seconds with no
  feedback; poor UX for a conversational interface.
- WebSocket for Coach — heavier protocol; SSE is simpler and sufficient for
  unidirectional server→client streaming.

---

### Monorepo vs. Separate Repos

**Decision**: **Single repository with two top-level packages** (`mobile/` and `api/`)
plus a minimal `shared/` folder for TypeScript types. No monorepo build tooling
(Turborepo, Nx, etc.).

**Rationale**: Type sharing between mobile and API is the main benefit. A simple
`shared/types.ts` file symlinked or path-mapped avoids duplicating API response
shapes. No build tooling is needed because neither package builds the other.

**Alternatives considered**:
- Two separate repos — no type sharing; API response shapes duplicated; higher
  risk of mobile/API type drift.
- Turborepo monorepo — overkill for two packages with one developer.

---

### App Distribution — Android APK via EAS Build

**Decision**: Build a standalone Android APK using **EAS Build** (Expo Application
Services free tier: 30 builds/month). Install the APK directly on the Android
device (sideloading — no Play Store, no review process). Rebuild and reinstall
when adding significant new features.

**Rationale**: Personal-use-only, Android-only app. No App Store submission ever.
No Apple Developer account ($99/year) needed. EAS Build free tier is more than
sufficient. Sideloading on Android requires enabling "Install from unknown sources"
once in Android settings.

**Alternatives considered**:
- Expo Go only — requires keeping a dev server running; not suitable for
  day-to-day use as a real app.
- Local build with Android Studio — more complex setup; EAS Build is simpler.

---

### Authentication Flow

**Decision**: **Supabase Auth** handles all authentication. The mobile app uses
the Supabase JS SDK (`@supabase/supabase-js`) to sign in and obtain a JWT
session token. Every API request includes `Authorization: Bearer <jwt>`. The
Hono backend verifies the JWT using Supabase's public key (via `@supabase/supabase-js`
or direct JWT verification). The mobile app never holds a Supabase service role key.

**Rationale**: Supabase Auth is already in the stack. JWT verification in Hono
is a one-liner middleware. No custom auth needed.

**Note**: v1 targets a single named user — no public registration flow is
implemented. The user creates their account directly in Supabase dashboard.

---

### `return` Column Naming

**Decision**: The task field named `return` in the spec is stored as
`return_level` in the database to avoid collision with SQL reserved words and
JavaScript/TypeScript `return` keyword. Exposed as `returnLevel` in API JSON.

---

### Uncategorized Theme

**Decision**: Seeded automatically on user profile creation. Stored as a
regular Theme row with `is_system: true` flag. Cannot be renamed, recolored,
or deleted. Appears last in theme lists.
