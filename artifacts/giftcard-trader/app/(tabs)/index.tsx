import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useWallet } from "@/contexts/WalletContext";
import { hapticLight } from "@/utils/haptics";

const { width: W, height: H } = Dimensions.get("window");
const CARD_W = (W - 48) / 2;

// Single-column layout on screens shorter than 720dp (budget/mid-range phones)
const IS_SMALL = H < 720;

// ─── Chevron ──────────────────────────────────────────────────────────────────
function ChevronRight({ color = "#8E8E93" }: { color?: string }) {
  return (
    <Svg width={6} height={10} viewBox="0 0 6 10" fill="none">
      <Path d="M1 1l4 4-4 4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Card Illustrations ───────────────────────────────────────────────────────
function BuyGiftIllustration() {
  const cards = [
    { colors: ["#60A8FF", "#3A7AE8"] as const, rotate: "8deg",  right: 8,  bottom: 6, w: 68, h: 80 },
    { colors: ["#3A7AE8", "#1A5AFF"] as const, rotate: "-4deg", left: 28,  bottom: 2, w: 68, h: 86 },
    { colors: ["#1A5AFF", "#0C38C0"] as const, rotate: "0deg",  left: 8,   bottom: 0, w: 70, h: 90 },
  ];
  return (
    <View style={ill.giftWrap}>
      {cards.map((c, i) => (
        <LinearGradient
          key={i}
          colors={c.colors}
          style={[ill.giftCard, {
            width: c.w, height: c.h, bottom: c.bottom,
            ...("right" in c ? { right: (c as any).right } : { left: (c as any).left }),
            transform: [{ rotate: c.rotate }],
          }]}
        >
          <View style={{ padding: 8, gap: 5 }}>
            {[80, 60, 70, 50, 65].slice(0, i === 2 ? 5 : 4).map((w, j) => (
              <View key={j} style={[ill.giftLine, { width: `${w}%` as any }]} />
            ))}
          </View>
        </LinearGradient>
      ))}
    </View>
  );
}

function SellGiftIllustration() {
  return (
    <View style={ill.giftWrap}>
      {[
        { colors: ["#0C38C0", "#1A5AFF"] as const, rotate: "-8deg", left: 8,   bottom: 6, w: 68, h: 80 },
        { colors: ["#1A5AFF", "#3A7AE8"] as const, rotate: "4deg",  right: 22, bottom: 2, w: 68, h: 86 },
        { colors: ["#3A7AE8", "#60A8FF"] as const, rotate: "0deg",  right: 8,  bottom: 0, w: 70, h: 90 },
      ].map((c, i) => (
        <LinearGradient
          key={i}
          colors={c.colors}
          style={[ill.giftCard, {
            width: c.w, height: c.h, bottom: c.bottom,
            ...("left" in c ? { left: (c as any).left } : { right: (c as any).right }),
            transform: [{ rotate: c.rotate }],
          }]}
        >
          <View style={{ padding: 8, gap: 5 }}>
            <View style={[ill.giftLine, { width: "80%" as any }]} />
            <View style={[ill.giftLine, { width: "60%" as any }]} />
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.3)", marginTop: 4 }} />
          </View>
        </LinearGradient>
      ))}
    </View>
  );
}

function BuyCryptoIllustration() {
  return (
    <View style={ill.cryptoWrap}>
      {[0, 1, 2].map((i) => (
        <LinearGradient
          key={i}
          colors={
            i === 0 ? (["#1A5AFF", "#0C38C0"] as const)
            : i === 1 ? (["#1250E0", "#0A30A8"] as const)
            : (["#0E46C8", "#082890"] as const)
          }
          style={[ill.coin, { bottom: i * 16, width: 80 - i * 4 }]}
        >
          {i === 2 && <Text style={ill.coinSymbol}>₿</Text>}
        </LinearGradient>
      ))}
    </View>
  );
}

function SellCryptoIllustration() {
  return (
    <View style={ill.waveWrap}>
      <Svg width="100%" height={90} viewBox="0 0 160 90" preserveAspectRatio="none">
        <Path d="M-10 70 C20 50,50 80,80 60 C110 40,140 65,170 45 L170 90 L-10 90 Z" fill="#A8C4FF" opacity={0.5} />
        <Path d="M-10 55 C20 72,50 40,80 58 C110 76,140 48,170 66 L170 90 L-10 90 Z" fill="#6090FF" opacity={0.7} />
        <Path d="M-10 65 C20 82,50 50,80 68 C110 86,140 58,170 76 L170 90 L-10 90 Z" fill="#1A5AFF" opacity={0.9} />
        <Path d="M-10 55 C20 72,50 40,80 58 C110 76,140 48,170 66" stroke="#0C38C0" strokeWidth={2} fill="none" opacity={0.5} />
      </Svg>
    </View>
  );
}

function VirtualCardIllustration() {
  return (
    <View style={{ flex: 1, width: "100%", alignItems: "center", justifyContent: "flex-end", paddingBottom: 10 }}>
      <LinearGradient
        colors={["#1A5AFF", "#0C38C0"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ width: "85%", height: 70, borderRadius: 10, padding: 12, justifyContent: "space-between" }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ width: 22, height: 16, borderRadius: 3, backgroundColor: "rgba(255,220,0,0.85)" }} />
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Inter_600SemiBold" }}>VISA</Text>
        </View>
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 8, fontFamily: "Inter_400Regular", letterSpacing: 1.5 }}>•••• •••• •••• 4289</Text>
      </LinearGradient>
    </View>
  );
}

function BillsIllustration() {
  return (
    <View style={{ flex: 1, width: "100%", alignItems: "center", justifyContent: "flex-end", paddingBottom: 8, gap: 5 }}>
      {[
        { label: "Airtime",     color: "#1A5AFF", w: "70%" },
        { label: "Electricity", color: "#3A7AE8", w: "85%" },
        { label: "Internet",    color: "#60A8FF", w: "55%" },
      ].map((b) => (
        <View key={b.label} style={{ flexDirection: "row", alignItems: "center", gap: 6, width: "90%" as any }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: b.color }} />
          <View style={{ height: 6, borderRadius: 3, backgroundColor: b.color + "60", flex: 1 }}>
            <View style={{ width: b.w as any, height: "100%", borderRadius: 3, backgroundColor: b.color }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const ill = StyleSheet.create({
  cryptoWrap:  { flex: 1, alignItems: "center", justifyContent: "flex-end", width: "100%", marginTop: 8 },
  coin:        { position: "absolute", height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  coinSymbol:  { color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "800" },
  waveWrap:    { flex: 1, width: "100%", overflow: "hidden", marginTop: 8 },
  giftWrap:    { flex: 1, position: "relative", width: "100%", overflow: "hidden" },
  giftCard:    { position: "absolute", borderRadius: 8 },
  giftLine:    { height: 4, backgroundColor: "rgba(255,255,255,0.45)", borderRadius: 2, marginBottom: 4 },
});

// ─── Action Card ──────────────────────────────────────────────────────────────
function ActionCard({
  title, subtitle, onPress, children,
}: {
  title: string; subtitle?: string; onPress?: () => void; children: React.ReactNode;
}) {
  const cardWidth = IS_SMALL ? W - 32 : CARD_W;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={[s.actionCard, { width: cardWidth }]}>
      <View style={s.actionHead}>
        <View style={{ flex: 1, marginRight: 4 }}>
          <Text style={s.actionTitle} numberOfLines={2}>{title}</Text>
          {subtitle ? <Text style={s.actionSub}>{subtitle}</Text> : null}
        </View>
        <ChevronRight />
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </TouchableOpacity>
  );
}

// ─── Recent Transaction Row ───────────────────────────────────────────────────
function TxRow({ title, amount, date, isIn }: { title: string; amount: string; date: string; isIn: boolean }) {
  return (
    <View style={s.txRow}>
      <View style={[s.txIcon, { backgroundColor: isIn ? "rgba(48,209,88,0.12)" : "rgba(255,59,48,0.08)" }]}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
          <Path
            d={isIn ? "M12 19V5M5 12l7-7 7 7" : "M12 5v14M5 12l7 7 7-7"}
            stroke={isIn ? "#30D158" : "#FF3B30"}
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          />
        </Svg>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.txTitle}>{title}</Text>
        <Text style={s.txDate}>{date}</Text>
      </View>
      <Text style={[s.txAmount, { color: isIn ? "#30D158" : "#1C1C1E" }]}>{amount}</Text>
    </View>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { usdBalance, transactions } = useWallet();
  const scrollY = useRef(new Animated.Value(0)).current;

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

  const recentTxs = transactions.slice(0, 3);

  // ── Balance amount: scales down + fades as user scrolls up ──────────────────
  const balanceScale = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [1, 0.70],
    extrapolate: "clamp",
  });
  const balanceTranslateY = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [0, -22],
    extrapolate: "clamp",
  });
  const balanceOpacity = scrollY.interpolate({
    inputRange: [0, 65],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // ── Mini-balance in sticky header: fades IN when balance has scrolled away ──
  const miniBalanceOpacity = scrollY.interpolate({
    inputRange: [55, 95],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const miniBalanceTranslateY = scrollY.interpolate({
    inputRange: [55, 95],
    outputRange: [8, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={s.root}>

      {/* ── Sticky header — outside the ScrollView ── */}
      <View style={[s.headerWrap, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Home</Text>

          {/* Mini balance — fades into center when user scrolls up */}
          <Animated.Text
            style={[s.miniBalance, {
              opacity: miniBalanceOpacity,
              transform: [{ translateY: miniBalanceTranslateY }],
            }]}
            numberOfLines={1}
          >
            {fmt(usdBalance)}
          </Animated.Text>

          <TouchableOpacity
            onPress={() => { hapticLight(); router.push("/settings" as any); }}
            activeOpacity={0.8}
          >
            <LinearGradient colors={["#1A5AFF", "#0C38C0"]} style={s.avatar}>
              <Text style={s.avatarText}>PV</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable content — bounces at both edges ── */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        scrollEventThrottle={16}
        contentContainerStyle={s.scroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
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

            {/* Balance amount animates on scroll */}
            <Animated.Text
              style={[s.balanceAmount, {
                opacity: balanceOpacity,
                transform: [
                  { scale: balanceScale },
                  { translateY: balanceTranslateY },
                ],
              }]}
            >
              {fmt(usdBalance)}
            </Animated.Text>

            <View style={s.actionRow}>
              <TouchableOpacity
                style={s.actionBtn}
                activeOpacity={0.8}
                onPress={() => { hapticLight(); router.push("/buy-crypto" as any); }}
              >
                <Text style={s.actionBtnText}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.actionBtn}
                activeOpacity={0.8}
                onPress={() => { hapticLight(); router.push("/sell" as any); }}
              >
                <Text style={s.actionBtnText}>Pay Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Quick Actions — responsive 2-col or 1-col ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={[s.grid, IS_SMALL && s.gridSingle]}>
          <ActionCard
            title="Buy Gift Cards"
            subtitle="Amazon, iTunes & more"
            onPress={() => { hapticLight(); router.push("/buy" as any); }}
          >
            <BuyGiftIllustration />
          </ActionCard>

          <ActionCard
            title="Sell Gift Cards"
            subtitle="Instant payout"
            onPress={() => { hapticLight(); router.push("/sell" as any); }}
          >
            <SellGiftIllustration />
          </ActionCard>

          <ActionCard
            title="Buy Crypto"
            subtitle="BTC, ETH, SOL & more"
            onPress={() => { hapticLight(); router.push("/buy-crypto" as any); }}
          >
            <BuyCryptoIllustration />
          </ActionCard>

          <ActionCard
            title="Sell Crypto"
            subtitle="Convert to cash"
            onPress={() => { hapticLight(); router.push("/sell-crypto" as any); }}
          >
            <SellCryptoIllustration />
          </ActionCard>

          <ActionCard
            title="Virtual Dollar Card"
            subtitle="Spend online globally"
            onPress={() => { hapticLight(); router.push("/virtual-card" as any); }}
          >
            <VirtualCardIllustration />
          </ActionCard>

          <ActionCard
            title="Bills & eSIMs"
            subtitle="Airtime, data, utilities"
            onPress={() => { hapticLight(); router.push("/bills" as any); }}
          >
            <BillsIllustration />
          </ActionCard>
        </View>

        {/* ── Recent Activity ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity
            onPress={() => { hapticLight(); router.push("/(tabs)/transactions" as any); }}
            activeOpacity={0.8}
          >
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={s.recentCard}>
          {recentTxs.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyTitle}>No recent transactions</Text>
              <Text style={s.emptySub}>Your activity will appear here</Text>
            </View>
          ) : (
            recentTxs.map((tx) => (
              <TxRow
                key={tx.id}
                title={tx.title}
                amount={`${tx.direction === "in" ? "+" : "-"}${tx.currency === "NGN" ? "₦" : "$"}${tx.amount.toLocaleString()}`}
                date={tx.date}
                isIn={tx.direction === "in"}
              />
            ))
          )}
        </View>

      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: { paddingBottom: 40 },

  // Sticky header bar (outside scroll)
  headerWrap: {
    backgroundColor: "#F2F2F7",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28, fontWeight: "700", color: "#1C1C1E",
    letterSpacing: -0.5, fontFamily: "Inter_700Bold",
    minWidth: 60,
  },

  // Mini balance that appears in the header when scrolled
  miniBalance: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1C1E",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },

  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#1254EC", shadowOpacity: 0.35, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 6,
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },

  balanceSection: { paddingHorizontal: 16, marginBottom: 16 },
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
  actionBtnText: { fontSize: 15, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },

  sectionRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: "700", color: "#1C1C1E",
    fontFamily: "Inter_700Bold", letterSpacing: -0.3,
  },
  seeAll: { fontSize: 14, color: "#1A5AFF", fontFamily: "Inter_600SemiBold" },

  // 2-column grid (default: large screens)
  grid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  // Single-column override (small screens)
  gridSingle: {
    flexDirection: "column",
    flexWrap: "nowrap",
  },

  actionCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16,
    minHeight: 156, shadowColor: "#000", shadowOpacity: 0.06,
    shadowRadius: 12, shadowOffset: { width: 0, height: 2 },
    elevation: 3, overflow: "hidden",
  },
  actionHead: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 4,
  },
  actionTitle: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  actionSub:   { fontSize: 11, color: "#8E8E93", fontFamily: "Inter_400Regular", marginTop: 1 },

  recentCard: {
    marginHorizontal: 16, backgroundColor: "#FFFFFF", borderRadius: 20,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 }, elevation: 3, overflow: "hidden",
  },
  emptyState:  { padding: 28, alignItems: "center" },
  emptyTitle:  { fontSize: 15, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  emptySub:    { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_400Regular" },

  txRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA",
  },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  txTitle:  { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  txDate:   { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular", marginTop: 1 },
  txAmount: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
