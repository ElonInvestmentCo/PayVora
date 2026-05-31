import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { hapticLight } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Feature Card (Cash App grid card style) ──────────────────────────────────

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  glowColor: string;
  onPress: () => void;
  testID?: string;
  /** Full-width card spanning both columns */
  wide?: boolean;
}

function FeatureCard({ title, subtitle, icon, accentColor, glowColor, onPress, testID, wide }: FeatureCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() =>
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: false, friction: 8 }).start()
  , [scaleAnim]);

  const onPressOut = useCallback(() =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: false, friction: 5 }).start()
  , [scaleAnim]);

  const shadow = Platform.OS === "web"
    ? { boxShadow: `0 2px 16px ${glowColor}20, 0 1px 4px rgba(0,0,0,0.5)` } as any
    : { shadowColor: glowColor, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 };

  return (
    <Pressable
      testID={testID}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => { hapticLight(); onPress(); }}
      style={wide ? styles.featureCardWide : styles.featureCardHalf}
    >
      <Animated.View style={[styles.featureCardInner, shadow, { transform: [{ scale: scaleAnim }] }]}>
        {/* gradient background */}
        <LinearGradient
          colors={["#0e1628", "#070d1a"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* top row: title + arrow */}
        <View style={styles.fcTop}>
          <Text style={styles.fcTitle} numberOfLines={1}>{title}</Text>
          <Feather name="chevron-right" size={14} color="rgba(148,163,184,0.55)" />
        </View>

        {/* icon accent area (like Cash App illustrations) */}
        <View style={[styles.fcIconWrap, { backgroundColor: `${accentColor}14` }]}>
          <LinearGradient
            colors={[`${accentColor}28`, `${accentColor}08`]}
            style={styles.fcIconGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.fcIconBubble, { backgroundColor: `${accentColor}20`, borderColor: `${accentColor}35` }]}>
              <Feather name={icon as any} size={22} color={accentColor} />
            </View>
          </LinearGradient>
        </View>

        {/* subtitle */}
        <Text style={styles.fcSubtitle} numberOfLines={1}>{subtitle}</Text>

        {/* bottom accent line */}
        <View style={[styles.fcAccentLine, { backgroundColor: accentColor }]} />
      </Animated.View>
    </Pressable>
  );
}

// ─── Market rate mini-bar ─────────────────────────────────────────────────────

const SPARKLINE = [62, 68, 64, 72, 70, 76, 74, 80, 77, 84];

function Sparkline({ color }: { color: string }) {
  const max = Math.max(...SPARKLINE);
  const min = Math.min(...SPARKLINE);
  const range = max - min || 1;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 28 }}>
      {SPARKLINE.map((v, i) => (
        <View
          key={i}
          style={{
            width: 5,
            height: 4 + ((v - min) / range) * 24,
            borderRadius: 2,
            backgroundColor: color,
            opacity: 0.35 + ((v - min) / range) * 0.65,
          }}
        />
      ))}
    </View>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

const FEATURE_GRID: FeatureCardProps[] = [
  {
    title: "Buy Gift Cards",
    subtitle: "Instant delivery",
    icon: "shopping-bag",
    accentColor: "#00E5FF",
    glowColor: "#00E5FF",
    onPress: () => router.push("/buy"),
    testID: "feature-buy-cards",
  },
  {
    title: "Sell Gift Cards",
    subtitle: "Best rates",
    icon: "tag",
    accentColor: "#00FF88",
    glowColor: "#00FF88",
    onPress: () => router.push("/sell"),
    testID: "feature-sell-cards",
  },
  {
    title: "Buy Crypto",
    subtitle: "BTC · ETH · SOL",
    icon: "trending-up",
    accentColor: "#F7931A",
    glowColor: "#F7931A",
    onPress: () => router.push("/buy-crypto"),
    testID: "feature-buy-crypto",
  },
  {
    title: "Sell Crypto",
    subtitle: "Instant payout",
    icon: "trending-down",
    accentColor: "#9945FF",
    glowColor: "#9945FF",
    onPress: () => router.push("/sell-crypto"),
    testID: "feature-sell-crypto",
  },
  {
    title: "Virtual Card",
    subtitle: "Dollar card",
    icon: "credit-card",
    accentColor: "#8B5CF6",
    glowColor: "#8B5CF6",
    onPress: () => router.push("/virtual-card"),
    testID: "feature-virtual-card",
  },
  {
    title: "Market Rates",
    subtitle: "Live prices",
    icon: "activity",
    accentColor: "#00E5FF",
    glowColor: "#00E5FF",
    onPress: () => router.push("/(tabs)/markets"),
    testID: "feature-markets",
  },
  {
    title: "Transactions",
    subtitle: "Full history",
    icon: "list",
    accentColor: "#F59E0B",
    glowColor: "#F59E0B",
    onPress: () => router.push("/transactions"),
    testID: "feature-transactions",
  },
  {
    title: "Support",
    subtitle: "24/7 help",
    icon: "headphones",
    accentColor: "#EC4899",
    glowColor: "#EC4899",
    onPress: () => router.push("/support"),
    testID: "feature-support",
  },
];

export default function HomeScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const isWeb   = Platform.OS === "web";
  const { ngnBalance, usdBalance, transactions } = useWallet();
  const { unreadCount, togglePanel } = useNotifications();

  const topPad    = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const recentTxs = transactions.slice(0, 3);

  return (
    <View style={[styles.root, { backgroundColor: "#060c18" }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: bottomPad + 110 }]}
      >

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greet()}</Text>
            <Text style={styles.userName}>Alex Johnson</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              testID="settings-button"
              onPress={() => router.push("/settings")}
              activeOpacity={0.8}
              style={styles.headerBtn}
            >
              <Feather name="settings" size={18} color="rgba(148,163,184,0.7)" />
            </TouchableOpacity>
            <TouchableOpacity
              testID="notifications-button"
              onPress={togglePanel}
              activeOpacity={0.8}
              style={styles.headerBtn}
            >
              <Feather name="bell" size={18} color="rgba(148,163,184,0.7)" />
              {unreadCount > 0 && <View style={styles.notifDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── PRIMARY BALANCE CARD ────────────────────────────────────────── */}
        <View style={styles.balanceCardOuter}>
          {/* ambient glow behind card */}
          <View style={[styles.balanceGlow, {
            ...(Platform.OS === "web"
              ? { boxShadow: "0 0 60px rgba(0,229,255,0.12), 0 0 120px rgba(139,92,246,0.08)" } as any
              : { shadowColor: "#00E5FF", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.18, shadowRadius: 40, elevation: 0 })
          }]} />

          <LinearGradient
            colors={["#0e1c38", "#081020"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            {/* gradient border overlay */}
            <LinearGradient
              colors={["rgba(0,229,255,0.3)", "rgba(139,92,246,0.15)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceBorder}
            />

            {/* top row */}
            <View style={styles.balanceTopRow}>
              <View>
                <Text style={styles.balanceLabel}>Cash Balance</Text>
                <TouchableOpacity activeOpacity={0.7} style={styles.accountLink}>
                  <Text style={styles.accountLinkText}>Account & Routing</Text>
                  <Feather name="chevron-right" size={12} color="rgba(0,229,255,0.7)" />
                </TouchableOpacity>
              </View>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>

            {/* NGN balance */}
            <Text style={styles.balanceAmount}>₦{ngnBalance.toLocaleString()}</Text>
            <Text style={styles.balanceUsd}>
              ≈ ${(ngnBalance / 750).toFixed(2)} USD
              {"  ·  "}
              <Text style={styles.balanceUsdSub}>${usdBalance.toLocaleString()} wallet</Text>
            </Text>

            {/* divider */}
            <LinearGradient
              colors={["transparent", "rgba(0,229,255,0.25)", "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.balanceDivider}
            />

            {/* action buttons */}
            <View style={styles.balanceActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("/transactions")}
                style={[styles.balanceBtn, styles.balanceBtnSecondary]}
              >
                <Feather name="arrow-up-right" size={16} color="#00E5FF" />
                <Text style={[styles.balanceBtnText, { color: "#00E5FF" }]}>Withdraw</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {}}
                style={[styles.balanceBtn, styles.balanceBtnPrimary]}
              >
                <Feather name="arrow-down-left" size={16} color="#060c18" />
                <Text style={[styles.balanceBtnText, { color: "#060c18" }]}>Deposit</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* ── FEATURE GRID ────────────────────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Services</Text>
        </View>
        <View style={styles.featureGrid}>
          {FEATURE_GRID.map((card, i) => (
            <FeatureCard key={i} {...card} />
          ))}
        </View>

        {/* ── MARKET OVERVIEW CARD ────────────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Live Gift Card Rates</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/markets")} activeOpacity={0.7}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={["#0a1830", "#070e1c"]}
          style={styles.marketCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <LinearGradient
            colors={["rgba(0,255,136,0.2)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.marketCardBorder}
          />

          <View style={styles.marketTop}>
            <View>
              <Text style={styles.marketBrand}>Amazon Gift Card</Text>
              <Text style={styles.marketBrandSub}>Best seller · USD · US Region</Text>
            </View>
            <View style={styles.marketTrendPill}>
              <Feather name="trending-up" size={11} color="#00FF88" />
              <Text style={styles.marketTrendText}>+4.2%</Text>
            </View>
          </View>

          <View style={styles.marketRateRow}>
            <View>
              <Text style={styles.marketRateLabel}>Current Rate</Text>
              <Text style={styles.marketRate}>₦750<Text style={styles.marketRateSub}>/USD</Text></Text>
            </View>
            <Sparkline color="#00FF88" />
          </View>

          <View style={styles.marketRateGrid}>
            {[
              { brand: "iTunes", rate: "₦720", change: "+1.8%" },
              { brand: "Steam",  rate: "₦700", change: "+6.5%" },
              { brand: "Google", rate: "₦710", change: "–0.5%" },
              { brand: "Xbox",   rate: "₦690", change: "+3.3%" },
            ].map((r) => (
              <View key={r.brand} style={styles.marketRateItem}>
                <Text style={styles.marketRateItemBrand}>{r.brand}</Text>
                <Text style={styles.marketRateItemRate}>{r.rate}</Text>
                <Text style={[
                  styles.marketRateItemChange,
                  { color: r.change.startsWith("+") ? "#00FF88" : "#EF4444" }
                ]}>{r.change}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/sell")}
            activeOpacity={0.85}
            style={styles.marketCta}
          >
            <LinearGradient
              colors={["#00FF88", "#00CC6A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.marketCtaGrad}
            >
              <Feather name="tag" size={15} color="#060c18" />
              <Text style={styles.marketCtaText}>Sell Gift Card Now</Text>
              <Feather name="arrow-right" size={15} color="#060c18" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── RECENT TRANSACTIONS ─────────────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push("/transactions")} activeOpacity={0.7}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txList}>
          {recentTxs.map((tx) => {
            const isIn = tx.direction === "in";
            const icon =
              tx.type === "crypto" ? "zap" :
              tx.type === "gift_card" ? "tag" :
              tx.type === "bills" ? "smartphone" : "dollar-sign";
            const iconColor =
              tx.type === "crypto" ? "#F7931A" :
              tx.type === "gift_card" ? "#00E5FF" :
              tx.type === "bills" ? "#F59E0B" : "#00FF88";
            return (
              <View key={tx.id} style={styles.txRow}>
                <View style={[styles.txIcon, { backgroundColor: `${iconColor}18` }]}>
                  <Feather name={icon as any} size={16} color={iconColor} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle} numberOfLines={1}>{tx.title}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, { color: isIn ? "#00FF88" : "#EF4444" }]}>
                    {isIn ? "+" : "–"}
                    {tx.currency === "NGN" ? "₦" : "$"}
                    {tx.amount.toLocaleString()}
                  </Text>
                  <View style={[
                    styles.txStatus,
                    { backgroundColor: tx.status === "success" ? "rgba(0,255,136,0.12)" : "rgba(245,158,11,0.12)" }
                  ]}>
                    <Text style={[
                      styles.txStatusText,
                      { color: tx.status === "success" ? "#00FF88" : "#F59E0B" }
                    ]}>{tx.status}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 18 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(148,163,184,0.7)",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#E2E8F0",
    letterSpacing: -0.3,
  },
  headerActions: { flexDirection: "row", gap: 10 },
  headerBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#0e1628",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  notifDot: {
    position: "absolute", top: 9, right: 9,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: "#00E5FF",
  },

  // Balance card
  balanceCardOuter: { marginBottom: 28, position: "relative" },
  balanceGlow: {
    position: "absolute",
    inset: -20,
    borderRadius: 40,
    zIndex: 0,
  },
  balanceCard: {
    borderRadius: 22,
    padding: 22,
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
    borderWidth: 1,
    borderColor: "rgba(0,229,255,0.12)",
  },
  balanceBorder: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 1,
    borderRadius: 22,
  },
  balanceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  balanceLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#94A3B8",
    marginBottom: 3,
  },
  accountLink: { flexDirection: "row", alignItems: "center", gap: 2 },
  accountLinkText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(0,229,255,0.7)",
  },
  livePill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(0,255,136,0.1)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00FF88" },
  liveText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#00FF88" },

  balanceAmount: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: "#F1F5F9",
    letterSpacing: -1.5,
    marginBottom: 5,
  },
  balanceUsd: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    marginBottom: 20,
  },
  balanceUsdSub: {
    color: "#475569",
    fontFamily: "Inter_400Regular",
  },
  balanceDivider: { height: 1, marginBottom: 18 },
  balanceActions: { flexDirection: "row", gap: 12 },
  balanceBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 7,
    borderRadius: 13, paddingVertical: 14,
  },
  balanceBtnSecondary: {
    backgroundColor: "rgba(0,229,255,0.08)",
    borderWidth: 1, borderColor: "rgba(0,229,255,0.2)",
  },
  balanceBtnPrimary: {
    backgroundColor: "#00E5FF",
  },
  balanceBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // Section headers
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#CBD5E1",
    letterSpacing: -0.2,
  },
  sectionLink: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#00E5FF",
  },

  // Feature grid — Cash App 2-column card layout
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  featureCardHalf: { width: "48%", flexGrow: 1 },
  featureCardWide: { width: "100%" },
  featureCardInner: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 0,
    minHeight: 148,
    gap: 0,
    position: "relative",
  },
  fcTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  fcTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#CBD5E1",
    flex: 1,
  },
  fcIconWrap: {
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  fcIconGrad: {
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 68,
  },
  fcIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fcSubtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#475569",
    marginBottom: 14,
  },
  fcAccentLine: {
    height: 2.5,
    borderRadius: 2,
    marginHorizontal: -14,
    opacity: 0.55,
  },

  // Market card
  marketCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.12)",
    padding: 18,
    marginBottom: 28,
    position: "relative",
    gap: 16,
  },
  marketCardBorder: {
    position: "absolute",
    top: 0, left: 0, right: 0, height: 1,
    borderRadius: 20,
  },
  marketTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  marketBrand: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#E2E8F0",
    marginBottom: 3,
  },
  marketBrandSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#475569",
  },
  marketTrendPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,255,136,0.12)",
    borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5,
  },
  marketTrendText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#00FF88",
  },
  marketRateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  marketRateLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#475569",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  marketRate: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#00E5FF",
    letterSpacing: -1,
  },
  marketRateSub: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#334155",
  },
  marketRateGrid: {
    flexDirection: "row",
    gap: 0,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  marketRateItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.05)",
    gap: 2,
  },
  marketRateItemBrand: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#64748B",
  },
  marketRateItemRate: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#CBD5E1",
  },
  marketRateItemChange: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  marketCta: { borderRadius: 13, overflow: "hidden" },
  marketCtaGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  marketCtaText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#060c18",
  },

  // Recent transactions
  txList: {
    gap: 10,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#0a1220",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 4,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#0d1728",
  },
  txIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  txInfo: { flex: 1, gap: 3 },
  txTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#CBD5E1",
  },
  txDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#475569",
  },
  txRight: { alignItems: "flex-end", gap: 4 },
  txAmount: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  txStatus: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  txStatusText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textTransform: "capitalize",
  },
});
