/**
 * PayVora Design System — Color Tokens
 *
 * A centralized, single-source-of-truth color system.
 * Import this file instead of hardcoding hex values anywhere in the app.
 *
 * Usage:
 *   import C from "@/constants/colors";
 *   style={{ backgroundColor: C.primary }}
 */

const C = {
  // ── Primary Brand — Royal Blue ───────────────────────────────────────────────
  primary:        '#1072EA',  // CTA buttons, links, active tabs, focus rings
  primaryDark:    '#0B5BC4',  // pressed/hover state, gradient end
  primaryMid:     '#1570D8',  // gradient mid-stop
  primaryLight:   '#E8F1FD',  // tinted backgrounds, active input highlight
  primaryShadow:  'rgba(16,114,234,0.30)', // button shadow

  // ── Secondary — Deep Navy ─────────────────────────────────────────────────────
  navy:           '#05305C',  // headers, dark nav sections, premium branding
  navyDark:       '#021B36',  // deepest dark brand surface
  navyMid:        '#0A3D6E',  // gradient mid-stop for dark sections
  navyShadow:     'rgba(5,48,92,0.40)', // dark section shadow

  // ── Accent — Premium Gold ─────────────────────────────────────────────────────
  gold:           '#F8DF20',  // rewards, leaderboard, VIP badges, balance highlights
  goldDark:       '#D4BB00',  // pressed gold
  goldLight:      '#FEFAE0',  // gold tinted backgrounds
  goldText:       '#A08800',  // readable gold on white

  // ── Status — Success ──────────────────────────────────────────────────────────
  success:        '#118D45',  // verified, completed, positive changes
  successDark:    '#0C6A34',
  successLight:   '#E8F7EE',  // success backgrounds
  successMid:     'rgba(17,141,69,0.12)', // subtle success tint

  // ── Status — Error ────────────────────────────────────────────────────────────
  error:          '#E02E5B',  // failed, destructive actions, errors
  errorDark:      '#B32248',
  errorLight:     '#FCEEF3',  // error backgrounds
  errorMid:       'rgba(224,46,91,0.12)', // subtle error tint

  // ── Status — Warning ──────────────────────────────────────────────────────────
  warning:        '#F59E0B',  // pending, caution
  warningLight:   '#FFFBEB',
  warningMid:     'rgba(245,158,11,0.12)',

  // ── Backgrounds ───────────────────────────────────────────────────────────────
  background:     '#F7F9FC',  // app background (replaces #F2F2F7)
  backgroundAlt:  '#EEF3FA',  // tab pills, subtle section bg
  surface:        '#FFFFFF',  // cards, modals, sheets
  surfaceAlt:     '#F4F6FB',  // secondary surface

  // ── Borders & Dividers ────────────────────────────────────────────────────────
  border:         '#E2E8F0',
  borderLight:    '#F1F5F9',

  // ── Text ──────────────────────────────────────────────────────────────────────
  textPrimary:    '#0F172A',
  textSecondary:  '#475569',
  textMuted:      '#94A3B8',
  textDisabled:   '#CBD5E1',
  textOnDark:     '#FFFFFF',
  textOnPrimary:  '#FFFFFF',

  // ── Dark UI (used in chart surfaces and dark-mode screens) ────────────────────
  dark:           '#1C1C1E',  // iOS dark surface / chart background
  darkCard:       '#23292F',  // dark card bg
  darkDeep:       '#0A1428',  // deepest dark bg (onboarding/splash)

  // ── Light Blue Accents ────────────────────────────────────────────────────────
  primaryAccent:  '#4D9FF5',  // softer blue for stacked cards / visual variety

  // ── Crypto Brand Colors — Do Not Modify ──────────────────────────────────────
  btc:            '#F7931A',
  eth:            '#627EEA',
  sol:            '#9945FF',
  bnb:            '#F3BA2F',
  usdt:           '#26A17B',
  ada:            '#0033AD',
  xrp:            '#00AAE4',

  // ── Overlays ──────────────────────────────────────────────────────────────────
  overlay:        'rgba(0,0,0,0.50)',
  overlayLight:   'rgba(0,0,0,0.30)',
  overlayDark:    'rgba(0,0,0,0.70)',

  // ── Gradient Pairs (ordered start→end) ────────────────────────────────────────
  gradientPrimary:    ['#1072EA', '#05305C'] as const,   // CTA buttons
  gradientHeader:     ['#05305C', '#1072EA', '#0B5BC4'] as const, // page headers
  gradientCard:       ['#1072EA', '#0B5BC4'] as const,   // card gradients
  gradientGold:       ['#F8DF20', '#D4BB00'] as const,   // gold accents
  gradientDark:       ['#0A1428', '#05305C'] as const,   // dark sections
} as const;

export type ColorKey = keyof typeof C;

// ── Semantic palettes consumed by useColors() ─────────────────────────────────
export const lightPalette = {
  primary:          '#1072EA',
  primaryDark:      '#0B5BC4',
  primaryLight:     '#E8F1FD',
  primaryForeground:'#FFFFFF',
  secondary:        '#05305C',
  destructive:      '#E02E5B',
  background:       '#F7F9FC',
  backgroundAlt:    '#EEF3FA',
  surface:          '#FFFFFF',
  card:             '#FFFFFF',
  foreground:       '#0F172A',
  mutedForeground:  '#475569',
  border:           '#E2E8F0',
  input:            '#F1F5F9',
  success:          '#118D45',
  successLight:     '#E8F7EE',
  warning:          '#F59E0B',
  error:            '#E02E5B',
  gold:             '#F8DF20',
  goldDark:         '#D4BB00',
  navy:             '#05305C',
} as const;

export const darkPalette = {
  primary:          '#1072EA',
  primaryDark:      '#0B5BC4',
  primaryLight:     '#1A3B6B',
  primaryForeground:'#FFFFFF',
  secondary:        '#0A3D6E',
  destructive:      '#E02E5B',
  background:       '#0A1428',
  backgroundAlt:    '#0D1E38',
  surface:          '#05305C',
  card:             '#05305C',
  foreground:       '#FFFFFF',
  mutedForeground:  '#94A3B8',
  border:           '#0A3D6E',
  input:            '#05305C',
  success:          '#118D45',
  successLight:     '#0C2A1A',
  warning:          '#F59E0B',
  error:            '#E02E5B',
  gold:             '#F8DF20',
  goldDark:         '#D4BB00',
  navy:             '#021B36',
} as const;

export const radius = 14;

export default C;
