import React from "react";

export async function isAvailableAsync(): Promise<boolean> {
  return false;
}

export async function signInAsync(_options?: unknown): Promise<never> {
  throw new Error("Sign in with Apple is not available on this platform.");
}

export const AppleAuthenticationScope = {
  FULL_NAME: 0,
  EMAIL: 1,
} as const;

export const AppleAuthenticationButtonType = {
  SIGN_IN: 0,
  CONTINUE: 2,
  SIGN_UP: 1,
  DEFAULT: 0,
} as const;

export const AppleAuthenticationButtonStyle = {
  WHITE: 0,
  WHITE_OUTLINE: 1,
  BLACK: 2,
} as const;

export function AppleAuthenticationButton(_props: unknown): React.ReactElement | null {
  return null;
}
