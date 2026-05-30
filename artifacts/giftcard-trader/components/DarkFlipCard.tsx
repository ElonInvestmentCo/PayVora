import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import * as Clipboard from "expo-clipboard";

/* ─── Card dimensions ─────────────────────────────────── */
const CARD_W = 320;
const CARD_H = 200;

/* ─── Mastercard logo ─────────────────────────────────── */
function MastercardLogo() {
  return (
    <View style={d.mcWrap}>
      <View style={[d.mcCircle, { backgroundColor: "#FF9800" }]} />
      <View style={[d.mcCircle, { backgroundColor: "#D50000", marginLeft: -14 }]} />
      <View style={d.mcLens} />
    </View>
  );
}

/* ─── EMV chip ────────────────────────────────────────── */
function ChipIcon() {
  return (
    <View style={d.chipOuter}>
      <View style={d.chipRow}>
        <View style={d.chipCell} /><View style={d.chipCell} /><View style={d.chipCell} />
      </View>
      <View style={[d.chipRow, { flex: 1 }]}>
        <View style={d.chipCellTall} />
        <View style={[d.chipCellTall, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#7a6200" }]} />
        <View style={d.chipCellTall} />
      </View>
      <View style={d.chipRow}>
        <View style={d.chipCell} /><View style={d.chipCell} /><View style={d.chipCell} />
      </View>
    </View>
  );
}

/* ─── Contactless arcs ────────────────────────────────── */
function ContactlessIcon() {
  return (
    <View style={d.clWrap}>
      {[10, 16, 22].map((sz, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: sz,
            height: sz,
            borderRadius: sz / 2,
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.55)",
            borderLeftColor: "transparent",
            borderBottomColor: "transparent",
            transform: [{ rotate: "45deg" }],
          }}
        />
      ))}
    </View>
  );
}

/* ─── Props ───────────────────────────────────────────── */
export interface DarkFlipCardProps {
  cardNumber?: string;
  holderName?: string;
  expiry?: string;
  cvv?: string;
  showDetails?: boolean;
}

/* ─── Component ───────────────────────────────────────── */
export function DarkFlipCard({
  cardNumber = "9759 2484 5269 6576",
  holderName = "BRUCE WAYNE",
  expiry = "12/24",
  cvv = "***",
  showDetails = true,
}: DarkFlipCardProps) {
  /* ── flip animation ── */
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

  /* ── copy-to-clipboard toast ── */
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = useCallback(async () => {
    if (flipped) return; // only copy from the front face
    await Clipboard.setStringAsync(cardNumber);
    setCopied(true);
    // fade in
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setCopied(false));
  }, [cardNumber, flipped, toastAnim]);

  /* ── derived values ── */
  const frontRotY = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotY  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const frontOp   = flipAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOp    = flipAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const maskedNum    = showDetails ? cardNumber : cardNumber.replace(/(\d{4} )(\d{4} )(\d{4} )/, "**** **** **** ");
  const maskedExpiry = showDetails ? expiry : "**/**";
  const maskedCvv    = showDetails ? cvv : "***";

  /* toast translate: slides up slightly */
  const toastTranslateY = toastAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

  return (
    <View style={d.outerWrap}>
      {/* ══ FRONT ══ */}
      <TouchableOpacity activeOpacity={1} onPress={handleFlip} style={d.cardTouchable}>
        <Animated.View
          style={[
            d.card,
            {
              opacity: frontOp,
              transform: [{ perspective: 1000 }, { rotateY: frontRotY }],
            },
          ]}
        >
          <Text style={d.networkLabel}>MASTERCARD</Text>

          <View style={d.chipWrap}>
            <ChipIcon />
          </View>

          <View style={d.contactlessWrap}>
            <ContactlessIcon />
          </View>

          <View style={d.logoWrap}>
            <MastercardLogo />
          </View>

          {/* Tappable card number */}
          <TouchableOpacity
            onPress={handleCopyNumber}
            activeOpacity={0.7}
            style={d.numberTouchable}
            accessibilityLabel="Tap to copy card number"
          >
            <Text style={d.cardNumber} numberOfLines={1}>
              {maskedNum}
            </Text>
          </TouchableOpacity>

          <View style={d.expiryBlock}>
            <Text style={d.validThruLabel}>VALID THRU</Text>
            <Text style={d.expiryValue}>{maskedExpiry}</Text>
          </View>

          <Text style={d.holderName}>{holderName}</Text>
        </Animated.View>

        {/* ══ BACK ══ */}
        <Animated.View
          style={[
            d.card,
            d.cardAbsolute,
            {
              opacity: backOp,
              transform: [{ perspective: 1000 }, { rotateY: backRotY }],
            },
          ]}
        >
          <View style={d.magStripe} />
          <View style={d.backMidRow}>
            <View style={d.sigStrip} />
            <View style={d.cvvBox}>
              <Text style={d.cvvCode}>{maskedCvv}</Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* ══ "Copied!" toast ══ */}
      <Animated.View
        pointerEvents="none"
        style={[
          d.toast,
          {
            opacity: toastAnim,
            transform: [{ translateY: toastTranslateY }],
          },
        ]}
      >
        <View style={d.toastInner}>
          <View style={d.toastDot} />
          <Text style={d.toastText}>Copied!</Text>
        </View>
      </Animated.View>
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────── */
const CARD_BG = "#171717";
const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 7 },
  shadowOpacity: 0.4,
  shadowRadius: 13,
  elevation: 14,
};

const d = StyleSheet.create({
  outerWrap: {
    width: CARD_W,
    height: CARD_H + 48,
    alignSelf: "center",
    marginVertical: 24,
    alignItems: "center",
  },

  cardTouchable: {
    width: CARD_W,
    height: CARD_H,
  },

  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    overflow: "hidden",
    ...CARD_SHADOW,
  },
  cardAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
  },

  /* MASTERCARD label */
  networkLabel: {
    position: "absolute",
    top: 14,
    right: 16,
    color: "#FFFFFF",
    fontSize: 8,
    letterSpacing: 1.6,
    fontFamily: "Inter_600SemiBold",
    opacity: 0.9,
  },

  /* EMV chip */
  chipWrap: { position: "absolute", top: 48, left: 32 },
  chipOuter: {
    width: 38,
    height: 30,
    backgroundColor: "#C8A84B",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#9a7320",
    justifyContent: "space-between",
  },
  chipRow:     { flexDirection: "row", height: 9 },
  chipCell:    { flex: 1, borderWidth: 0.5, borderColor: "#9a7320" },
  chipCellTall:{ flex: 1 },

  /* Contactless arcs */
  contactlessWrap: { position: "absolute", top: 66, left: 258 },
  clWrap: { width: 26, height: 26, alignItems: "center", justifyContent: "center" },

  /* Mastercard logo */
  logoWrap: { position: "absolute", top: 138, left: 248 },
  mcWrap:   { flexDirection: "row", width: 50, height: 30, alignItems: "center" },
  mcCircle: { width: 30, height: 30, borderRadius: 15 },
  mcLens: {
    position: "absolute",
    left: 18,
    top: 7,
    width: 14,
    height: 16,
    backgroundColor: "#FF3D00",
    opacity: 0.75,
  },

  /* Card number — tappable zone */
  numberTouchable: {
    position: "absolute",
    top: 92,
    left: 16,
    right: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  cardNumber: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
  },

  /* Expiry */
  expiryBlock: { position: "absolute", top: 138, left: 22 },
  validThruLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 6,
    letterSpacing: 1,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  expiryValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },

  /* Holder name */
  holderName: {
    position: "absolute",
    top: 166,
    left: 22,
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  /* Back face */
  magStripe: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: "#1a1a1a",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  backMidRow: {
    position: "absolute",
    top: 110,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sigStrip: { flex: 1, height: 32, backgroundColor: "#FFFFFF", borderRadius: 3, opacity: 0.93 },
  cvvBox:   { width: 64, height: 32, backgroundColor: "#FFFFFF", borderRadius: 3, alignItems: "center", justifyContent: "center" },
  cvvCode:  { color: "#111111", fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 3, textAlign: "center" },

  /* Copied! toast */
  toast: {
    marginTop: 12,
    alignItems: "center",
  },
  toastInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.25)",
  },
  toastDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#00E5FF",
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
