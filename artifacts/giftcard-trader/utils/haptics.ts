import { Platform } from "react-native";

type HapticStyle = "light" | "medium" | "heavy" | "success" | "error" | "warning";

const VIBRATION_PATTERNS: Record<HapticStyle, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: 30,
  error: 50,
  warning: 25,
};

let Haptics: any = null;
let hapticsLoaded = false;

async function loadHaptics() {
  if (hapticsLoaded) return;
  hapticsLoaded = true;
  try {
    if (Platform.OS !== "web") {
      Haptics = await import("expo-haptics");
    }
  } catch {
    Haptics = null;
  }
}

loadHaptics();

function webVibrate(pattern: number | number[]) {
  if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
}

export function hapticLight() {
  if (Haptics) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  } else {
    webVibrate(VIBRATION_PATTERNS.light);
  }
}

export function hapticMedium() {
  if (Haptics) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  } else {
    webVibrate(VIBRATION_PATTERNS.medium);
  }
}

export function hapticHeavy() {
  if (Haptics) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  } else {
    webVibrate(VIBRATION_PATTERNS.heavy);
  }
}

export function hapticSuccess() {
  if (Haptics) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  } else {
    webVibrate(VIBRATION_PATTERNS.success);
  }
}

export function hapticError() {
  if (Haptics) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  } else {
    webVibrate(VIBRATION_PATTERNS.error);
  }
}

export function hapticWarning() {
  if (Haptics) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  } else {
    webVibrate(VIBRATION_PATTERNS.warning);
  }
}

export function hapticSelection() {
  if (Haptics) {
    Haptics.selectionAsync().catch(() => {});
  } else {
    webVibrate(8);
  }
}
