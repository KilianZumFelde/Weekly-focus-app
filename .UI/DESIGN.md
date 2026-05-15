---
name: The Analog Digital
colors:
  surface: '#151311'
  surface-dim: '#151311'
  surface-bright: '#3b3936'
  surface-container-lowest: '#100e0c'
  surface-container-low: '#1d1b19'
  surface-container: '#211f1d'
  surface-container-high: '#2c2927'
  surface-container-highest: '#373432'
  on-surface: '#e7e1de'
  on-surface-variant: '#dcc0bb'
  inverse-surface: '#e7e1de'
  inverse-on-surface: '#32302e'
  outline: '#a48b86'
  outline-variant: '#56423e'
  surface-tint: '#ffb4a4'
  primary: '#ffb4a4'
  on-primary: '#5f1505'
  primary-container: '#dd725a'
  on-primary-container: '#560d01'
  inverse-primary: '#9d422e'
  secondary: '#c0caac'
  on-secondary: '#2b331e'
  secondary-container: '#434c35'
  on-secondary-container: '#b2bc9e'
  tertiary: '#e9c176'
  on-tertiary: '#412d00'
  tertiary-container: '#af8b47'
  on-tertiary-container: '#382700'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a4'
  on-primary-fixed: '#3d0500'
  on-primary-fixed-variant: '#7e2b19'
  secondary-fixed: '#dce7c7'
  secondary-fixed-dim: '#c0caac'
  on-secondary-fixed: '#161e0a'
  on-secondary-fixed-variant: '#414a33'
  tertiary-fixed: '#ffdea5'
  tertiary-fixed-dim: '#e9c176'
  on-tertiary-fixed: '#261900'
  on-tertiary-fixed-variant: '#5d4201'
  background: '#151311'
  on-background: '#e7e1de'
  surface-variant: '#373432'
typography:
  display:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  numbers:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  margin-mobile: 24px
  gutter-mobile: 16px
  stack-lg: 32px
  stack-md: 16px
  stack-sm: 8px
---

## Brand & Style

The design system is rooted in the "Analog Digital" philosophy—a marriage of the tactile, focused experience of a high-quality paper notebook with the efficiency of modern technology. It rejects the frantic, dopamine-driven patterns of traditional productivity apps in favor of a "quietly-serious" atmosphere.

The style is a blend of **Minimalism** and **Tactile** design. It prioritizes generous negative space to reduce cognitive load and uses a warm, earthy palette to evoke a sense of calm and permanence. Every interaction is intentional and anti-gamification; there are no flashy animations or urgent badges—only soft transitions and steady, reliable feedback.

## Colors

The palette is designed to feel like natural materials—ink, paper, clay, and leaf. 

- **Dark Mode (Default):** Uses a deep charcoal with a heavy brown undertone (#1a1816) as the base to reduce eye strain. Surface containers use a slightly elevated warm gray (#262320) to create depth without harsh borders.
- **Light Mode:** Shifts to a warm off-white cream (#faf8f5) reminiscent of heavy-stock vellum, providing a soft contrast that avoids the sterile "clinical white" of standard UIs.
- **Accents:** The primary terracotta (#BF5B45) is used for active states and critical actions. Sage (#8C967A) provides a calm "complete" state. Warm Gold is reserved for milestones and streaks, treated as a "gilded" reward rather than a loud notification.

## Typography

Typography is the primary vehicle for the design system's "literary" feel.

- **Headlines:** Uses **Newsreader**. Its variable optical sizes and characterful serifs provide an authoritative yet warm editorial feel. Large sizes should be used for section headers to ground the user.
- **Body:** Uses **Inter**. This humanist sans-serif ensures maximum legibility at "thumb-distance" mobile viewing. It maintains a clean, systematic contrast to the serif headlines.
- **Data & Numbers:** All numerical data must use **tabular figures** to maintain vertical alignment in lists and logs, reinforcing the "ledger" aesthetic of a physical notebook.

## Layout & Spacing

The layout philosophy is defined by **Spacious Density**. It avoids clutter by using a strict 4px baseline grid and generous margins.

- **Grid:** A standard 4-column mobile grid with 24px side margins. The wide margins create a "framed" effect, making the content feel like a centered page.
- **Vertical Rhythm:** Elements are separated by wide stacks (32px for sections, 16px for related items) to allow the content to "breathe."
- **Safe Areas:** Navigation and Floating Action Buttons (FAB) are positioned with significant clearance from the bottom edge to ensure comfort during one-handed use.

## Elevation & Depth

This design system eschews heavy drop shadows in favor of **Tonal Layering** and **Subtle Diffusion**.

- **Stacked Sheets:** Depth is communicated by color shifting (Step 1: Background, Step 2: Surface, Step 3: Overlay). 
- **Shadows:** When used, shadows are "ambient ink" style—extremely low opacity (4-6%), highly diffused, and tinted with the primary background brown (#1a1816) rather than pure black. This makes elements feel like they are resting lightly on a surface rather than hovering high above it.
- **Translucency:** The navigation bar uses a high-density backdrop blur (20px+) with a semi-transparent tint of the surface color, creating a "frosted glass" effect that allows background colors to bleed through softly.

## Shapes

Shapes follow a "Soft-Fixed" logic. While the notebook aesthetic often leans toward sharp corners, we use a consistent **8px to 12px corner radius** (Level 2) to maintain a modern, approachable mobile feel. 

- **Cards/Containers:** 12px radius.
- **Small Components (Buttons/Inputs):** 8px radius.
- **Selection Indicators:** Subtle 4px radius or soft-pill shapes for high-contrast visibility.

## Components

- **Buttons:** 
    - **Primary:** Solid Terracotta with white or cream text. No gradients.
    - **Secondary:** Ghost style with a thin tonal border (1px) in a slightly lighter shade than the surface.
    - **Tertiary:** Text-only in Sage or Gold for low-priority actions.
- **Floating Action Button (FAB):** A unique, persistent dual-action component. A large circular Terracotta button containing a "Mic" icon for voice-memos, with a smaller, secondary "Plus" button docked immediately to its side for manual entry.
- **Navigation:** A floating bottom tab bar. It does not span the full width of the screen; it is centered with 24px margins on either side, using a translucent-blur background and line-style icons (Lucide/Phosphor) with a 1.5px stroke weight.
- **Input Fields:** Minimalist design with only a bottom border that thickens slightly on focus. No heavy boxes.
- **Chips/Tags:** Used for categorization, these use the Sage (secondary) color at 10% opacity with solid Sage text to feel quiet and non-intrusive.
- **Cards:** No borders. Elevation is achieved through the #262320 (Dark) or tinted white (Light) surface color.