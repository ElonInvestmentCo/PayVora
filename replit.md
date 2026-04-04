# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
GiftCard Trader is a fintech mobile app (Expo) for trading gift cards and crypto.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo SDK 54, React Native 0.81, expo-router

## App Screens (Expo — artifacts/giftcard-trader)

- **Home** `app/(tabs)/index.tsx` — wallet overview, quick actions, recent transactions
- **Trade** `app/(tabs)/rates.tsx` — full trading interface: asset selector (BTC/ETH/SOL/BNB/ADA/XRP), simulated 24h price chart with LIVE indicator, order book (asks/bids with depth bars, spread display), buy/sell toggle with amount input, quick-amount buttons, fee breakdown summary, position accounting (buy increases crypto holdings, sell validates & decreases holdings)
- **Wallet** `app/(tabs)/wallet.tsx` — full wallet dashboard with portfolio chart, multi-asset list with inline deposit/withdraw mini-buttons, transaction history, filter tabs (All/Crypto/Fiat), deposit modal (shows address + network + copy button + warning), withdrawal modal (amount + address + fee + submit), KYC banner, crypto withdrawals debit asset balances correctly
- **Quick Sell** `app/sell.tsx` — dual-mode sell interface (Gift Cards / Crypto toggle): gift card mode has card selector, currency tabs, amount input, image upload, rate display, payout preview; crypto mode shows asset grid with balances, current price bar, percentage quick-buttons (25/50/75/100%), fee breakdown, instant sell with asset balance deduction
- **Buy Gift Card** `app/buy.tsx` — purchase gift cards with wallet/card/crypto
- **Sell Crypto** `app/sell-crypto.tsx` — sell BTC/ETH/SOL/etc for USD with market/limit orders
- **Buy Crypto** `app/buy-crypto.tsx` — purchase crypto with USD wallet/card/bank, fee breakdown, confirmation modal
- **Virtual Dollar Card** `app/virtual-card.tsx` — virtual Visa card with show/hide details, fund/withdraw/freeze actions, spending chart, card settings, transaction history
- **Bills & eSIMs** `app/bills.tsx` — bill payments (airtime, data, electricity, TV, internet) with provider selection, eSIM plans with purchase modal and QR placeholder
- **Transactions** `app/transactions.tsx` — full transaction history with category tabs (All/Crypto/Gift Cards/Bills/Card/Wallet), status filters, search, summary stats, volume chart, transaction detail modal
- **KYC Verification** `app/kyc.tsx` — 3-step verification (personal info, ID document upload, selfie), progress indicator, status banner, confirmation modal, verified perks display. KYC status is backend-driven via `KycContext` (contexts/KycContext.tsx) which fetches from API `/api/kyc/status`. All screens (Profile, Settings, Wallet, KYC) consume `useKyc()` hook — no hardcoded status values. Status updates only via admin API (`PATCH /api/kyc/review`). Supports: not_verified, pending, verified, rejected.
- **Settings** `app/settings.tsx` — profile card, security (2FA/biometric toggles, password change, session management), notifications, app settings (dark mode, language, currency), payment methods, transaction limits, danger zone (logout, delete account with confirmation modal)
- **Leaderboard** `app/leaderboard.tsx` — top 3 podium with crowns/badges, ranked trader list with profit/loss, time tabs (Daily/Weekly/Monthly/All-Time), asset filters, search, current user highlight, performance chart
- **Support Chat** `app/support.tsx` — real-time chat UI with agent/user bubbles, typing indicator, quick reply buttons, message status (sent/delivered/read), auto-responses, attachment button, online status
- **Markets** `app/(tabs)/markets.tsx` — market overview (cap + volume), asset list with mini sparkline charts, search, category tabs (All/Crypto/Gift Cards/Trending), 24h change indicators
- **Profile** `app/(tabs)/profile.tsx` — user card with avatar/stats (trades/volume/rank), menu sections linking to all app features (KYC, Virtual Card, Transactions, Bills, Leaderboard, Support, Settings)

## Global State & Context (artifacts/giftcard-trader)

- **ThemeContext** `contexts/ThemeContext.tsx` — `isDark` toggle, consumed by `useColors()` hook. Settings dark mode switch wired to `useTheme().toggle()`. NativeWind color scheme synced via `SyncDarkMode` component in `_layout.tsx` (single source of truth pattern — ThemeContext drives NativeWind, not the reverse). `darkMode: "class"` in `tailwind.config.js`. Document body background set programmatically for web.
- **WalletContext** `contexts/WalletContext.tsx` — `ngnBalance`, `usdBalance`, `assets[]`, `transactions[]`, `virtualCard*` state. All buy/sell/bills screens call `addTransaction()`, `updateNgnBalance()`/`updateUsdBalance()`. Virtual card uses `fundVirtualCard()`, `withdrawVirtualCard()`, `toggleFreezeCard()`.
- **NotificationsContext** `contexts/NotificationsContext.tsx` — `notifications[]`, `unreadCount`, `showPanel`, `togglePanel()`, `addNotification()`. Bell icons on Home/Wallet open the panel. All trade actions add notifications.
- **KycContext** `contexts/KycContext.tsx` — Fully client-side KYC with instant validation (name, DOB, address rules). `runFullVerification()` sets status to verified/rejected. No API calls.
- **NotificationsPanel** `components/NotificationsPanel.tsx` — Slide-down notification panel rendered at root `_layout.tsx`.
- **Haptics** `utils/haptics.ts` — Cross-platform haptic feedback (expo-haptics on native, navigator.vibrate on web). Functions: `hapticLight/Medium/Heavy/Success/Error/Warning/Selection()`. Wired into: GlowButton (medium on press), home quick actions (light), trade success/error alerts, settings dark mode toggle (selection), virtual card fund/withdraw warnings, bills validation errors, KYC flow steps.
- **Tamagui** — `tamagui` + `@tamagui/config` installed, config at `tamagui.config.ts`. **Not currently in provider tree** — TamaguiProvider's wrapper div breaks flex layout on Expo web. Add back when needed with `style={{flex:1}}` on wrapper or inside content area only.
- **FocusedModal** `components/FocusedModal.tsx` — Wraps RN Modal with `@tamagui/focus-scope` FocusScope on web (trapped + loop + focusOnIdle). No-op on native. Used by all 6 modals: wallet deposit/withdraw, buy-crypto confirm, sell-crypto confirm, settings delete, bills eSIM, transactions detail.
- **Provider order** (_layout.tsx): `ThemeProvider > GestureHandlerRootView > KeyboardProvider > WalletProvider > NotificationsProvider > KycProvider`.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
