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
- **Rates** `app/(tabs)/rates.tsx` — live exchange rates for card types
- **Wallet** `app/(tabs)/wallet.tsx` — full wallet dashboard with portfolio chart, multi-asset list, transaction history, filter tabs (All/Crypto/Fiat), action buttons (Deposit/Withdraw/Transfer)
- **Sell Gift Card** `app/sell.tsx` — sell physical/digital gift cards for NGN
- **Buy Gift Card** `app/buy.tsx` — purchase gift cards with wallet/card/crypto
- **Sell Crypto** `app/sell-crypto.tsx` — sell BTC/ETH/SOL/etc for USD with market/limit orders
- **Buy Crypto** `app/buy-crypto.tsx` — purchase crypto with USD wallet/card/bank, fee breakdown, confirmation modal
- **Virtual Dollar Card** `app/virtual-card.tsx` — virtual Visa card with show/hide details, fund/withdraw/freeze actions, spending chart, card settings, transaction history
- **Bills & eSIMs** `app/bills.tsx` — bill payments (airtime, data, electricity, TV, internet) with provider selection, eSIM plans with purchase modal and QR placeholder
- **Transactions** `app/transactions.tsx` — full transaction history with category tabs (All/Crypto/Gift Cards/Bills/Card/Wallet), status filters, search, summary stats, volume chart, transaction detail modal
- **KYC Verification** `app/kyc.tsx` — 3-step verification (personal info, ID document upload, selfie), progress indicator, status banner, confirmation modal, verified perks display
- **Settings** `app/settings.tsx` — profile card, security (2FA/biometric toggles, password change, session management), notifications, app settings (dark mode, language, currency), payment methods, transaction limits, danger zone (logout, delete account with confirmation modal)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
