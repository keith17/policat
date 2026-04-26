# Policat — Design Principles

Read these once. They're the rules behind every component.

---

## 1. Surfaces, not strokes

Hierarchy comes from **tone differences between layers**, not from borders.

- Page: warm off-white `#FAFAF7`
- Card on page: pure white `#FFFFFF`
- Chip / soft button on card: tonal `#F4F3EE`
- Sunken input on card: deeper tonal `#F0EFE9`

That's a 4-step value cascade. The eye reads the depth without a single 1px line.

**Borders are reserved for:** focus rings on inputs (1px solid `--accent` on focus), and hairline dividers between major sections (`--border`, used sparingly).

**Borders are NOT used for:** cards, chips, tag pills, podium ranks, leaderboard rows, modal frames, button outlines.

---

## 2. Weight ceiling: 700

Lower weights read as more confident and modern. The hierarchy is:

| Use case | Weight |
|---|---|
| Body, captions | 400 |
| Secondary labels, metadata | 500 |
| Buttons, tag pills, card titles | 600 |
| Big numbers (XP, prices, headlines) | 700 |

Never use 800 or 900. If something needs more emphasis, increase **size** or switch to **mono**, not weight.

---

## 3. Numbers are tabular and (often) mono

Probabilities, prices, XP, streak counts, leaderboard ranks — all use:

```css
font-family: var(--font-mono);   /* JetBrains Mono */
font-variant-numeric: tabular-nums;
```

This stabilizes columns and gives numerals a "ticker" feel that suits a prediction market.

For prose-adjacent numbers (e.g. "12 markets"), use sans + `tnum` only.

---

## 4. Color discipline

The palette is intentionally narrow:

- **Ink** (`#14141A`) — primary action, primary text
- **YES** (cobalt `#1652F0`) — every YES action, anywhere
- **NO** (coral `#FF5E5B`) — every NO action
- **Gold** (`#F5B544`) — rewards, streaks, achievement only
- **Up/Down** (`#00B074` / `#FF5E5B`) — chart movement only

Soft variants (e.g. `--accent-yes-soft`) are 14% tints used for tag pills and inactive button states. **Don't invent new tints inline** — extend the token file.

---

## 5. Radii: 8 / 12 / 16 / 20

| Element | Radius |
|---|---|
| Buttons, tag pills | 8 |
| Inputs | 8 |
| Inner cards, list rows | 12 |
| Cards | 16 |
| Modals, sheets | 20 |
| Avatars, pill chips | `999px` |

Never use 4 (too sharp) or 24+ (too playful).

---

## 6. Spacing scale

Stick to: **4, 8, 12, 16, 20, 24, 32, 40, 48**.

Use as `var(--space-3)` etc, or as raw px if you must — but only from this list.

Default rhythm:
- Card padding: 20–24
- Section gap: 24–32
- Inline gap (icon + label): 8–12
- Page horizontal padding (mobile): 16

---

## 7. Shadows are soft and ink-tinted

```css
box-shadow: 0 4px 16px rgba(20,20,26,0.06);
```

Never pure black. Never harsh. The shadow palette in `tokens.css` (sm/md/lg/xl) covers every case — pick from those four.

---

## 8. Animations: quick, easing-in-out

- 150ms for hover, focus, color changes
- 300ms for layout shifts
- 600ms with `cubic-bezier(0.4, 0, 0.2, 1)` for probability bars

If it's longer than 600ms, it's too long.

---

## 9. The "earn it" test

Before adding *anything* to a screen — an icon, a divider, a status pill, a stat — ask: **what does removing it cost?** If the answer is "nothing", remove it. The design is calmer than your instinct says.
