<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 (initial ratification, replacing blank template)
Added sections: All six principles + Development Constraints + Governance
Modified principles: N/A (initial)
Removed sections: N/A (initial)

Templates reviewed:
  ✅ .specify/templates/plan-template.md — Constitution Check gate compatible; no changes needed
  ✅ .specify/templates/spec-template.md — No structural conflicts
  ✅ .specify/templates/tasks-template.md — Phase conventions compatible; no changes needed

Follow-up TODOs:
  - spec.md Assumptions section updated to reflect client-server architecture
    (was incorrectly "single device, no cloud persistence")
-->

# Weekly Focus Constitution

## Core Principles

### I. The Stack Is Fixed

The technology choices below are decided and MUST NOT be changed without a
constitution amendment. They are the foundation every plan and task is built on.

**Mobile app**: Expo (React Native) — targets iOS and Android from one codebase.

**Backend API**: Node.js with Hono (or Express) — a REST API hosted on Render.com.
This layer owns all business logic. The mobile app MUST NOT bypass it.

**Database**: Supabase (PostgreSQL) — the authoritative store for all user data.
Accessed only from the backend API, never directly from the mobile app.

**Authentication**: Supabase Auth — handles user identity and sessions.

**AI**: Claude API (Anthropic) — `claude-haiku-4-5` for voice parsing (fast, cheap);
`claude-sonnet-4-6` for the Goal Coach (better reasoning). Model selection is
configurable via environment variable so it can be changed without a code change.

**Language**: TypeScript — used in both the mobile app and the backend API.
Strict mode is on everywhere. `any` types are not allowed without a written
comment explaining why no typed alternative exists.

### II. The Mobile App Talks to the API — Never to the Database

The mobile app is a client. It displays data and sends user actions to the
backend. It MUST NOT contain business logic or talk to Supabase directly.

- All data reads and writes go through the REST API on Render.
- All business rules (streak calculation, goal cap enforcement, week flip,
  danger-zone formula, priority scoring) live in the backend — never in the app.
- The AI service (Claude API) is called from the backend only. The mobile app
  MUST NOT hold the Claude API key or call Claude directly.
- The database is accessed from the backend only. Supabase Row Level Security
  (RLS) is enabled on every table as a defense-in-depth measure, even though
  the app never touches the DB directly.

### III. Secrets Never Leave the Server

No API keys, database credentials, or tokens are ever stored in the mobile app
or committed to the repository.

- All secrets live in environment variables on the server (Render.com dashboard).
- The mobile app communicates with the backend using short-lived session tokens
  issued by Supabase Auth — never with raw database credentials.
- `.env` files are gitignored. A `.env.example` with placeholder values documents
  what variables are required.

### IV. Always Online in v1 — No Offline Complexity

The app requires an internet connection to function. There is no local cache,
no sync queue, and no conflict resolution logic in v1.

- If the device has no connection, the app shows a clear error state.
- Offline capability may be added in a future version, but MUST NOT be
  partially implemented now — half-built sync is worse than none.
- This constraint keeps v1 simple and shippable.

### V. Integration-First Testing

Tests exercise real behavior through the full stack. Mocking the database or
the API is not allowed in integration tests because it hides the bugs that
most commonly break things in production.

- **Integration tests** are the primary test type. They run against a real
  test database (a separate Supabase project or a local PostgreSQL instance)
  and verify complete user journeys end-to-end.
- **Unit tests** are used only for pure functions that have no side effects:
  the effort/return priority scoring matrix, streak increment/reset logic,
  the habit danger-zone formula (`count_remaining + 1 ≥ days_left`), and
  week-boundary date arithmetic.
- The following behaviors MUST have an integration test before the feature
  is considered complete: Sunday flip (streak update, archiving, carry-over
  flag), goal cap enforcement (all three cap scenarios), habit delete with
  history wipe, and reminder auto-cancel on task completion.

### VI. Keep It Simple — Build Only What Is Needed

This is a solo personal app built by one person. Complexity that exists to
handle scale, teams, or hypothetical future requirements is waste.

- No feature flags, no A/B testing infrastructure, no multi-tenancy.
- No premature abstraction: three similar functions are better than a
  framework built to generalize them.
- No half-built features: a capability is either complete and working or it
  is not in the codebase yet.
- When two approaches solve the same problem, the simpler one wins unless
  there is a documented reason the simpler approach breaks down here.

## Privacy & Personal Data

- Test fixtures, seed scripts, and documentation examples MUST use clearly
  fictional placeholder data (e.g. "Buy milk", "Guitar practice", "Jane Doe").
- Real personal information — actual goal titles, habit names, theme names,
  email addresses, or any data that could identify the user — MUST NOT appear
  in any script, fixture, or example without the user's explicit confirmation
  first.
- Before generating or running anything that would use, display, or store
  personal data (including during setup or onboarding steps), Claude MUST ask
  the user first.

## Implementation Progress Tracking

Every implementation session MUST begin by reading `tasks.md` to determine
the current phase and the next unchecked task. This is the primary mechanism
for surviving context loss between sessions.

- **Mark tasks done immediately**: change `- [ ]` to `- [x]` the moment a
  task is complete — never batch completions.
- **`tasks.md` is the source of truth** for progress. Git history and
  conversation summaries are secondary. If they conflict, `tasks.md` wins.
- **CLAUDE.md must reference `tasks.md`**: the agent context file must
  always point to both `plan.md` (architecture) and `tasks.md` (progress)
  so any new session can orient itself without reading the full conversation.
- **Commit after each phase**: completed phases are committed to git before
  the next phase begins, so task state is recoverable from the repo.

## Development Constraints

- **Formatting & linting**: ESLint and Prettier are configured in the repo
  and enforced. Code that does not pass linting MUST NOT be merged.
- **API versioning**: all backend routes are prefixed `/v1/` so future
  breaking changes can be introduced cleanly without removing old clients.
- **Error responses**: the API returns consistent JSON error shapes
  `{ error: string, code: string }` — never raw database errors or stack
  traces to the client.
- **No direct SQL strings** in application code — use the Drizzle ORM query
  builder for all database access to prevent SQL injection by construction.
- **Expo SDK**: pin to a stable release. Upgrades are a dedicated task,
  not a drive-by change.

## Governance

- This constitution supersedes all other conventions and prior decisions.
  When the constitution conflicts with a plan or task, the constitution wins.
- **To amend the constitution**: update this file, bump the version, re-run
  `/speckit-constitution` to propagate changes to templates and plans.
- **Versioning rules**:
  - MAJOR — removing or redefining a principle in a way that breaks existing
    decisions (e.g., switching the database, removing a principle)
  - MINOR — adding a new principle or materially expanding guidance
  - PATCH — clarifications, wording fixes, examples added
- Every implementation plan (`/speckit-plan`) MUST include a Constitution
  Check section verifying that the planned approach complies with each
  principle above before implementation begins.
- Deviations from any principle MUST be documented in the plan's Complexity
  Tracking table with: the principle violated, why it is necessary here, and
  what simpler alternative was considered and rejected.

**Version**: 1.1.0 | **Ratified**: 2026-05-15 | **Last Amended**: 2026-05-15
