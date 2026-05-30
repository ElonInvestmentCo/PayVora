import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";

/* ─── Dimensions ────────────────────────────────────────── */
const CARD_W = 320;
const CARD_H = 200;

/* ─── Mastercard Logo ───────────────────────────────────── */
function MastercardLogo() {
  return (
    <View style={s.mcWrap}>
      <View style={[s.mcCircle, { backgroundColor: "#FF9800" }]} />
      <View style={[s.mcCircle, { backgroundColor: "#D50000", marginLeft: -14 }]} />
      {/* overlap tint */}
      <View style={s.mcOverlap} />
    </View>
  );
}

/* ─── EMV Chip ──────────────────────────────────────────── */
function ChipIcon() {
  return (
    <View style={s.chipOuter}>
      <View style={s.chipRow}>
        <View style={s.chipCell} />
        <View style={s.chipCell} />
        <View style={s.chipCell} />
      </View>
      <View style={[s.chipRow, { flex: 1 }]}>
        <View style={s.chipCellTall} />
        <View style={[s.chipCellTall, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#555" }]} />
        <View style={s.chipCellTall} />
      </View>
      <View style={s.chipRow}>
        <View style={s.chipCell} />
        <View style={s.chipCell} />
        <View style={s.chipCell} />
      </View>
    </View>
  );
}

/* ─── Contactless Arcs ──────────────────────────────────── */
function ContactlessIcon() {
  return (
    <View style={s.clWrap}>
      {[10, 16, 22].map((size, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.5)",
            borderLeftColor: "transparent",
            borderBottomColor: "transparent",
            transform: [{ rotate: "45deg" }],
          }}
        />
      ))}
    </View>
  );
}

/* ─── Component Props ───────────────────────────────────── */
export interface DarkFlipCardProps {
  cardNumber?: string;
  holderName?: string;
  expiry?: string;
  cvv?: string;
  /** When false, sensitive fields are masked */
  showDetails?: boolean;
  /** Card network label shown top-right, e.g. "MASTERCARD" */
  networkLabel?: string;
}

/* ─── DarkFlipCard ──────────────────────────────────────── */
export function DarkFlipCard({
  cardNumber = "9759 2484 5269 6576",
  holderName = "BRUCE WAYNE",
  expiry = "12/24",
  cvv = "***",
  showDetails = true,
  networkLabel = "MASTERCARD",
}: DarkFlipCardProps) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const handleFlip = useCallback(() => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped((f) => !f);
  }, [flipped, flipAnim]);

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  const maskedNumber = showDetails
    ? cardNumber
    : cardNumber.replace(/(\d{4} )(\d{4} )(\d{4} )/, "**** **** **** ");
  const maskedExpiry = showDetails ? expiry : "**/**";
  const maskedCvv = showDetails ? cvv : "***";

  const isWeb = Platform.OS === "web";
  const webPerspective = isWeb ? ({ perspective: "1000px" } as any) : {};

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleFlip}
      style={s.outerWrap}
      accessibilityLabel="Virtual card, tap to flip"
    >
      {/* ── FRONT ── */}
      <Animated.View
        style={[
          s.card,
          webPerspective,
          {
            opacity: frontOpacity,
            transform: [{ perspective: 1000 }, { rotateY: frontRotateY }],
          },
        ]}
      >
        {/* network label — top right */}
        <Text style={s.networkLabel}>{networkLabel}</Text>

        {/* Mastercard logo — right side, vertically centered upper half */}
        <View style={s.logoWrap}>
          <MastercardLogo />
        </View>

        {/* EMV chip — top left */}
        <View style={s.chipWrap}>
          <ChipIcon />
        </View>

        {/* Contactless — right of chip row */}
        <View style={s.contactlessWrap}>
          <ContactlessIcon />
        </View>

        {/* Card number */}
        <Text style={s.cardNumber} numberOfLines={1}>
          {maskedNumber}
        </Text>

        {/* Bottom row: valid thru / expiry + holder name */}
        <View style={s.frontBottom}>
          <View>
            <Text style={s.fieldLabel}>VALID THRU</Text>
            <Text style={s.fieldValue}>{maskedExpiry}</Text>
          </View>
          <Text style={s.holderName}>{holderName}</Text>
        </View>
      </Animated.View>

      {/* ── BACK ── */}
      <Animated.View
        style={[
          s.card,
          s.cardAbsolute,
          webPerspective,
          {
            opacity: backOpacity,
            transform: [{ perspective: 1000 }, { rotateY: backRotateY }],
          },
        ]}
      >
        {/* Magnetic stripe */}
        <View style={s.magStripe} />

        {/* Signature strip + CVV */}
        <View style={s.backMid}>
          <View style={s.sigStrip} />
          <View style={s.cvvBox}>
            <Text style={s.cvvText}>{maskedCvv}</Text>
          </View>
        </View>
      </Animated.View>

      {/* tap hint */}
      <Text style={s.tapHint}>tap to flip</Text>
    </TouchableOpacity>
  );
}

/* ─── Styles ────────────────────────────────────────────── */
const CARD_BG = "#171717";
const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.45,
  shadowRadius: 14,
  elevation: 12,
};

const s = StyleSheet.create({
  outerWrap: {
    width: CARD_W,
    height: CARD_H + 24,
    alignSelf: "center",
  },

  /* Card face shared */
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    overflow: "hidden",
    ...CARD_SHADOW,
  },
  cardAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
  },

  /* ── FRONT ── */
  networkLabel: {
    position: "absolute",
    top: 16,
    right: 16,
    color: "#FFFFFF",
    fontSize: 8,
    letterSpacing: 2,
    fontFamily: "Inter_600SemiBold",
    opacity: 0.85,
  },
  logoWrap: {
    position: "absolute",
    top: 52,
    right: 16,
  },
  chipWrap: {
    position: "absolute",
    top: 36,
    left: 24,
  },
  contactlessWrap: {
    position: "absolute",
    top: 44,
    left: 72,
  },
  cardNumber: {
    position: "absolute",
    bottom: 54,
    left: 24,
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
  },
  frontBottom: {
    position: "absolute",
    bottom: 16,
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  fieldLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 7,
    letterSpacing: 1,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  fieldValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  holderName: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  /* ── Mastercard logo ── */
  mcWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: 42,
    height: 26,
  },
  mcCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    opacity: 0.95,
  },
  mcOverlap: {
    position: "absolute",
    left: 14,
    top: 5,
    width: 14,
    height: 16,
    backgroundColor: "#FF3D00",
    opacity: 0.7,
  },

  /* ── EMV Chip ── */
  chipOuter: {
    width: 36,
    height: 28,
    borderRadius: 4,
    backgroundColor: "#C8A84B",
    borderWidth: 0.5,
    borderColor: "#a88930",
    overflow: "hidden",
  },
  chipRow: {
    flexDirection: "row",
    height: 8,
  },
  chipCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#a88930",
  },
  chipCellTall: {
    flex: 1,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#a88930",
  },

  /* ── Contactless ── */
  clWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── BACK ── */
  magStripe: {
    position: "absolute",
    top: 38,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: "#000",
    /* diagonal stripe overlay */
    backgroundImage: undefined,
  },
  backMid: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sigStrip: {
    flex: 1,
    height: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    /* repeating diagonal lines — approximated with a subtle bg */
    opacity: 0.92,
  },
  cvvBox: {
    width: 54,
    height: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  cvvText: {
    color: "#111",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 2,
  },

  /* ── Tap hint ── */
  tapHint: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.5,
  },
});
