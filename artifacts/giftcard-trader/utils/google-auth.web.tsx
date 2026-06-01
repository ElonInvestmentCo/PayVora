import React, { useState } from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import Svg, { Path } from "react-native-svg";

export const statusCodes = {
  SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
  IN_PROGRESS: "IN_PROGRESS",
  PLAY_SERVICES_NOT_AVAILABLE: "PLAY_SERVICES_NOT_AVAILABLE",
  SIGN_IN_REQUIRED: "SIGN_IN_REQUIRED",
};

export const GoogleSignin = {
  configure: (_options?: Record<string, unknown>) => {},
  signIn: async (): Promise<{ type: "cancelled" }> => ({ type: "cancelled" }),
  signOut: async () => {},
  isSignedIn: () => false,
  hasPlayServices: async () => true,
};

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

interface GoogleSigninButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  size?: number | string;
  color?: string;
  loading?: boolean;
  label?: string;
}

export function GoogleSigninButton({
  onPress,
  disabled,
  style,
  loading,
  label = "Sign in with Google",
}: GoogleSigninButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        gStyles.btn,
        (disabled || loading) && gStyles.btnDisabled,
        style,
      ]}
    >
      {/* State overlay — white ripple on press, matches .gsi-material-button-state */}
      <View
        style={[
          gStyles.stateOverlay,
          pressed && gStyles.stateOverlayPressed,
        ]}
        pointerEvents="none"
      />

      {/* Content wrapper — flex row, icon + label */}
      <View style={gStyles.contentWrapper}>
        {/* Icon */}
        <View
          style={[
            gStyles.iconWrap,
            (disabled || loading) && gStyles.iconDisabled,
          ]}
        >
          <GoogleIcon />
        </View>

        {/* Label */}
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#e3e3e3"
            style={gStyles.spinner}
          />
        ) : (
          <Text
            style={[
              gStyles.label,
              (disabled || loading) && gStyles.labelDisabled,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const gStyles = StyleSheet.create({
  btn: {
    backgroundColor: "#131314",
    borderWidth: 1,
    borderColor: "#8e918f",
    borderRadius: 4,
    height: 44,
    overflow: "hidden",
    position: "relative",
    paddingHorizontal: 12,
  },
  btnDisabled: {
    backgroundColor: "#13131461",
    borderColor: "#8e918f1f",
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
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },

  contentWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconWrap: {
    width: 20,
    height: 20,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconDisabled: {
    opacity: 0.38,
  },

  label: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#e3e3e3",
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
