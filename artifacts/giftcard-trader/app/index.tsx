import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, {
  Path,
  Rect,
  Defs,
  LinearGradient as SvgGrad,
  Stop,
  G,
} from "react-native-svg";

const { width: W, height: H } = Dimensions.get("window");

// ─── PayVora P Logo ────────────────────────────────────────────────────────────
function PayVoraLogo() {
  return (
    <Svg width={72} height={80} viewBox="0 0 72 80">
      <Defs>
        <SvgGrad id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#C4DFFF" />
          <Stop offset="45%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#A8CCFF" />
        </SvgGrad>
        <SvgGrad id="bowlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1A52E8" />
          <Stop offset="100%" stopColor="#0C38C4" />
        </SvgGrad>
        <SvgGrad id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#D0E8FF" />
        </SvgGrad>
      </Defs>

      {/* ── Outer P silhouette (white / ice-blue gradient) ── */}
      <Path
        d={[
          "M 10,78",       // bottom-left of stem
          "L 10,14",       // up the stem
          "C 10,7 15,2 22,2",  // top-left curve
          "L 42,2",        // top of bowl
          "C 56,2 66,12 66,26", // bowl top-right arc
          "C 66,40 56,50 42,50", // bowl bottom-right arc
          "L 26,50",       // bowl returns to stem junction
          "L 26,78",       // down the stem to bottom
          "Z",
        ].join(" ")}
        fill="url(#logoGrad)"
      />

      {/* ── Bowl interior (blue "card face") ── */}
      <Path
        d={[
          "M 26,14",
          "L 40,14",
          "C 50,14 58,20 58,29",
          "C 58,38 50,44 40,44",
          "L 26,44",
          "Z",
        ].join(" ")}
        fill="url(#bowlGrad)"
      />

      {/* ── Card chip (white rounded rect in upper bowl) ── */}
      <Rect
        x="38"
        y="17"
        width="15"
        height="10"
        rx="2.5"
        fill="url(#chipGrad)"
        opacity={0.92}
      />

      {/* ── Subtle highlight on stem left edge ── */}
      <Path
        d="M 10,14 C 10,7 15,2 22,2 L 26,2 L 26,14 Z"
        fill="rgba(255,255,255,0.18)"
      />
    </Svg>
  );
}

// ─── Wave Lines ────────────────────────────────────────────────────────────────
function WaveLines() {
  const lines = [
    "M -40,0  C 60,-18 120,18 220,4   C 320,-10 380,16 480,0",
    "M -40,20 C 60,2  120,38 220,24  C 320,10  380,36 480,20",
    "M -40,40 C 60,22 120,58 220,44  C 320,30  380,56 480,40",
    "M -40,60 C 60,42 120,78 220,64  C 320,50  380,76 480,60",
    "M -40,80 C 60,62 120,98 220,84  C 320,70  380,96 480,80",
    "M -40,100 C 60,82 120,118 220,104 C 320,90  380,116 480,100",
    "M -40,120 C 60,102 120,138 220,124 C 320,110 380,136 480,120",
  ];

  return (
    <Svg
      width={W * 0.85}
      height={160}
      viewBox={`0 0 ${W * 0.85} 160`}
      style={styles.waveContainer}
    >
      {lines.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={1.2}
          fill="none"
        />
      ))}
    </Svg>
  );
}

// ─── Splash Screen ─────────────────────────────────────────────────────────────
export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/auth");
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* ── Background gradient ── */}
      <LinearGradient
        colors={["#0C38C0", "#1254EC", "#0F4ADA", "#1360F2"]}
        locations={[0, 0.35, 0.68, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Top-right decorative arc ── */}
      <View style={styles.topRightShape} />

      {/* ── Wave lines (middle-left region) ── */}
      <WaveLines />

      {/* ── Bottom decorative shapes ── */}
      <View style={styles.bottomShapeBack} />
      <View style={styles.bottomShapeFront} />

      {/* ── Centred logo + text ── */}
      <Animated.View
        style={[
          styles.content,
          { opacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoWrapper}>
          <PayVoraLogo />
        </View>

        <Text style={styles.brand}>PayVora</Text>
        <Text style={styles.tagline}>PAY SMART. GROW MORE.</Text>
      </Animated.View>

      {/* ── Home-indicator bar ── */}
      {Platform.OS === "web" && (
        <View style={styles.homeIndicator} />
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0C38C0",
    overflow: "hidden",
  },

  /* top-right arc – large rounded shape partially off-screen */
  topRightShape: {
    position: "absolute",
    top: -H * 0.12,
    right: -W * 0.14,
    width: W * 0.72,
    height: W * 0.72,
    borderRadius: W * 0.36,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  /* wave lines – positioned at ~55% down, left-aligned */
  waveContainer: {
    position: "absolute",
    top: H * 0.52,
    left: -20,
  },

  /* bottom shapes */
  bottomShapeBack: {
    position: "absolute",
    bottom: -H * 0.06,
    right: -W * 0.08,
    width: W * 0.64,
    height: H * 0.24,
    borderRadius: 40,
    backgroundColor: "rgba(30, 80, 210, 0.55)",
    transform: [{ rotate: "-8deg" }],
  },
  bottomShapeFront: {
    position: "absolute",
    bottom: -H * 0.03,
    right: -W * 0.14,
    width: W * 0.58,
    height: H * 0.18,
    borderRadius: 36,
    backgroundColor: "#00C4F4",
    opacity: 0.85,
    transform: [{ rotate: "-4deg" }],
  },

  /* logo + text container – vertically centred, slightly above mid */
  content: {
    position: "absolute",
    left: 0,
    right: 0,
    top: H * 0.36,
    alignItems: "center",
  },

  logoWrapper: {
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },

  brand: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.4,
    fontFamily: Platform.select({ ios: "System", android: "sans-serif-medium", default: "Inter_700Bold" }),
    marginBottom: 8,
  },

  tagline: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.82)",
    letterSpacing: 2.4,
    fontWeight: "500",
    fontFamily: Platform.select({ ios: "System", android: "sans-serif", default: "Inter_500Medium" }),
  },

  homeIndicator: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});
