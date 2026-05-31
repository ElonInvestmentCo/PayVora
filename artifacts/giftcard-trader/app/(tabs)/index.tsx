import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useWallet } from "@/contexts/WalletContext";
import { hapticLight } from "@/utils/haptics";

const { width: W } = Dimensions.get("window");
const CARD_W = (W - 48) / 2;

// ─── Chevron Icon ─────────────────────────────────────────────────────────────
function ChevronRight({ color = "#8E8E93" }: { color?: string }) {
  return (
    <Svg width={6} height={10} viewBox="0 0 6 10" fill="none">
      <Path d="M1 1l4 4-4 4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Illustrations ────────────────────────────────────────────────────────────
function SavingsIllustration() {
  return (
    <LinearGradient colors={["#1A5AFF", "#0C38C0"]} style={illS.circle}>
      <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="8" stroke="white" strokeWidth={2} />
        <Circle cx="12" cy="12" r="3" fill="white" />
        <Path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="white" strokeWidth={2} strokeLinecap="round" />
      </Svg>
    </LinearGradient>
  );
}

function CryptoIllustration() {
  return (
    <View style={illS.cryptoWrap}>
      {[0, 1, 2].map((i) => (
        <LinearGradient
          key={i}
          colors={
            i === 0
              ? (["#1A5AFF", "#0C38C0"] as const)
              : i === 1
              ? (["#1250E0", "#0A30A8"] as const)
              : (["#0E46C8", "#082890"] as const)
          }
          style={[illS.coin, { bottom: i * 16, width: 80 - i * 4 }]}
        >
          {i === 2 && <Text style={illS.coinSymbol}>₿</Text>}
        </LinearGradient>
      ))}
    </View>
  );
}

function StocksIllustration() {
  return (
    <View style={illS.waveWrap}>
      <Svg width="100%" height={90} viewBox="0 0 160 90" preserveAspectRatio="none">
        <Path d="M-10 60 C20 42,50 72,80 54 C110 36,140 60,170 42 L170 90 L-10 90 Z" fill="#A8C4FF" opacity={0.6} />
        <Path d="M-10 70 C20 52,50 82,80 64 C110 46,140 70,170 52 L170 90 L-10 90 Z" fill="#6090FF" opacity={0.75} />
        <Path d="M-10 80 C20 62,50 92,80 74 C110 56,140 80,170 62 L170 90 L-10 90 Z" fill="#1A5AFF" opacity={0.9} />
        <Path d="M-10 80 C20 62,50 92,80 74 C110 56,140 80,170 62" stroke="#0C38C0" strokeWidth={2} fill="none" opacity={0.4} />
      </Svg>
    </View>
  );
}

function GiftCardIllustration() {
  const cards = [
    { colors: ["#60A8FF", "#3A7AE8"] as const, rotate: "8deg", right: 8, bottom: 6, w: 68, h: 80 },
    { colors: ["#3A7AE8", "#1A5AFF"] as const, rotate: "-4deg", left: 28, bottom: 2, w: 68, h: 86 },
    { colors: ["#1A5AFF", "#0C38C0"] as const, rotate: "0deg", left: 8, bottom: 0, w: 70, h: 90 },
  ];
  return (
    <View style={illS.giftWrap}>
      {cards.map((c, i) => (
        <LinearGradient
          key={i}
          colors={c.colors}
          style={[
            illS.giftCard,
            {
              width: c.w, height: c.h, bottom: c.bottom,
              ...("right" in c ? { right: (c as any).right } : { left: (c as any).left }),
              transform: [{ rotate: c.rotate }],
            },
          ]}
        >
          <View style={{ padding: 8, gap: 5 }}>
            {[80, 60, 70, 50, 65].slice(0, i === 2 ? 5 : 4).map((w, j) => (
              <View key={j} style={[illS.giftLine, { width: `${w}%` as any }]} />
            ))}
          </View>
        </LinearGradient>
      ))}
    </View>
  );
}

const illS = StyleSheet.create({
  circle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
    marginTop: 12,
    shadowColor: "#1254EC", shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  cryptoWrap: {
    flex: 1, alignItems: "center", justifyContent: "flex-end", width: "100%", marginTop: 8,
  },
  coin: {
    position: "absolute", height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  coinSymbol: { color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "800" },
  waveWrap: { flex: 1, width: "100%", overflow: "hidden", marginTop: 8 },
  giftWrap: { flex: 1, position: "relative", width: "100%", overflow: "hidden" },
  giftCard: { position: "absolute", borderRadius: 8 },
  giftLine: { height: 4, backgroundColor: "rgba(255,255,255,0.45)", borderRadius: 2, marginBottom: 4 },
});

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  title, amount, sub, onPress, children,
}: {
  title: string; amount?: string; sub?: string;
  onPress?: () => void; children: React.ReactNode;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={[s.featureCard, { width: CARD_W }]}>
      <View style={s.featureHead}>
        <Text style={s.featureTitle} numberOfLines={2}>{title}</Text>
        <ChevronRight />
      </View>
      <View style={{ flex: 1 }}>{children}</View>
      {amount !== undefined && (
        <View style={{ paddingBottom: 14 }}>
          <Text style={s.featureAmount}>{amount}</Text>
          {sub ? <Text style={s.featureSub}>{sub}</Text> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { usdBalance, ngnBalance } = useWallet();

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Wallet</Text>
          <TouchableOpacity
            onPress={() => { hapticLight(); router.push("/settings" as any); }}
            activeOpacity={0.8}
          >
            <LinearGradient colors={["#1A5AFF", "#0C38C0"]} style={s.avatar}>
              <Text style={s.avatarText}>PV</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Balance Card ── */}
        <View style={s.balanceSection}>
          <View style={s.balanceCard}>
            <View style={s.balanceTopRow}>
              <Text style={s.balanceLabel}>PayVora Balance</Text>
              <TouchableOpacity style={s.routingBtn} activeOpacity={0.7}>
                <Text style={s.routingText}>Account & Routing</Text>
                <ChevronRight />
              </TouchableOpacity>
            </View>
            <Text style={s.balanceAmount}>{fmt(usdBalance)}</Text>
            <View style={s.actionRow}>
              <TouchableOpacity
                style={s.actionBtn}
                activeOpacity={0.8}
                onPress={() => { hapticLight(); router.push("/buy-crypto" as any); }}
              >
                <Text style={s.actionText}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.actionBtn}
                activeOpacity={0.8}
                onPress={() => { hapticLight(); router.push("/sell" as any); }}
              >
                <Text style={s.actionText}>Pay Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Feature Grid ── */}
        <View style={s.grid}>
          <FeatureCard
            title="Savings"
            amount={fmt(ngnBalance * 0.0006)}
            sub="Save for a goal"
            onPress={() => { hapticLight(); router.push("/wallet" as any); }}
          >
            <SavingsIllustration />
          </FeatureCard>

          <FeatureCard
            title="Buy Crypto"
            onPress={() => { hapticLight(); router.push("/buy-crypto" as any); }}
          >
            <CryptoIllustration />
          </FeatureCard>

          <FeatureCard
            title="Invest in stocks"
            onPress={() => { hapticLight(); router.push("/(tabs)/markets" as any); }}
          >
            <StocksIllustration />
          </FeatureCard>

          <FeatureCard
            title="Trade Gift Cards"
            onPress={() => { hapticLight(); router.push("/sell" as any); }}
          >
            <GiftCardIllustration />
          </FeatureCard>
        </View>

        {/* ── Recent Activity ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity
            style={s.emptyCard}
            activeOpacity={0.8}
            onPress={() => { hapticLight(); router.push("/transactions" as any); }}
          >
            <Text style={s.emptyTitle}>No recent transactions</Text>
            <Text style={s.emptySub}>Your activity will appear here</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: { paddingBottom: 32 },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 28, fontWeight: "700", color: "#1C1C1E",
    letterSpacing: -0.5, fontFamily: "Inter_700Bold",
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#1254EC", shadowOpacity: 0.35, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 6,
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },

  balanceSection: { paddingHorizontal: 16, marginBottom: 12 },
  balanceCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  balanceTopRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  balanceLabel: { fontSize: 15, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  routingBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  routingText: { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_400Regular", marginRight: 3 },
  balanceAmount: {
    fontSize: 42, fontWeight: "700", color: "#1C1C1E",
    letterSpacing: -1, marginBottom: 20, fontFamily: "Inter_700Bold",
  },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1, paddingVertical: 13, backgroundColor: "#F2F2F7",
    borderRadius: 12, alignItems: "center",
  },
  actionText: { fontSize: 15, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },

  grid: {
    paddingHorizontal: 16, flexDirection: "row",
    flexWrap: "wrap", gap: 10, marginBottom: 12,
  },
  featureCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16,
    minHeight: 160, shadowColor: "#000", shadowOpacity: 0.06,
    shadowRadius: 12, shadowOffset: { width: 0, height: 2 },
    elevation: 3, overflow: "hidden",
  },
  featureHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  featureTitle: {
    fontSize: 15, fontWeight: "600", color: "#1C1C1E",
    fontFamily: "Inter_600SemiBold", flex: 1, marginRight: 4,
  },
  featureAmount: { fontSize: 20, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", marginTop: 4 },
  featureSub: { fontSize: 12, color: "#8E8E93", marginTop: 2, fontFamily: "Inter_400Regular" },

  section: { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 18, fontWeight: "700", color: "#1C1C1E",
    marginBottom: 10, fontFamily: "Inter_700Bold", letterSpacing: -0.3,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24,
    alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  emptySub: { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_400Regular" },
});
