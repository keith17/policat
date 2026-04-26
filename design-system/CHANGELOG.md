# Changelog

## v2.0 — 2026-04-26
### Added
- Off-white warm surface palette (`#FAFAF7` / `#FFFFFF` / `#F4F3EE` / `#F0EFE9`)
- Mono font (`JetBrains Mono`) for numerics
- 4 accent variants: cobalt (default), emerald, lemon, rose
- Density toggle: `comfy` (default) / `compact`
- Soft button variants: `.btn-yes-soft`, `.btn-no-soft`, `.btn-soft`, `.btn-ghost`
- `--surface-sunk` token for inputs
- Token files in TS (`tokens.ts`)

### Changed
- Removed all decorative 1px borders from cards, chips, podium, leaderboard rows
- Font weight ceiling: 700 (was 900)
- Border radii: 6/8/10 → 8/12/16
- Shadows: harsh black → soft ink-tinted
- Toast backgrounds: gradient → flat ink/coral
- Card hover: scale → subtle translateY(-1px)

### Removed
- Purple primary color (aliased to `--ink` for backward compat)
- Linear-gradient ad backgrounds
- Heavy 800/900 font weights

### Migration
See `migration.md` for find/replace steps.
