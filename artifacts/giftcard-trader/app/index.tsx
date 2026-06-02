import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing as REasing,
} from "react-native-reanimated";
import {
  Inter_700Bold,
  Inter_500Medium,
  useFonts,
} from "@expo-google-fonts/inter";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, {
  Path,
  Rect,
  Defs,
  LinearGradient as SvgGrad,
  Stop,
} from "react-native-svg";

const { width: W, height: H } = Dimensions.get("window");

// ─── Logo Icon ─────────────────────────────────────────────────────────────────
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
          <Stop offset="0%" stopColor="#1072EA" />
          <Stop offset="100%" stopColor="#0C38C4" />
        </SvgGrad>
        <SvgGrad id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#D0E8FF" />
        </SvgGrad>
      </Defs>
      {/* Outer P silhouette */}
      <Path
        d={[
          "M 10,78", "L 10,14",
          "C 10,7 15,2 22,2", "L 42,2",
          "C 56,2 66,12 66,26",
          "C 66,40 56,50 42,50",
          "L 26,50", "L 26,78", "Z",
        ].join(" ")}
        fill="url(#logoGrad)"
      />
      {/* Bowl interior */}
      <Path
        d={[
          "M 26,14", "L 40,14",
          "C 50,14 58,20 58,29",
          "C 58,38 50,44 40,44",
          "L 26,44", "Z",
        ].join(" ")}
        fill="url(#bowlGrad)"
      />
      {/* Card chip */}
      <Rect x="38" y="17" width="15" height="10" rx="2.5" fill="url(#chipGrad)" opacity={0.92} />
      {/* Stem highlight */}
      <Path
        d="M 10,14 C 10,7 15,2 22,2 L 26,2 L 26,14 Z"
        fill="rgba(255,255,255,0.18)"
      />
    </Svg>
  );
}

// ─── Wave layer — rendered twice at different offsets ──────────────────────────
function WaveLayer({ opacity: op }: { opacity: number }) {
  return (
    <Svg width={W + 120} height={160} viewBox={`0 0 ${W + 120} 160`}>
      {[0, 20, 40, 60, 80, 100, 120].map((yBase, i) => (
        <Path
          key={i}
          d={`M -60,${yBase} C ${W * 0.18},${yBase - 18} ${W * 0.45},${yBase + 18} ${W * 0.72},${yBase + 4} C ${W},${yBase - 10} ${W + 60},${yBase + 14} ${W + 120},${yBase}`}
          stroke={`rgba(255,255,255,${op})`}
          strokeWidth={1.2}
          fill="none"
        />
      ))}
    </Svg>
  );
}

// ─── Splash Screen ─────────────────────────────────────────────────────────────
export default function SplashScreen() {
  // ── Font readiness — ensures brand text never mounts on fallback fonts ──────
  const [fontsLoaded] = useFonts({ Inter_700Bold, Inter_500Medium });

  // ── Gentle Tide wave animation (react-native-reanimated) ───────────────────
  const tideY  = useSharedValue(0);
  const tideX1 = useSharedValue(0);
  const tideX2 = useSharedValue(0);

  const tideStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: tideX1.value },
      { translateY: tideY.value },
    ],
  }));

  const tideStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: tideX2.value },
    ],
  }));

  // ── Logo entrance + shimmer ────────────────────────────────────────────────
  const logoScale   = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const shimmerX    = useRef(new Animated.Value(-100)).current;

  // ── Typography staggered ───────────────────────────────────────────────────
  const brandOpacity  = useRef(new Animated.Value(0)).current;
  const brandY        = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY      = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // ── 1. Gentle Tide — slow, sine-smoothed infinite loops via Reanimated ────
    // Vertical breathing drift: 8s cycle, ±4px (ultra-subtle float)
    tideY.value = withRepeat(
      withTiming(4, { duration: 8000, easing: REasing.inOut(REasing.sin) }),
      -1,
      true
    );
    // Layer 1 horizontal parallax: 10s cycle, +8px (calm rightward tide)
    tideX1.value = withRepeat(
      withTiming(8, { duration: 10000, easing: REasing.inOut(REasing.sin) }),
      -1,
      true
    );
    // Layer 2 counter-parallax: 12s cycle, −6px (opposing gentle current)
    tideX2.value = withRepeat(
      withTiming(-6, { duration: 12000, easing: REasing.inOut(REasing.sin) }),
      -1,
      true
    );

    // ── 2. Logo entrance: scale 0.8→1.0 with Ease-Out Back (800ms) + fade ──
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // ── 3. Navigate to onboarding ────────────────────────────────────────────
    const navTimer = setTimeout(() => {
      router.replace("/onboarding");
    }, 2800);

    return () => clearTimeout(navTimer);
  }, []);

  // ── Font-gated text animations — only start once Inter is fully loaded ──────
  // This guarantees brand text and tagline NEVER animate in on a fallback font.
  useEffect(() => {
    if (!fontsLoaded) return;

    // Reset values so animation plays fresh even if fonts loaded very quickly
    brandOpacity.setValue(0);
    brandY.setValue(20);
    taglineOpacity.setValue(0);
    taglineY.setValue(10);

    // "PayVora" — slide up 20px + fade, delay 300ms
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(brandY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Tagline — slide up 10px + fade, delay 500ms
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Shimmer sweep: starts at 1000ms, repeats every 3s
    shimmerX.setValue(-100);
    const shimmerTimer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerX, {
            toValue: 180,
            duration: 750,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
        ])
      ).start();
    }, 1000);

    return () => clearTimeout(shimmerTimer);
  }, [fontsLoaded]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* ── Background gradient ── */}
      <LinearGradient
        colors={["#05305C", "#1072EA", "#0F4ADA", "#1360F2"]}
        locations={[0, 0.35, 0.68, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Top-right decorative arc ── */}
      <View style={styles.topRightShape} />

      {/* ── Wave parallax layer 1 — Gentle Tide (back, more subtle) ── */}
      <Reanimated.View
        style={[styles.waveContainer, { top: H * 0.50 }, tideStyle1]}
        pointerEvents="none"
      >
        <WaveLayer opacity={0.055} />
      </Reanimated.View>

      {/* ── Wave parallax layer 2 — Gentle Tide (front, counter-current) ── */}
      <Reanimated.View
        style={[styles.waveContainer, { top: H * 0.54 }, tideStyle2]}
        pointerEvents="none"
      >
        <WaveLayer opacity={0.09} />
      </Reanimated.View>

      {/* ── Bottom decorative shapes ── */}
      <View style={styles.bottomShapeBack} />
      <View style={styles.bottomShapeFront} />

      {/* ── Logo + Typography (centred, slightly above mid) ── */}
      <View style={styles.content}>

        {/* Logo icon with shimmer overlay */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Clip container — shimmer is clipped to logo bounds */}
          <View style={styles.logoClip}>
            <PayVoraLogo />
            {/* Shimmer sweep overlay */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { transform: [{ translateX: shimmerX }] },
              ]}
            >
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0)",
                  "rgba(255,255,255,0.42)",
                  "rgba(255,255,255,0)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* "PayVora" + Tagline — only mount once Inter is loaded so text
            nodes never exist in the DOM while a fallback font is active.
            This is the correct fix for font-flash/glitch on web. */}
        {fontsLoaded && (
          <>
            <Animated.Text
              style={[
                styles.brand,
                {
                  opacity: brandOpacity,
                  transform: [{ translateY: brandY }],
                },
              ]}
            >
              PayVora
            </Animated.Text>

            <Animated.Text
              style={[
                styles.tagline,
                {
                  opacity: taglineOpacity,
                  transform: [{ translateY: taglineY }],
                },
              ]}
            >
              PAY SMART. GROW MORE.
            </Animated.Text>
          </>
        )}
      </View>

      {/* ── Home indicator (web only) ── */}
      {Platform.OS === "web" && <View style={styles.homeIndicator} />}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#05305C",
    overflow: "hidden",
  },

  topRightShape: {
    position: "absolute",
    top: -H * 0.12,
    right: -W * 0.14,
    width: W * 0.72,
    height: W * 0.72,
    borderRadius: W * 0.36,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  waveContainer: {
    position: "absolute",
    left: -20,
  },

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

  content: {
    position: "absolute",
    left: 0,
    right: 0,
    top: H * 0.36,
    alignItems: "center",
  },

  logoWrapper: {
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },

  // Clips the shimmer gradient to exactly the logo bounds
  logoClip: {
    width: 72,
    height: 80,
    overflow: "hidden",
  },

  // Shimmer gradient — slightly wider than logo for clean edge entry/exit
  shimmerGradient: {
    width: 90,
    height: 80,
  },

  brand: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.4,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
  },

  tagline: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.80)",
    letterSpacing: 2.6,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
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
