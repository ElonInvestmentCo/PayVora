/**
 * DarkFlipCard
 * Converts the Uiverse.io "Praashoo7" flip-card HTML/CSS to React Native.
 * Used exclusively for the "Regular" Virtual Card tier.
 *
 * Original card: 240 × 154 px  →  scaled to 320 × 200 in RN.
 * Scale factors:  x = 320/240 = 1.333,  y = 200/154 = 1.299
 * All em-based positions converted using the inherited 16 px base font size.
 */

import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";

/* ─── Card dimensions ─────────────────────────────────── */
const CARD_W = 320;
const CARD_H = 200;

/* ─── Mastercard logo — overlapping orange / red circles ─ */
function MastercardLogo() {
  return (
    <View style={d.mcWrap}>
      {/* orange left circle */}
      <View style={[d.mcCircle, { backgroundColor: "#FF9800" }]} />
      {/* red right circle (overlaps) */}
      <View style={[d.mcCircle, { backgroundColor: "#D50000", marginLeft: -14 }]} />
      {/* FF3D00 blend lens in the overlap */}
      <View style={d.mcLens} />
    </View>
  );
}

/* ─── EMV chip — gold 3×3 grid ────────────────────────── */
function ChipIcon() {
  return (
    <View style={d.chipOuter}>
      {/* top row */}
      <View style={d.chipRow}>
        <View style={d.chipCell} />
        <View style={d.chipCell} />
        <View style={d.chipCell} />
      </View>
      {/* middle row (tall centre cell) */}
      <View style={[d.chipRow, { flex: 1 }]}>
        <View style={d.chipCellTall} />
        <View style={[d.chipCellTall, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#7a6200" }]} />
        <View style={d.chipCellTall} />
      </View>
      {/* bottom row */}
      <View style={d.chipRow}>
        <View style={d.chipCell} />
        <View style={d.chipCell} />
        <View style={d.chipCell} />
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

  const frontRotY = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotY  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const frontOp   = flipAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOp    = flipAnim.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const maskedNum    = showDetails ? cardNumber : cardNumber.replace(/(\d{4} )(\d{4} )(\d{4} )/, "**** **** **** ");
  const maskedExpiry = showDetails ? expiry : "**/**";
  const maskedCvv    = showDetails ? cvv : "***";

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleFlip}
      style={d.outerWrap}
      accessibilityLabel="Virtual card — tap to flip"
    >
      {/* ══ FRONT ══ */}
      <Animated.View
        style={[
          d.card,
          {
            opacity: frontOp,
            transform: [{ perspective: 1000 }, { rotateY: frontRotY }],
          },
        ]}
      >
        {/*
         * .heading_8264
         * font-size: 0.5em (8 px)  top: 2em=16 px  left: 18.6em=148.8 px
         * → RN: top ≈ 21  left ≈ 198  (right-ish)
         */}
        <Text style={d.networkLabel}>MASTERCARD</Text>

        {/*
         * .chip  top: 2.3em=36.8 px  left: 1.5em=24 px
         * → RN: top ≈ 48  left ≈ 32
         */}
        <View style={d.chipWrap}>
          <ChipIcon />
        </View>

        {/*
         * .contactless  top: 3.5em=56 px  left: 12.4em=198.4 px
         * → RN: top ≈ 73  left ≈ 264
         */}
        <View style={d.contactlessWrap}>
          <ContactlessIcon />
        </View>

        {/*
         * .logo (36×36 svg)  top: 6.8em=108.8 px  left: 11.7em=187.2 px
         * → RN: top ≈ 141  left ≈ 250
         */}
        <View style={d.logoWrap}>
          <MastercardLogo />
        </View>

        {/*
         * .number  font-size: 0.6em (9.6 px)  top: 8.3em=79.7 px  left: 1.6em=15.4 px
         * → RN: top ≈ 103  left ≈ 21
         */}
        <Text style={d.cardNumber} numberOfLines={1}>
          {maskedNum}
        </Text>

        {/*
         * .valid_thru  (tiny label positioned just above date)
         * .date_8264   font-size: 0.5em  top: 13.6em=108.8 px  left: 3.2em=25.6 px
         * → RN: top ≈ 141  left ≈ 34
         */}
        <View style={d.expiryBlock}>
          <Text style={d.validThruLabel}>VALID THRU</Text>
          <Text style={d.expiryValue}>{maskedExpiry}</Text>
        </View>

        {/*
         * .name  font-size: 0.5em  top: 16.1em=128.8 px  left: 2em=16 px
         * → RN: top ≈ 167  left ≈ 21
         */}
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
        {/*
         * .strip  magnetic stripe
         * top: 2.4em=38.4 px  height: 1.5em=24 px  full width
         * → RN: top ≈ 50  height ≈ 31
         * background: repeating diagonal stripes (#303030 / #202020)
         */}
        <View style={d.magStripe} />

        {/*
         * .mstrip  white signature strip
         * top: 5em=80 px  left: 0.8em=12.8 px  width: 8em=128 px  height: 0.8em=12.8 px
         * → RN: top ≈ 104  left ≈ 17  width ≈ 171  height ≈ 17
         *
         * .sstrip  white CVV box  left: 10em=160 px  width: 4.1em=65.6 px
         * → RN: top ≈ 104  left ≈ 213  width ≈ 88
         */}
        <View style={d.backMidRow}>
          <View style={d.sigStrip} />
          <View style={d.cvvBox}>
            <Text style={d.cvvCode}>{maskedCvv}</Text>
          </View>
        </View>
      </Animated.View>

      {/* tap hint */}
      <View style={d.tapHint}>
        <Text style={d.tapHintText}>tap to flip</Text>
      </View>
    </TouchableOpacity>
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
    height: CARD_H + 22,
    alignSelf: "center",
    marginVertical: 24,
  },

  /* shared card face */
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

  /* ── FRONT ── */

  /* MASTERCARD label — top-right */
  networkLabel: {
    position: "absolute",
    top: 14,
    right: 16,
    color: "#FFFFFF",
    fontSize: 8,
    letterSpacing: 1.6,               /* 0.2em at 8 px */
    fontFamily: "Inter_600SemiBold",
    opacity: 0.9,
  },

  /* EMV chip — upper-left */
  chipWrap: {
    position: "absolute",
    top: 48,
    left: 32,
  },
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
  chipRow: { flexDirection: "row", height: 9 },
  chipCell: { flex: 1, borderWidth: 0.5, borderColor: "#9a7320" },
  chipCellTall: { flex: 1 },

  /* Contactless arcs — upper-right */
  contactlessWrap: {
    position: "absolute",
    top: 66,
    left: 258,
  },
  clWrap: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Mastercard logo — lower-right */
  logoWrap: {
    position: "absolute",
    top: 138,
    left: 248,
  },
  mcWrap: {
    flexDirection: "row",
    width: 50,
    height: 30,
    alignItems: "center",
  },
  mcCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  mcLens: {
    position: "absolute",
    left: 18,
    top: 7,
    width: 14,
    height: 16,
    backgroundColor: "#FF3D00",
    opacity: 0.75,
  },

  /* Card number */
  cardNumber: {
    position: "absolute",
    top: 100,
    left: 22,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
  },

  /* Expiry block */
  expiryBlock: {
    position: "absolute",
    top: 138,
    left: 22,
  },
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

  /* Cardholder name */
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

  /* ── BACK ── */

  /* Magnetic stripe — full-width diagonal-striped black band */
  magStripe: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: "#202020",
    /* Diagonal stripe effect via nested views */
  },

  /* Signature strip + CVV box row */
  backMidRow: {
    position: "absolute",
    top: 110,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sigStrip: {
    flex: 1,
    height: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    opacity: 0.93,
  },
  cvvBox: {
    width: 64,
    height: 32,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  cvvCode: {
    color: "#111111",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
    textAlign: "center",
  },

  /* Tap hint */
  tapHint: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tapHintText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.28)",
    letterSpacing: 0.4,
  },
});
