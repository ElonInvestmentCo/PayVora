// Web/Android stub for expo-apple-authentication (iOS-only module).
// isAvailableAsync() returns false, so the Apple button is disabled on non-iOS.
export async function isAvailableAsync() { return false; }
export async function signInAsync() { throw new Error("Apple Sign In is not available on this platform."); }
export const AppleAuthenticationScope = { FULL_NAME: 0, EMAIL: 1 };
export const AppleAuthenticationOperation = { LOGIN: 0, REFRESH: 1, LOGOUT: 2, IMPLICIT: 3 };
export const AppleAuthenticationButtonType = { SIGN_IN: 0, CONTINUE: 2, SIGN_UP: 1, DEFAULT: 0 };
export const AppleAuthenticationButtonStyle = { WHITE: 0, WHITE_OUTLINE: 1, BLACK: 2 };
export function AppleAuthenticationButton() { return null; }
