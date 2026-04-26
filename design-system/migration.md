# Migration Guide — Old Policat code → v2 tokens

If you're porting an existing screen, run through this list **in order**. Each step is a mechanical find/replace; do them all before doing visual review.

---

## Step 1 — Replace `globals.css`

Replace your entire current `app/globals.css` with the version that imports the design system:

```css
@import '../design-system/tokens.css';
@import '../design-system/components.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

(Path depends on where you drop the `design-system/` folder.)

---

## Step 2 — Drop decorative borders

Search and **delete** these patterns from `style={{...}}` blocks:

| Find | Action |
|---|---|
| `border: "1px solid var(--border)"` | DELETE the whole property |
| `border: \`1px solid ${anyColor}\`` | DELETE |
| `border: "2px solid #FFB800"` (podium) | DELETE |
| `border: isActive ? "1px solid var(--purple-primary)" : "1px solid var(--border)"` | DELETE — use `background: isActive ? 'var(--bg-card-hover)' : 'var(--bg-card)'` for the same affordance |

**Keep borders only on:** `<input>`, `<select>`, `<textarea>`. Those are styled by `components.css` automatically.

---

## Step 3 — Lighten font weights

| Find | Replace with |
|---|---|
| `fontWeight: 900` | `fontWeight: 700` |
| `fontWeight: 800` | `fontWeight: 600` |

(Apply globally — there are no legitimate 800/900 cases.)

---

## Step 4 — Rationalize border-radius

| Find | Replace with |
|---|---|
| `borderRadius: 4` | `borderRadius: 8` |
| `borderRadius: 6` | `borderRadius: 8` |
| `borderRadius: 8` (cards) | `borderRadius: 'var(--radius-md)'` (12) |
| `borderRadius: 10` (cards) | `borderRadius: 'var(--radius-lg)'` (16) |

Rule of thumb: **buttons/inputs 8, list rows 12, cards 16, modals 20.**

---

## Step 5 — Soften shadows

| Find | Replace with |
|---|---|
| `boxShadow: "0 8px 32px rgba(0,0,0,0.4)"` | `boxShadow: "var(--shadow-md)"` |
| `boxShadow: "0 20px 40px rgba(0,0,0,0.1)"` | `boxShadow: "var(--shadow-lg)"` |
| Any custom rgba(0,0,0,0.x) shadow | Use `var(--shadow-sm/md/lg/xl)` |

---

## Step 6 — Replace background gradients with flat tones

| Find | Replace with |
|---|---|
| `background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(244,63,94,0.1))"` | `background: "var(--surface-alt)"` |
| `background: toast.type==='success' ? "linear-gradient(...)" : "linear-gradient(...)"` | `background: toast.type==='success' ? 'var(--ink)' : 'var(--accent-no)'` |
| Any decorative gradient on cards | Flat `var(--bg-card)` or `var(--surface-alt)` |

Gradients are reserved for: nothing, currently. None in v2.

---

## Step 7 — Switch number-heavy text to mono

For XP, prices, probabilities, ranks, streak counters:

```tsx
style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}
```

Or use the helper class: `className="mono tnum"`.

---

## Step 8 — Audit color literals

Search for hex codes (`#[0-9A-F]{6}`) in your code. Each one should either be:
- A semantic token from `tokens.css` (replace it with `var(--...)`)
- A category-specific color (tier, tag) — those are already tokenized
- A genuine one-off (rare — flag it)

Common replacements:

| Hex | Token |
|---|---|
| `#1a1a1a`, `#000` | `var(--text-primary)` or `var(--ink)` |
| `#fff`, `#ffffff` | `var(--bg-card)` (if surface) or `white` (if always-white text) |
| `#1652F0` | `var(--accent-yes)` |
| `#FF5E5B` | `var(--accent-no)` |
| `#F5B544` | `var(--accent-gold)` |
| `#94A3B8` | `var(--text-muted)` |

---

## Step 9 — Visual review checklist

Once mechanical steps are done, scan each screen for:

- [ ] Any visible 1px lines that aren't input focus rings → remove
- [ ] Any text at fontWeight ≥ 800 → bring down
- [ ] Any pure black `#000` shadows → swap to ink-tinted
- [ ] Any number column that isn't tabular → add `tnum`
- [ ] Any card with both border AND shadow → drop the border
- [ ] Spacing reads as cramped → bump to next step on the scale (12 → 16, 16 → 20)

---

## Tested on these files

The following were patched manually in the spike — use them as reference:

- `app/page.tsx` (home)
- `app/market/[id]/page.tsx`
- `app/earn/page.tsx`
- `app/shop/page.tsx`
- `app/leaderboard/page.tsx`
- `app/league/page.tsx`
- `app/profile/me/page.tsx`
- `app/create/page.tsx`
- `components/AdRewardModal.tsx`

If you touch one of these, diff against the patched version in `_repo_patches/` first.
