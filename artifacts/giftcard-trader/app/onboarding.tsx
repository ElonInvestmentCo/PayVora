import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Path, Circle, Rect, Defs,
  LinearGradient as SvgGrad, Stop, G, Ellipse,
} from "react-native-svg";
import { hapticLight, hapticSuccess } from "@/utils/haptics";

const { width: W } = Dimensions.get("window");
const LAST = 2; // SLIDES.length - 1

// ─── Slide Data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 0,
    title: "Send & Receive\nInstantly",
    subtitle:
      "Transfer money to anyone, anywhere in seconds. No delays, no hidden fees — just seamless payments at your fingertips.",
    bg1: "#05305C" as const,
    bg2: "#1072EA" as const,
    accent: "#00C4F4" as const,
  },
  {
    id: 1,
    title: "Trade Gift Cards\nAt Best Rates",
    subtitle:
      "Buy and sell gift cards from top brands instantly. Get competitive rates and real-time payouts straight to your wallet.",
    bg1: "#0A2E9A" as const,
    bg2: "#1048D8" as const,
    accent: "#34D8A0" as const,
  },
  {
    id: 2,
    title: "Earn Rewards &\nGrow Your Wealth",
    subtitle:
      "Every transaction earns you points. Invest in crypto, save smarter, and watch your money work harder every day.",
    bg1: "#0B1E6E" as const,
    bg2: "#0F38CC" as const,
    accent: "#FFB830" as const,
  },
] as const;

// ─── Illustrations ────────────────────────────────────────────────────────────
function SendReceiveIllustration({ accent }: { accent: string }) {
  return (
    <Svg width={W * 0.72} height={220} viewBox="0 0 260 220">
      <Defs>
        <SvgGrad id="phone1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.06" />
        </SvgGrad>
        <SvgGrad id="phone2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.06" />
        </SvgGrad>
        <SvgGrad id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={accent} stopOpacity="0" />
          <Stop offset="50%" stopColor={accent} stopOpacity="1" />
          <Stop offset="100%" stopColor={accent} stopOpacity="0" />
        </SvgGrad>
      </Defs>
      <Rect x="10" y="30" width="80" height="148" rx="14" fill="url(#phone1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <Rect x="20" y="50" width="60" height="8" rx="4" fill="rgba(255,255,255,0.5)" />
      <Rect x="20" y="66" width="42" height="6" rx="3" fill="rgba(255,255,255,0.25)" />
      <Rect x="16" y="90" width="68" height="36" rx="10" fill="rgba(255,255,255,0.15)" />
      <Rect x="24" y="98" width="32" height="5" rx="2.5" fill="rgba(255,255,255,0.6)" />
      <Rect x="24" y="110" width="48" height="8" rx="4" fill={accent} />
      <Rect x="16" y="140" width="68" height="26" rx="8" fill={accent} opacity={0.9} />
      <Path d="M42 153h16M50 149l8 4-8 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M95 110 Q130 90 165 110" stroke="url(#arrowGrad)" strokeWidth="2.5" fill="none" strokeDasharray="4 3" />
      <Path d="M160 106l8 4-6 6" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="170" y="30" width="80" height="148" rx="14" fill="url(#phone2)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      <Rect x="180" y="50" width="60" height="8" rx="4" fill="rgba(255,255,255,0.5)" />
      <Rect x="180" y="66" width="42" height="6" rx="3" fill="rgba(255,255,255,0.25)" />
      <Rect x="176" y="90" width="68" height="36" rx="10" fill="rgba(255,255,255,0.15)" />
      <Rect x="184" y="98" width="32" height="5" rx="2.5" fill="rgba(255,255,255,0.6)" />
      <Rect x="184" y="110" width="48" height="8" rx="4" fill={accent} />
      <Rect x="176" y="140" width="68" height="26" rx="8" fill="rgba(255,255,255,0.15)" />
      <Path d="M196 153h16M202 149l8 4-8 4" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {[{ x: 115, y: 68, r: 10, label: "$" }, { x: 138, y: 48, r: 8, label: "₿" }, { x: 102, y: 44, r: 7, label: "+" }].map((p, i) => (
        <G key={i}>
          <Circle cx={p.x} cy={p.y} r={p.r} fill={accent} opacity={0.85} />
        </G>
      ))}
    </Svg>
  );
}

function GiftCardIllustration({ accent }: { accent: string }) {
  const cards = [
    { y: 60, rotate: -10, x: 30, grad: "g0" },
    { y: 40, rotate: 4,   x: 60, grad: "g1" },
    { y: 20, rotate: -2,  x: 45, grad: "g2" },
  ];
  return (
    <Svg width={W * 0.72} height={220} viewBox="0 0 260 220">
      <Defs>
        <SvgGrad id="g0" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4D9FF5" /><Stop offset="100%" stopColor="#1072EA" />
        </SvgGrad>
        <SvgGrad id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1072EA" /><Stop offset="100%" stopColor="#1072EA" />
        </SvgGrad>
        <SvgGrad id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1072EA" /><Stop offset="100%" stopColor="#05305C" />
        </SvgGrad>
      </Defs>
      {cards.map((c, i) => (
        <G key={i} transform={`translate(${c.x}, ${c.y}) rotate(${c.rotate})`}>
          <Rect x="0" y="0" width="160" height="100" rx="16" fill={`url(#${c.grad})`} opacity={1 - i * 0.08} />
          <Rect x="12" y="14" width="28" height="20" rx="4" fill="rgba(255,255,255,0.35)" />
          <Rect x="12" y="44" width="90" height="6" rx="3" fill="rgba(255,255,255,0.35)" />
          <Rect x="12" y="56" width="60" height="5" rx="2.5" fill="rgba(255,255,255,0.2)" />
          <Rect x="12" y="72" width="40" height="14" rx="6" fill="rgba(255,255,255,0.15)" />
        </G>
      ))}
      <G transform="translate(182, 90)">
        <Circle cx="20" cy="20" r="20" fill={accent} opacity={0.15} />
        <Path d="M12 14h16M12 14l4-4M12 14l4 4" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M28 26H12M28 26l-4-4M28 26l-4 4" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </G>
      <Rect x="155" y="142" width="90" height="38" rx="12" fill="rgba(255,255,255,0.12)" stroke={accent} strokeWidth="1.5" />
      <Rect x="163" y="151" width="40" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />
      <Rect x="163" y="162" width="60" height="7" rx="3.5" fill={accent} />
    </Svg>
  );
}

function RewardsIllustration({ accent }: { accent: string }) {
  return (
    <Svg width={W * 0.72} height={220} viewBox="0 0 260 220">
      <Defs>
        <SvgGrad id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <Stop offset="100%" stopColor={accent} stopOpacity="0" />
        </SvgGrad>
      </Defs>
      <Path d="M20 170 L60 140 L100 155 L140 110 L180 90 L220 60 L240 50 L240 180 L20 180 Z" fill="url(#chartFill)" />
      <Path d="M20 170 L60 140 L100 155 L140 110 L180 90 L220 60 L240 50" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {[[60, 140], [100, 155], [140, 110], [180, 90], [220, 60]].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={4} fill={accent} />
      ))}
      <Rect x="192" y="28" width="64" height="28" rx="8" fill={accent} opacity={0.9} />
      <Rect x="200" y="36" width="22" height="5" rx="2.5" fill="rgba(255,255,255,0.7)" />
      <Rect x="200" y="43" width="38" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />
      {[0, 1, 2].map((i) => (
        <G key={i} transform={`translate(${20 + i * 2}, ${-i * 14 + 80})`}>
          <Ellipse cx="30" cy="10" rx="30" ry="12" fill={i === 0 ? "#FFB830" : i === 1 ? "#F0A820" : "#E09810"} />
          <Ellipse cx="30" cy="6" rx="30" ry="12" fill={i === 0 ? "#FFD060" : i === 1 ? "#FFBE30" : "#FFB020"} />
          {i === 0 && <Path d="M24 5v8M21 7h6c1.5 0 2.5.8 2.5 2S28.5 11 27 11h-6" stroke="rgba(150,80,0,0.6)" strokeWidth="1.5" strokeLinecap="round" />}
        </G>
      ))}
      {[[50, 30], [210, 110], [150, 40]].map(([x, y], i) => (
        <G key={i} transform={`translate(${x}, ${y})`}>
          <Path d="M0-6L1.4-1.4L6 0L1.4 1.4L0 6L-1.4 1.4L-6 0L-1.4-1.4Z" fill={accent} opacity={0.7 - i * 0.15} />
        </G>
      ))}
    </Svg>
  );
}

// ─── Onboarding Screen ────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // Single source of truth for active slide — only updates when scroll fully settles
  const [activeIdx, setActiveIdx] = useState(0);

  // Tracks whether we're on the last slide for button logic
  const isLast = activeIdx === LAST;
  const slide = SLIDES[activeIdx];

  // ── Cross-fade animated values for CTA button labels ──────────────────────
  const ctaNextOpacity  = useRef(new Animated.Value(1)).current;
  const ctaLastOpacity  = useRef(new Animated.Value(0)).current;
  const loginLinkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(ctaNextOpacity, {
        toValue: isLast ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(ctaLastOpacity, {
        toValue: isLast ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(loginLinkOpacity, {
        toValue: isLast ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isLast]);

  // ── Snap handler — fires when scroll completely settles (no more motion) ──
  const onSnapComplete = useCallback((e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    // Round and clamp to valid slide index
    const raw = offset / W;
    const idx = Math.max(0, Math.min(Math.round(raw), LAST));
    setActiveIdx(idx);
  }, []);

  // ── Next button: set state immediately so UI updates with the scroll ──
  const goNext = useCallback(() => {
    hapticLight();
    if (activeIdx < LAST) {
      const nextIdx = activeIdx + 1;
      setActiveIdx(nextIdx);                                    // instant UI update
      scrollRef.current?.scrollTo({ x: nextIdx * W, animated: true });
    } else {
      hapticSuccess();
      router.replace("/auth");
    }
  }, [activeIdx]);

  const goToSlide = useCallback((idx: number) => {
    hapticLight();
    setActiveIdx(idx);
    scrollRef.current?.scrollTo({ x: idx * W, animated: true });
  }, []);

  const skip = useCallback(() => {
    hapticLight();
    router.replace("/auth");
  }, []);

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      {/* ── Background gradient — NO key prop so it never remounts ── */}
      <LinearGradient
        colors={[slide.bg1, slide.bg2]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Decorative arcs ── */}
      <View style={s.arcTopRight} />
      <View style={[s.arcBottomLeft, { borderColor: `${slide.accent}20` }]} />

      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <View style={s.logoRow}>
          <View style={s.logoDot} />
          <Text style={s.logoText}>PayVora</Text>
        </View>
        <TouchableOpacity onPress={skip} hitSlop={12} activeOpacity={0.7}>
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* ── Slides (horizontal paging scroll) ── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        disableIntervalMomentum={true}
        style={s.scrollArea}
        contentContainerStyle={s.scrollContent}
        // Both handlers ensure we catch every snap: momentum flings AND slow drags
        onMomentumScrollEnd={onSnapComplete}
        onScrollEndDrag={onSnapComplete}
      >
        {SLIDES.map((sl) => (
          <View key={sl.id} style={[s.slide, { width: W }]}>
            <View style={s.illustrationWrap}>
              {sl.id === 0 && <SendReceiveIllustration accent={sl.accent} />}
              {sl.id === 1 && <GiftCardIllustration accent={sl.accent} />}
              {sl.id === 2 && <RewardsIllustration accent={sl.accent} />}
            </View>
            <View style={s.textWrap}>
              <Text style={s.slideTitle}>{sl.title}</Text>
              <Text style={s.slideSubtitle}>{sl.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ── Bottom controls ── */}
      <View style={[s.bottom, { paddingBottom: insets.bottom + 20 }]}>

        {/* Dot indicators — driven purely by activeIdx */}
        <View style={s.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goToSlide(i)}
              hitSlop={10}
              activeOpacity={0.7}
            >
              <View
                style={[
                  s.dot,
                  i === activeIdx
                    ? [s.dotActive, { backgroundColor: slide.accent }]
                    : s.dotInactive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA button — cross-fades between "Next →" and "Get Started" */}
        <TouchableOpacity
          onPress={goNext}
          activeOpacity={0.85}
          style={s.ctaWrap}
        >
          <LinearGradient
            colors={[slide.accent, slide.accent]}
            style={s.cta}
          >
            {/* "Next →" label — fades out on last slide */}
            <Animated.View
              style={[s.ctaLabelLayer, { opacity: ctaNextOpacity }]}
              pointerEvents={isLast ? "none" : "auto"}
            >
              <Text style={s.ctaText}>Next</Text>
              <Text style={s.ctaArrow}> →</Text>
            </Animated.View>

            {/* "Get Started" label — fades in on last slide */}
            <Animated.View
              style={[s.ctaLabelLayer, { opacity: ctaLastOpacity }]}
              pointerEvents={isLast ? "auto" : "none"}
            >
              <Text style={s.ctaText}>Get Started</Text>
            </Animated.View>
          </LinearGradient>
        </TouchableOpacity>

        {/* "Log in" link — always rendered, cross-fades in on last slide */}
        <Animated.View
          style={[s.loginLinkWrap, { opacity: loginLinkOpacity }]}
          pointerEvents={isLast ? "auto" : "none"}
        >
          <TouchableOpacity onPress={skip} activeOpacity={0.7}>
            <Text style={s.alreadyText}>
              Already have an account?{" "}
              <Text style={[s.alreadyLink, { color: slide.accent }]}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#05305C" },

  arcTopRight: {
    position: "absolute", top: -80, right: -80,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  arcBottomLeft: {
    position: "absolute", bottom: -60, left: -60,
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 40, borderColor: "rgba(255,255,255,0.05)",
  },

  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 24, paddingBottom: 8,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#00C4F4" },
  logoText: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  skipText: { fontSize: 15, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_500Medium" },

  scrollArea: { flex: 1 },
  scrollContent: {},

  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  illustrationWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    height: 240,
  },
  textWrap: { alignItems: "center", paddingHorizontal: 8 },
  slideTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 38,
    letterSpacing: -0.5,
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },

  bottom: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  dotsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 28 },
  dotInactive: { width: 8, backgroundColor: "rgba(255,255,255,0.3)" },

  ctaWrap: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cta: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#05305C",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
  ctaArrow: {
    fontSize: 17,
    fontWeight: "700",
    color: "#05305C",
    fontFamily: "Inter_700Bold",
  },

  ctaLabelLayer: {
    position: "absolute",
    left: 0, right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  loginLinkWrap: { marginTop: 16, height: 22, alignItems: "center" },
  alreadyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_400Regular",
  },
  alreadyLink: { fontFamily: "Inter_600SemiBold" },
});
