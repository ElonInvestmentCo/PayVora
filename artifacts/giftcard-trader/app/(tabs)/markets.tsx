import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

type MarketTab = "all" | "crypto" | "giftcards" | "trending";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  price: string;
  change: number;
  volume: string;
  icon: string;
  iconColor: string;
  category: "crypto" | "giftcards";
  sparkline: number[];
}

const MARKET_TABS: { id: MarketTab; label: string }[] = [
  { id: "all",       label: "All" },
  { id: "crypto",    label: "Crypto" },
  { id: "giftcards", label: "Gift Cards" },
  { id: "trending",  label: "Trending" },
];

const ASSETS: Asset[] = [
  { id: "1",  name: "Bitcoin",       symbol: "BTC",    price: "$45,230.50", change: 3.42,  volume: "$28.5B", icon: "trending-up",   iconColor: "#F7931A", category: "crypto",    sparkline: [40,42,38,45,43,48,46,50] },
  { id: "2",  name: "Ethereum",      symbol: "ETH",    price: "$2,856.80",  change: 2.18,  volume: "$15.2B", icon: "trending-up",   iconColor: "#627EEA", category: "crypto",    sparkline: [30,32,28,35,33,37,36,38] },
  { id: "3",  name: "Solana",        symbol: "SOL",    price: "$142.35",    change: 5.67,  volume: "$4.8B",  icon: "trending-up",   iconColor: "#9945FF", category: "crypto",    sparkline: [20,25,22,30,28,35,32,38] },
  { id: "4",  name: "BNB",           symbol: "BNB",    price: "$312.40",    change: -1.23, volume: "$2.1B",  icon: "trending-down", iconColor: "#F3BA2F", category: "crypto",    sparkline: [35,33,36,30,32,28,30,29] },
  { id: "5",  name: "USDT",          symbol: "USDT",   price: "$1.00",      change: 0.01,  volume: "$42.1B", icon: "minus",         iconColor: "#26A17B", category: "crypto",    sparkline: [50,50,50,50,50,50,50,50] },
  { id: "6",  name: "XRP",           symbol: "XRP",    price: "$0.6245",    change: -2.85, volume: "$1.8B",  icon: "trending-down", iconColor: "#00AAE4", category: "crypto",    sparkline: [40,38,42,35,37,32,34,31] },
  { id: "7",  name: "Amazon",        symbol: "AMZN",   price: "$25 – $500", change: 4.20,  volume: "12.4K",  icon: "shopping-bag",  iconColor: "#FF9900", category: "giftcards", sparkline: [25,28,30,32,35,33,38,40] },
  { id: "8",  name: "iTunes",        symbol: "AAPL",   price: "$10 – $200", change: 1.80,  volume: "8.2K",   icon: "music",         iconColor: "#A3AAAE", category: "giftcards", sparkline: [30,32,31,34,33,35,34,36] },
  { id: "9",  name: "Steam",         symbol: "STEAM",  price: "$20 – $100", change: 6.50,  volume: "5.6K",   icon: "monitor",       iconColor: "#1B2838", category: "giftcards", sparkline: [20,22,25,28,30,35,33,40] },
  { id: "10", name: "Google Play",   symbol: "GOOG",   price: "$10 – $150", change: -0.50, volume: "3.8K",   icon: "play",          iconColor: "#4285F4", category: "giftcards", sparkline: [35,34,36,33,35,32,34,33] },
];

function MiniChart({ data, positive }: { data: number[]; positive: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const color = positive ? "#00FF88" : "#EF4444";
  return (
    <View style={mcStyles.wrap}>
      {data.map((v, i) => {
        const pct = (v - min) / range;
        return (
          <View key={i} style={mcStyles.col}>
            <View style={{ height: 2 + pct * 20, borderRadius: 1, backgroundColor: `${color}${Math.round(40 + pct * 60).toString(16).padStart(2, '0')}` }} />
          </View>
        );
      })}
    </View>
  );
}
const mcStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 1, width: 48, height: 24 },
  col: { flex: 1, justifyContent: "flex-end" },
});

export default function MarketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const [activeTab, setActiveTab] = useState<MarketTab>("all");
  const [search, setSearch] = useState("");

  const filtered = ASSETS.filter((a) => {
    if (activeTab === "trending") return a.change > 3;
    if (activeTab !== "all" && a.category !== activeTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!a.name.toLowerCase().includes(q) && !a.symbol.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalMarketCap = "$1.82T";
  const totalVolume24h = "$94.3B";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Markets</Text>
        <TouchableOpacity onPress={() => router.push("/leaderboard")} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="award" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">
        {/* Market overview */}
        <View style={styles.overviewRow}>
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.ovLabel, { color: colors.mutedForeground }]}>Market Cap</Text>
            <Text style={[styles.ovValue, { color: colors.foreground }]}>{totalMarketCap}</Text>
            <View style={[styles.ovPill, { backgroundColor: "rgba(0,255,136,0.12)" }]}>
              <Feather name="trending-up" size={10} color="#00FF88" />
              <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#00FF88" }}>+2.4%</Text>
            </View>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.ovLabel, { color: colors.mutedForeground }]}>24h Volume</Text>
            <Text style={[styles.ovValue, { color: colors.foreground }]}>{totalVolume24h}</Text>
            <View style={[styles.ovPill, { backgroundColor: "rgba(0,229,255,0.12)" }]}>
              <Feather name="activity" size={10} color="#00E5FF" />
              <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#00E5FF" }}>Active</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search assets..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {MARKET_TABS.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              activeOpacity={0.8}
              style={[styles.tabChip, { backgroundColor: activeTab === t.id ? "rgba(0,229,255,0.15)" : colors.card, borderColor: activeTab === t.id ? colors.primary : colors.border }]}
            >
              <Text style={[styles.tabText, { color: activeTab === t.id ? colors.primary : colors.mutedForeground }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, { color: colors.mutedForeground, flex: 1 }]}>Asset</Text>
          <Text style={[styles.thText, { color: colors.mutedForeground, width: 52, textAlign: "center" }]}>Chart</Text>
          <Text style={[styles.thText, { color: colors.mutedForeground, width: 100, textAlign: "right" }]}>Price</Text>
          <Text style={[styles.thText, { color: colors.mutedForeground, width: 64, textAlign: "right" }]}>24h</Text>
        </View>

        {/* Asset list */}
        {filtered.map((asset) => {
          const isPositive = asset.change >= 0;
          return (
            <TouchableOpacity
              key={asset.id}
              activeOpacity={0.8}
              onPress={() => asset.category === "crypto" ? router.push("/buy-crypto") : router.push("/buy")}
              style={[styles.assetRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.assetIcon, { backgroundColor: `${asset.iconColor}18` }]}>
                <Feather name={asset.icon as any} size={16} color={asset.iconColor} />
              </View>
              <View style={styles.assetInfo}>
                <Text style={[styles.assetName, { color: colors.foreground }]}>{asset.name}</Text>
                <Text style={[styles.assetSymbol, { color: colors.mutedForeground }]}>{asset.symbol}</Text>
              </View>
              <MiniChart data={asset.sparkline} positive={isPositive} />
              <View style={styles.priceCol}>
                <Text style={[styles.assetPrice, { color: colors.foreground }]}>{asset.price}</Text>
                <Text style={[styles.assetVolume, { color: colors.mutedForeground }]}>{asset.volume}</Text>
              </View>
              <View style={[styles.changePill, { backgroundColor: isPositive ? "rgba(0,255,136,0.12)" : "rgba(239,68,68,0.12)" }]}>
                <Feather name={isPositive ? "trending-up" : "trending-down"} size={10} color={isPositive ? "#00FF88" : "#EF4444"} />
                <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: isPositive ? "#00FF88" : "#EF4444" }}>
                  {isPositive ? "+" : ""}{asset.change}%
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  content: { padding: 20, gap: 14 },

  overviewRow: { flexDirection: "row", gap: 10 },
  overviewCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, gap: 6 },
  ovLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },
  ovValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  ovPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },

  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },

  tabScroll: { gap: 8 },
  tabChip: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  tableHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 4 },
  thText: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },

  assetRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, padding: 12,
  },
  assetIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  assetInfo: { flex: 1, gap: 2 },
  assetName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  assetSymbol: { fontSize: 11, fontFamily: "Inter_400Regular" },
  priceCol: { alignItems: "flex-end", gap: 2 },
  assetPrice: { fontSize: 13, fontFamily: "Inter_700Bold" },
  assetVolume: { fontSize: 10, fontFamily: "Inter_400Regular" },
  changePill: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4 },
});
