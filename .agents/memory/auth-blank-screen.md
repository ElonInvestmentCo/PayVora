---
name: Auth screen blank-screen fix
description: Root cause and fix for PayVora showing blank white/dark on web during development.
---

**Root cause:** `_layout.tsx` returned `null` during `useFonts()` async resolution. Screenshot tool and first cold-load users hit the page at DOMContentLoaded — which fires after the deferred bundle runs but before async font HTTP requests complete. The `#root` div was empty → blank screen.

**Fix applied:**
1. Replaced `return null` with `return <View style={{ flex: 1, backgroundColor: "#0A1428" }} />` so native shows a dark placeholder (matches app theme) while fonts load.
2. Web skips the font guard entirely: `if (!fontsLoaded && !fontError && Platform.OS !== "web")`. Browsers apply fallback fonts immediately and FOUT-swap to custom fonts when they arrive.

**Why:** Native must wait for custom fonts to avoid layout-shift / wrong glyph sizes. Web browsers handle font fallback gracefully without blocking the render tree.

**What was ruled out:**
- Tailwind Preflight stripping heights: Expo-reset CSS (`html, body, #root { height: 100% }`) confirmed correct in served HTML.
- Bundle crash: React initialized and components rendered (DOM warnings confirmed).
- Metro duplicate React: content was in DOM.
