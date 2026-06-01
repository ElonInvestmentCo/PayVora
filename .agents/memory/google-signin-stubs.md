---
name: Google Sign-In platform stubs
description: How @react-native-google-signin/google-signin is split for web safety in this Expo project.
---

`utils/google-auth.ts` (native — iOS/Android): re-exports `GoogleSignin`, `GoogleSigninButton`, `statusCodes` directly from `@react-native-google-signin/google-signin`.

`utils/google-auth.web.tsx` (**must be .tsx not .ts** — contains JSX): exports a brand-compliant `GoogleSigninButton` (white bg, #747775 border, Google G SVG, "Sign in with Google" text, 44dp height, 4dp radius). Also re-exports `GoogleSignin` and `statusCodes` from the package (the package ships its own `.web.js` stubs that log warnings instead of crashing).

**Why:** `GoogleSigninButton` in v16 uses `RNGoogleSigninButton` (a native Fabric component). Importing it on web crashes. Metro's platform-specific resolution (`.web.tsx`) swaps in the safe stub automatically.

**How to apply:** Always import from `@/utils/google-auth`, never the package directly. Any web stub with JSX must use `.web.tsx` extension.

**API (v16.1.2):** `GoogleSignin.signIn()` returns `{ type: 'success', data: { idToken, user: { id, email, name, photo } } }` or `{ type: 'cancelled' }`. Errors have `.code` matching `statusCodes`.
