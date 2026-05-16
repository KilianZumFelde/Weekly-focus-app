# Phase 4 Design Notes: Weekly Carry-Over Ritual

Derived from reading all 4 triage `code.html` files before any implementation begins.

---

## Frame 1 — Last Week Recap (`triage_last_week_recap`)

### Layout structure
- Full-screen, no bottom nav, no top app bar (suppressed — transactional modal)
- Vertical flex column, content centered both axes (`flex-grow flex flex-col items-center justify-center`)
- Horizontal padding: `24px` (`px-margin-mobile`)
- Max content width: `max-w-md` (448px)

### Content (top → bottom)
1. **Header** `<h1>` — "Last week"
   - Font: Newsreader 32px/40px (headline-lg), weight 500
   - Color: `primary` (#ffb4a4 — terracotta)

2. **Stats section** (`flex flex-col gap-16px`)
   - **Raw count line** — "11/14 tasks · 3/3 habits"
     - Font: Newsreader display 40px/48px, letter-spacing tight
     - Color: `on-surface` (#e7e1de)
     - Padding: `py-8px`
   - **Streak delta line** — "Gym streak ↑ 9 weeks | Bachata streak reset"
     - Font: Inter body-lg 18px/28px
     - Color: `on-surface-variant` (#dcc0bb)
     - Layout: flex row centered with gap-2
     - Streak up: `trending_up` material icon (primary, ~20px)
     - Separator: `|` with `mx-2 opacity-30`
     - Padding: `py-8px`
   - **Goal progress block** (separated by `border-t border-outline-variant/30`, `pt-16px mt-16px`)
     - Italic label "Still working toward:" — body-md, `on-surface-variant/80`
     - Goal title — headline-md 24px/32px, on-surface
     - Dot bullet (6×6px rounded-full, primary) + "N tasks done toward it" — label-md 14px, primary
     - Layout: flex row centered, gap-2

### Fixed footer
- Position: `w-full max-w-md mx-auto p-24px pb-80px` (extra bottom pad for safe area)
- Single CTA button: "Review leftovers →"
  - `w-full h-14 bg-primary-container text-on-primary-container rounded-lg`
  - Font: label-md 14px, weight 500
  - Arrow icon: `arrow_forward` (slides right on hover)

### RN notes
- `ScrollView` not needed; content fits on screen
- Safe area: use `useSafeAreaInsets` for bottom padding instead of fixed `pb-80px`
- No back-button dismiss: `BackHandler.addEventListener('hardwareBackPress', () => true)`

---

## Frame 2 — Per-Task Triage (`triage_task_1_of_3`)

### Layout structure
- Full-screen, no nav shell
- Header pinned to top; task card + buttons centered vertically in remaining space
- Horizontal padding: `24px`
- Background: `#151311` + subtle decorative radial blurs (top-right primary/5%, bottom-left tertiary/5%)

### Header (top, `pt-32px px-24px`)
- Subtitle: "Last week's leftovers" — headline-md 24px, `on-surface-variant`, opacity 80%, centered
- Progress pill: **"N of M"** — label-md 14px, color `primary`, bg `primary/10`, `px-12px py-4px rounded-full`
- Layout: flex column, centered, gap 8px

### Task card (`bg-surface-container rounded-xl p-32px gap-16px`)
- Task title: headline-lg 32px/40px, Newsreader, `on-surface`, `leading-tight`
- Chips row (`flex flex-wrap gap-2 pt-8px`):
  - Theme chip: `bg-secondary/10 text-secondary` rounded-full label-md
  - Effort chip: `bg-on-surface-variant/10 text-on-surface-variant` rounded-full label-md
  - Return chip: `bg-tertiary/10 text-tertiary` rounded-full label-md
- Transition: `transition-all duration-300` (card animates in)

### Action buttons (flex column, gap 16px, full width — BELOW card)
**Exact order (top to bottom) — must not reorder:**
1. **Keep for this week** (primary — filled)
   - `bg-primary-container text-on-primary-container py-4 rounded-xl`
   - Icon: `push_pin` (left of text)
2. **Send to backlog** (secondary — outlined)
   - `border border-outline-variant text-on-surface-variant py-4 rounded-xl`
   - Hover: `bg-surface-variant/30`
   - Icon: `inventory_2` (left of text)
3. **Drop** (tertiary — ghost/text only)
   - No background, no border
   - `text-on-surface-variant py-4 rounded-xl opacity-60` → opacity 100 on hover
   - Icon: `delete_sweep` (left of text)

**No skip button exists. No swipe-to-dismiss. These are the only 3 affordances.**

### RN notes
- Back handler must block hardware back (same as Frame 1)
- Progress pill: `<View style={{backgroundColor: 'rgba(255,180,164,0.1)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4}}>`
- Decorative backdrop blurs: `expo-blur` or just omit (aesthetic only)
- Card transition between tasks: `Animated` or `react-native-reanimated` fade/slide; 300ms ease-in-out

---

## Frame 3 — Pull from Backlog (`triage_stock_this_week`)

### Layout structure
- Full-screen overlay (`position: absolute/fixed inset-0`, `backgroundColor: surface`)
- Flex column: fixed header → instruction → scrollable list → fixed footer CTA

### Header (`px-24px h-64px pt-16px`)
- Title: "Stock this week" — headline-md 24px, `on-surface`, **left-aligned**
- Close button: top-right, `close` material icon, `on-surface-variant` — **this frame CAN be dismissed**

### Instruction (`px-24px pt-8px pb-32px`)
- "Select items from your backlog to focus on for the upcoming ritual cycle."
- Font: body-md 16px, `on-surface-variant`, max-width 280px

### Scrollable backlog list (`flex-1 overflow-y-auto px-24px pb-128px`)
Two card states:

**Open/available card** (`bg-surface-container rounded-xl p-16px`)
- Theme chip (top-left), title (body-lg 18px, on-surface), effort/return label (label-md, on-surface-variant)
- Add button (right): `w-40px h-40px rounded-full border border-outline/30 text-primary` → `add` icon

**Added/selected card** (`bg-surface-container-high/40 rounded-xl p-16px border border-secondary/10`)
- Content opacity 60%
- Right side: "Added" text (label-md) + filled `check_circle` icon (secondary)

### Fixed footer CTA
- Gradient fade: `bg-gradient-to-t from-surface via-surface/95 to-transparent` — 32px top padding, 40px bottom padding
- "Start week" button: `w-full bg-primary-container text-on-primary-container h-14 rounded-xl`
- Button icon: `arrow_forward` right of text
- **Always enabled** — user can proceed without selecting any backlog items

### RN notes
- Scrollable list: `FlatList` with `contentContainerStyle={{ paddingBottom: 128 }}`
- Fixed footer: absolutely positioned at bottom, use `useSafeAreaInsets().bottom` for extra padding
- Close button dismisses this frame and goes to completion confirmation (not back to triage)
- Toggle add/added state locally before calling API

---

## Frame 4 — Completion Confirmation (`triage_completion_confirmation`)

### Layout structure
- Full-screen, centered both axes, `p-24px`
- No nav shell
- Radial gradient background decoration (`opacity-20`, `z-[-1]`)

### Content (centered, text-center)
1. **Icon**: `done_all` material symbol
   - Color: `primary` (#ffb4a4)
   - Size: 48px
   - Weight: 200 (very thin style)
   - Opacity: 40%
   - Margin bottom: 32px

2. **Title**: "Ready for the new week."
   - Font: Newsreader headline-lg 32px/40px
   - Color: `on-surface`

3. **Subtitle**: "Your ritual is complete. Your focus for the upcoming days has been anchored."
   - Font: Inter body-md 16px/24px
   - Color: `on-surface-variant`
   - Max-width: 280px, centered

4. **Action**: "Return to Focus →"
   - Font: label-md 14px
   - Color: `primary`, opacity 60% → 100% on tap
   - Layout: flex row with `arrow_forward` icon (18px)
   - Margin top: 32px + 32px padding-top (space above)

### Behavior
- This frame auto-advances or requires a single tap — design shows the "Return to Focus" tap as the trigger
- After tap: close modal, This Week screen loads normally

### RN notes
- After tapping "Return to Focus": call `router.dismissAll()` or `router.replace('/(tabs)')` to return to main tabs
- No back button needed here (ritual is complete)

---

## Shared Design Tokens (all frames)

| Token | Value |
|-------|-------|
| `primary` | `#ffb4a4` (terracotta salmon) |
| `primary-container` | `#dd725a` (deeper terracotta) |
| `on-primary-container` | `#560d01` |
| `on-surface` | `#e7e1de` |
| `on-surface-variant` | `#dcc0bb` |
| `surface` | `#151311` |
| `surface-container` | `#211f1d` |
| `outline-variant` | `#56423e` |
| `secondary` | `#c0caac` (sage green) |
| `tertiary` | `#e9c176` (amber) |
| Horizontal margin | `24px` |
| Corner radius (card) | `12px` (xl) |
| Corner radius (pill) | `9999px` (full) |
| Stack large | `32px` |
| Stack medium | `16px` |
| Stack small | `8px` |

---

## Frame Transitions (RN)

| From → To | Animation |
|-----------|-----------|
| App open → Frame 1 | Modal pushes up (`slide` from bottom), 300ms |
| Frame 1 → Frame 2 | Fade + slight right slide, 300ms ease-in-out |
| Frame 2 task N → task N+1 | Card fades out/in (old card exits left, new enters right), 300ms |
| Frame 2 → Frame 3 | Fade transition, 300ms |
| Frame 3 → Frame 4 | Fade, 300ms |
| Frame 4 → This Week | Modal dismisses (slide down), reveals tabs |

---

## Back-Button Behaviour

| Frame | Hardware back |
|-------|--------------|
| Frame 1 (Recap) | **Blocked** — `BackHandler` returns `true` |
| Frame 2 (Per-task) | **Blocked** — no skip or dismiss |
| Frame 3 (Backlog pull) | Close button → Frame 4 (close icon visible, back hardware still blocked) |
| Frame 4 (Confirmation) | Not needed — ritual complete |

---

## API Contract Walkthrough (PF4-02)

### All user actions mapped to endpoints

| User action | Endpoint | Status | Idempotency |
|-------------|----------|--------|-------------|
| App opens, check if flip needed | `GET /users/me` → compare `lastWeekStart` | ✅ exists | Safe (GET) |
| Trigger week flip | `POST /internal/week-flip` (header: `X-User-Timezone`) | ✅ exists | ✅ returns `alreadyFlipped: true` on repeat |
| Load triage data | `GET /tasks/triage` | ✅ exists | Safe (GET) |
| Triage: keep task | `POST /tasks/:id/triage` `{ action: "keep" }` | ✅ exists | ⚠️ not stated in contract — T045 must enforce |
| Triage: send to backlog | `POST /tasks/:id/triage` `{ action: "backlog" }` | ✅ exists | ⚠️ same |
| Triage: drop task | `POST /tasks/:id/triage` `{ action: "drop" }` | ✅ exists | ⚠️ same |
| Pull from backlog | `POST /tasks/:id/move` `{ weekAssignment: "this_week" }` | ✅ exists | ✅ idempotent by design |
| Ritual complete | — no endpoint needed; `GET /tasks/triage` → `needsTriage: false` signals done | ✅ | — |

### Gaps / flags

1. **Triage idempotency not specified**: `POST /tasks/:id/triage` contract says nothing about calling it twice. T045 must implement: if task already has triage action, return `{ ok: true, remainingCount: N }` unchanged (no duplicate state change).

2. **No explicit ritual-complete endpoint**: Intentional — the ritual completes when `needsTriage` flips to false. The mobile app should re-poll `GET /tasks/triage` after the last triage action to confirm `needsTriage: false` before advancing to Frame 3.

3. **Timezone for week flip**: `useWeekFlip` hook must read timezone with `Intl.DateTimeFormat().resolvedOptions().timeZone` and pass it as `X-User-Timezone` header. Not hardcoded.

4. **`pendingTriage` flag in `/tasks/week`**: The api.md contract for `/tasks/week` does NOT include a `pendingTriage` field. The spec text mentions it as a UX concept. The mobile app should rely on `GET /tasks/triage` → `needsTriage` instead of checking the week response. **No endpoint gap — architecture clarification only.**

All required endpoints exist. No missing endpoints need to be added before T043.
