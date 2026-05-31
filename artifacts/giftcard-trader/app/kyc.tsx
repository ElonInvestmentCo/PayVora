import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { hapticLight, hapticMedium } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

const { width: W } = Dimensions.get("window");
const TILE_W = (W - 52) / 2;

const TILES = [
  { label: "Buy\nGift Cards",    sub: "500+ brands",       icon: "gift",          route: "/buy",          g: ["#4158D0", "#C850C0"] as const },
  { label: "Sell\nGift Cards",   sub: "Best rates",        icon: "tag",           route: "/sell",         g: ["#0093E9", "#80D0C7"] as const },
  { label: "Buy\nCrypto",        sub: "Market & limit",    icon: "trending-up",   route: "/buy-crypto",   g: ["#1A5AFF", "#7C3AED"] as const },
  { label: "Sell\nCrypto",       sub: "Instant payout",    icon: "trending-down", route: "/sell-crypto",  g: ["#00C48C", "#0093A7"] as const },
  { label: "Virtual\nCard",      sub: "Visa powered",      icon: "credit-card",   route: "/virtual-card", g: ["#FF6B6B", "#FF8E53"] as const },
  { label: "Bills &\neSIMs",     sub: "Pay anywhere",      icon: "zap",           route: "/bills",        g: ["#A855F7", "#6366F1"] as const },
];

const COIN_ASSETS = [
  { id: "bitcoin",      symbol: "BTC", name: "Bitcoin",  price: 45200,   change: 2.4  },
  { id: "ethereum",     symbol: "ETH", name: "Ethereum", price: 2860,    change: -1.2 },
  { id: "tether",       symbol: "USDT", name: "Tether",  price: 1.00,    change: 0.01 },
  { id: "solana",       symbol: "SOL", name: "Solana",   price: 142,     change: 5.8  },
  { id: "ripple",       symbol: "XRP", name: "Ripple",   price: 0.62,    change: -0.5 },
  { id: "binancecoin",  symbol: "BNB", name: "BNB",      price: 312,     change: 1.1  },
];

function CryptoIcon({ symbol, size = 36 }: { symbol: string; size?: number }) {
  const [err, setErr] = useState(false);
  const COLORS: Record<string, string> = {
    BTC: "#F7931A", ETH: "#627EEA", USDT: "#26A17B",
    SOL: "#9945FF", XRP: "#23292F", BNB: "#F3BA2F",
  };
  const c = COLORS[symbol] ?? "#888";
  if (err) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${c}33`, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: c, fontFamily: "Inter_700Bold", fontSize: size * 0.42 }}>{symbol[0]}</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/200` }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => setErr(true)}
    />
  );
}

interface LivePrice { price: number; change: number; }

export default function TradingHubScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 60 : insets.top;
  const { usdBalance } = useWallet();
  const { unreadCount } = useNotifications();

  const [liveData, setLiveData] = useState<Record<string, LivePrice>>({});
  const [pricesReady, setPricesReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const ids = COIN_ASSETS.map((c) => c.id).join(",");
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`)
      .then((r) => r.json())
      .then((data) => {
        const mapped: Record<string, LivePrice> = {};
        COIN_ASSETS.forEach((c) => {
          if (data[c.id]) mapped[c.symbol] = { price: data[c.id].usd, change: data[c.id].usd_24h_change };
        });
        setLiveData(mapped);
        setPricesReady(true);
      })
      .catch(() => setPricesReady(true));
  }, []);

  const getPrice = useCallback((symbol: string, fallback: number) => {
    return liveData[symbol]?.price ?? fallback;
  }, [liveData]);

  const getChange = useCallback((symbol: string, fallback: number) => {
    return liveData[symbol]?.change ?? fallback;
  }, [liveData]);

  const formatPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    return `$${p.toFixed(4)}`;
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#07070F", "#0C0C1E", "#070714"]} style={StyleSheet.absoluteFill} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity
            onPress={() => { hapticLight(); router.back(); }}
            style={styles.iconBtn}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>PayVora</Text>
            <View style={styles.liveDot} />
          </View>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8} onPress={() => hapticLight()}>
            <Feather name="bell" size={20} color={unreadCount > 0 ? "#1A5AFF" : "#FFFFFF"} />
            {unreadCount > 0 && <View style={styles.badge}><Text style={styles.badgeTxt}>{unreadCount}</Text></View>}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 40 }]}>

          <LinearGradient
            colors={["rgba(26,90,255,0.2)", "rgba(124,58,237,0.12)"]}
            style={styles.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceBorder}>
              <Text style={styles.balanceLbl}>USD Wallet</Text>
              <Text style={styles.balanceAmt}>${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              <View style={styles.balanceRow}>
                <View style={styles.balanceStat}>
                  <Feather name="trending-up" size={12} color="#00C48C" />
                  <Text style={styles.balanceStatTxt}>+2.4% today</Text>
                </View>
                <View style={[styles.verifiedBadge]}>
                  <Feather name="shield" size={11} color="#1A5AFF" />
                  <Text style={styles.verifiedTxt}>Secure</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.tileGrid}>
            {TILES.map((tile) => (
              <TouchableOpacity
                key={tile.route}
                onPress={() => { hapticMedium(); router.push(tile.route as any); }}
                activeOpacity={0.82}
                style={styles.tileWrap}
              >
                <LinearGradient
                  colors={tile.g}
                  style={styles.tile}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.tileIconWrap}>
                    <Feather name={tile.icon as any} size={22} color="rgba(255,255,255,0.95)" />
                  </View>
                  <Text style={styles.tileLbl}>{tile.label}</Text>
                  <Text style={styles.tileSub}>{tile.sub}</Text>
                  <View style={styles.tileArrow}>
                    <Feather name="arrow-right" size={12} color="rgba(255,255,255,0.6)" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Live Markets</Text>
            {!pricesReady && <ActivityIndicator size="small" color="rgba(255,255,255,0.4)" />}
          </View>

          <View style={styles.marketCard}>
            {COIN_ASSETS.map((asset, idx) => {
              const price = getPrice(asset.symbol, asset.price);
              const change = getChange(asset.symbol, asset.change);
              const positive = change >= 0;
              const isLast = idx === COIN_ASSETS.length - 1;
              return (
                <TouchableOpacity
                  key={asset.symbol}
                  onPress={() => { hapticLight(); router.push("/buy-crypto" as any); }}
                  activeOpacity={0.75}
                  style={[styles.coinRow, !isLast && styles.coinRowBorder]}
                >
                  <CryptoIcon symbol={asset.symbol} size={40} />
                  <View style={styles.coinInfo}>
                    <Text style={styles.coinName}>{asset.name}</Text>
                    <Text style={styles.coinSymbol}>{asset.symbol}</Text>
                  </View>
                  <View style={styles.coinPrices}>
                    <Text style={styles.coinPrice}>{formatPrice(price)}</Text>
                    <View style={[styles.changePill, { backgroundColor: positive ? "rgba(0,196,140,0.15)" : "rgba(255,59,48,0.15)" }]}>
                      <Feather name={positive ? "trending-up" : "trending-down"} size={10} color={positive ? "#00C48C" : "#FF3B30"} />
                      <Text style={[styles.changeTxt, { color: positive ? "#00C48C" : "#FF3B30" }]}>
                        {positive ? "+" : ""}{change.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={() => { hapticLight(); router.push("/(tabs)/markets" as any); }}
            activeOpacity={0.8}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllTxt}>View All Markets</Text>
            <Feather name="arrow-right" size={14} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#07070F" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#00C48C" },
  badge: {
    position: "absolute", top: -4, right: -4, width: 16, height: 16,
    borderRadius: 8, backgroundColor: "#FF3B30", alignItems: "center", justifyContent: "center",
  },
  badgeTxt: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  content: { paddingHorizontal: 20, gap: 20 },
  balanceCard: {
    borderRadius: 20, padding: 1,
  },
  balanceBorder: {
    borderRadius: 19, backgroundColor: "rgba(10,10,20,0.6)",
    padding: 22, gap: 6,
  },
  balanceLbl: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.8 },
  balanceAmt: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  balanceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  balanceStat: { flexDirection: "row", alignItems: "center", gap: 6 },
  balanceStatTxt: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#00C48C" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(26,90,255,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  verifiedTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#1A5AFF" },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tileWrap: { width: TILE_W },
  tile: { borderRadius: 20, padding: 18, height: 130, justifyContent: "flex-end", overflow: "hidden" },
  tileIconWrap: {
    position: "absolute", top: 16, left: 16,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  tileLbl: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF", lineHeight: 18 },
  tileSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", marginTop: 2 },
  tileArrow: {
    position: "absolute", top: 16, right: 14,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  marketCard: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  coinRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, paddingVertical: 14 },
  coinRowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  coinInfo: { flex: 1, gap: 2 },
  coinName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  coinSymbol: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)" },
  coinPrices: { alignItems: "flex-end", gap: 4 },
  coinPrice: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  changePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  changeTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  seeAllBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 14, paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  seeAllTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.7)" },
});
