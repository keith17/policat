# Policat Design System

> Off-white warm surfaces · ink primary · tonal cards · 700 weight ceiling
> v2.0 — for the Policat prediction-market app

This folder is the **single source of truth** for visual design.
If you're a code agent working on the Policat repo, read this README first.

---

## Files in this folder

| File | What it is | When to use |
|---|---|---|
| `tokens.css` | All design tokens as CSS custom properties (light/dark/accent/density variants) | Drop into `app/globals.css` (or import). Required base. |
| `components.css` | Reusable component classes built on the tokens (`.glass-card`, `.btn-primary`, `.tag`, etc.) | Append to `globals.css` or keep separate and import. |
| `tokens.ts` | Same tokens as a typed JS object | When inline styles need a literal value (charts, SVG fills) |
| `principles.md` | Design rules — weight, borders, spacing, hierarchy | Read once. Internalize. |
| `components.md` | Each component pattern with a code snippet | Reference while coding |
| `migration.md` | Find/replace table for old code → new tokens | Use when porting an existing screen |
| `CHANGELOG.md` | What changed and when | Pick up where you left off |

---

## Quick start (for a code agent)

1. Replace `app/globals.css` content with:
   ```css
   @import './../design-system/tokens.css';
   @import './../design-system/components.css';

   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
   (Adjust paths to wherever you place this folder.)

2. **Theme switching** is data-attribute driven. On `<html>`:
   ```html
   <html data-theme="light" data-accent="cobalt" data-density="comfy">
   ```
   Valid values:
   - `data-theme`: `light` | `dark`
   - `data-accent`: `cobalt` | `emerald` | `lemon` | `rose`
   - `data-density`: `comfy` | `compact`

3. In components, **always prefer CSS variables** over hard-coded values:
   ```tsx
   // ✅ good
   <div style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }} />

   // ❌ bad
   <div style={{ background: '#FFFFFF', color: '#14141A' }} />
   ```

4. Read `principles.md` and `migration.md` before touching legacy screens.

---

## The 5-second mental model

- **Page is warm off-white** (`#FAFAF7`), not pure white. Cards are pure white **on top** of it.
- **Black text on white card on warm bg.** That's the default. Add color sparingly.
- **No decorative borders.** Cards float on tone, not on strokes. Inputs get a stroke on focus only.
- **Weights cap at 700.** No 800/900. Numbers can be `font-mono` for emphasis without weight.
- **Radii: 8/12/16.** Buttons 8, cards 16, modals 20.
- **YES = cobalt blue, NO = coral red.** Never swap. Soft variants for chips/tags.
- **Spacing: 4/8/12/16/20/24/32.** Use the scale, not arbitrary px.

---

## What this design system is NOT

- It's not a component library — there's no React export. Use these tokens with whatever component you're building.
- It's not a Tailwind plugin (yet). The CSS variables are usable in Tailwind via `bg-[var(--bg-card)]` etc.
- It doesn't dictate layout. Spacing tokens are guidance, not a grid.
