/**
 * Policat Design System — typed tokens
 * Mirror of tokens.css. Use these in TS/JSX when you can't reach for a CSS var.
 *
 * Convention: prefer the CSS variable (`var(--ink)`) in inline styles —
 * it auto-updates with theme/accent changes. Use this file only when you
 * need the literal value (e.g. inside SVG fills, chart libraries).
 */

export const tokens = {
  color: {
    // surfaces (light)
    bg:            '#FAFAF7',
    surface:       '#FFFFFF',
    card:          '#FFFFFF',
    surfaceAlt:    '#F4F3EE',
    surfaceSunk:   '#F0EFE9',

    // text
    textPrimary:   '#14141A',
    textSecondary: '#6B6A66',
    textMuted:     '#A09E97',

    // ink + accents
    ink:           '#14141A',
    inkSoft:       '#2A2A30',
    yes:           '#1652F0',
    yesSoft:       '#E4ECFE',
    no:            '#FF5E5B',
    noSoft:        '#FEE7E5',
    gold:          '#F5B544',
    goldSoft:      '#FBEFD4',
    up:            '#00B074',
    down:          '#FF5E5B',

    // tier
    tierRookie:     '#94A3B8',
    tierPredictor:  '#00B074',
    tierAnalyst:    '#1652F0',
    tierStrategist: '#9676FF',
    tierOracle:     '#F5B544',
  },

  radius: {
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
    pill: 9999,
  },

  shadow: {
    sm: '0 1px 2px rgba(20,20,26,0.04)',
    md: '0 4px 16px rgba(20,20,26,0.06)',
    lg: '0 8px 24px rgba(20,20,26,0.08)',
    xl: '0 12px 32px rgba(20,20,26,0.10)',
  },

  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 },

  fontSize: { 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 18: 18, 20: 20, 24: 24, 28: 28, 32: 32 },

  fontWeight: { regular: 400, medium: 500, semi: 600, bold: 700 } as const,

  font: {
    sans: "'Pretendard', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
  },
} as const;

export type Tokens = typeof tokens;

/** CSS variable accessor — `cssVar('ink')` → `'var(--ink)'` */
export const cssVar = (name: string) => `var(--${name})`;
