import React from "react";
import { NativeModules, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";

const stubStatusCodes = {
  SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
  IN_PROGRESS: "IN_PROGRESS",
  PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
  SIGN_IN_REQUIRED: "SIGN_IN_REQUIRED",
};

const stubGoogleSignin = {
  configure: (_options?: Record<string, unknown>) => {},
  signIn: async (): Promise<{ type: "cancelled" }> => ({ type: "cancelled" }),
  signOut: async () => {},
  isSignedIn: () => false,
  hasPlayServices: async () => true,
};

function StubGoogleSigninButton({ disabled, style, loading }: any) {
  return React.createElement(
    TouchableOpacity,
    {
      disabled: disabled || loading,
      activeOpacity: 0.82,
      style: [stubBtnStyles.btn, disabled && stubBtnStyles.disabled, style],
    },
    loading
      ? React.createElement(ActivityIndicator, { size: "small", color: "#1F1F1F" })
      : React.createElement(Text, { style: stubBtnStyles.label }, "Sign in with Google")
  );
}

const stubBtnStyles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#747775",
    borderRadius: 4,
    height: 44,
    overflow: "hidden",
  },
  disabled: { opacity: 0.6 },
  label: {
    fontSize: 14,
    color: "#1F1F1F",
    letterSpacing: 0.25,
  },
});

const isNativeAvailable = !!NativeModules.RNGoogleSignin;

let _GoogleSignin: typeof stubGoogleSignin = stubGoogleSignin;
let _statusCodes: typeof stubStatusCodes = stubStatusCodes;
let _GoogleSigninButton: React.ComponentType<any> = StubGoogleSigninButton;

if (isNativeAvailable) {
  const m = require("@react-native-google-signin/google-signin");
  _GoogleSignin = m.GoogleSignin;
  _statusCodes = m.statusCodes;
  _GoogleSigninButton = m.GoogleSigninButton;
}

export const GoogleSignin = _GoogleSignin;
export const statusCodes = _statusCodes;
export const GoogleSigninButton = _GoogleSigninButton;
