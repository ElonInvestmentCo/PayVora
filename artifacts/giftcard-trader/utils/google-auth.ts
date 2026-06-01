import React, { useState } from "react";
import {
  NativeModules,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

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

function StubGoogleSigninButton({ onPress, disabled, style, loading, label = "Sign in with Google" }: any) {
  const [pressed, setPressed] = useState(false);

  return React.createElement(
    Pressable,
    {
      onPress,
      disabled: disabled || loading,
      onPressIn: () => setPressed(true),
      onPressOut: () => setPressed(false),
      style: [
        stubBtnStyles.btn,
        (disabled || loading) && stubBtnStyles.btnDisabled,
        style,
      ],
    },
    React.createElement(View, {
      style: [
        stubBtnStyles.stateOverlay,
        pressed && stubBtnStyles.stateOverlayPressed,
      ],
      pointerEvents: "none",
    }),
    React.createElement(
      View,
      { style: stubBtnStyles.contentWrapper },
      loading
        ? React.createElement(ActivityIndicator, {
            size: "small",
            color: "#3c4043",
            style: stubBtnStyles.spinner,
          })
        : React.createElement(
            Text,
            {
              style: [
                stubBtnStyles.label,
                (disabled || loading) && stubBtnStyles.labelDisabled,
              ],
              numberOfLines: 1,
            },
            label
          )
    )
  );
}

const stubBtnStyles = StyleSheet.create({
  btn: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dadce0",
    borderRadius: 10,
    height: 48,
    overflow: "hidden",
    position: "relative",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  btnDisabled: {
    backgroundColor: "#f8f8f8",
    borderColor: "#dadce0",
    opacity: 0.6,
  },
  stateOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  stateOverlayPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  contentWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: "#3c4043",
    letterSpacing: 0.25,
    textAlign: "center",
  },
  labelDisabled: {
    opacity: 0.38,
  },
  spinner: {
    flex: 1,
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
