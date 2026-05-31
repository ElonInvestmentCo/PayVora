import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { hapticLight } from "@/utils/haptics";
import { router } from "expo-router";
import Svg, { Path, Polyline } from "react-native-svg";

const { width: W } = Dimensions.get("window");

const CATEGORIES = ["All", "Crypto", "Trending", "Top Gainers", "Top Losers"];

const ASSETS = [
  { id: "bitcoin",       symbol: "BTC",  name: "Bitcoin",  cap: "$880B",  price: 45200,    change: 2.41,   spark: [38,40,37,42,39,43,41,44,42,46,44,47,45] },
  { id: "ethereum",      symbol: "ETH",  name: "Ethereum", cap: "$343B",  price: 2860,     change: -1.22,  spark: [52,50,53,48,51,47,50,46,49,45,48,44,47] },
  { id: "tether",        symbol: "USDT", name: "Tether",   cap: "$120B",  price: 1.00,     change: 0.01,   spark: [50,50,50,50,51,50,50,50,50,50,51,50,50] },
  { id: "solana",        symbol: "SOL",  name: "Solana",   cap: "$65B",   price: 142,      change: 5.82,   spark: [30,33,31,36,34,38,36,41,39,43,41,45,44] },
  { id: "ripple",        symbol: "XRP",  name: "Ripple",   cap: "$34B",   price: 0.62,     change: -0.52,  spark: [48,47,49,46,48,45,47,44,46,43,45,42,44] },
  { id: "binancecoin",   symbol: "BNB",  name: "BNB",      cap: "$46B",   price: 312,      change: 1.12,   spark: [44,45,43,46,44,47,45,48,46,49,47,50,49] },
  { id: "cardano",       symbol: "ADA",  name: "Cardano",  cap: "$16B",   price: 0.46,     change: -2.1,   spark: [55,53,56,51,54,49,52,47,50,45,48,43,46] },
  { id: "avalanche-2",   symbol: "AVAX", name: "Avalanche",cap: "$18B",   price: 38.4,     change: 3.8,    spark: [35,37,36,39,38,41,40,43,42,45,44,47,46] },
];

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const H = 32;
  const W = 64;
  const step = W / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${H - ((v - min) / range) * H}`).join(" ");
  const color = positive ? "#00C48C" : "#FF3B30";
  return (
    <Svg width={W} height={H}>
      <Polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CryptoIcon({ symbol, size = 40 }: { symbol: string; size?: number }) {
  const [err, setErr] = useState(false);
  const COLORS: Record<string, string> = {
    BTC: "#F7931A", ETH: "#627EEA", USDT: "#26A17B", SOL: "#9945FF",
    XRP: "#23292F", BNB: "#F3BA2F", ADA: "#0033AD", AVAX: "#E84142",
  };
  const c = COLORS[symbol] ?? "#888";
  if (err) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${c}33`, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: c, fontFamily: "Inter_700Bold", fontSize: size * 0.4 }}>{symbol[0]}</Text>
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

export default function MarketsScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 60 : insets.top;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [liveData, setLiveData] = useState<Record<string, LivePrice>>({});
  const [pricesReady, setPricesReady] = useState(false);

  useEffect(() => {
    const ids = ASSETS.map((a) => a.id).join(",");
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`)
      .then((r) => r.json())
      .then((data) => {
        const mapped: Record<string, LivePrice> = {};
        ASSETS.forEach((a) => {
          if (data[a.id]) mapped[a.symbol] = { price: data[a.id].usd, change: data[a.id].usd_24h_change };
        });
        setLiveData(mapped);
        setPricesReady(true);
      })
      .catch(() => setPricesReady(true));
  }, []);

  const filtered = ASSETS.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (category === "Top Gainers") return (liveData[a.symbol]?.change ?? a.change) > 1;
    if (category === "Top Losers") return (liveData[a.symbol]?.change ?? a.change) < 0;
    return true;
  });

  const formatPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    return `$${p.toFixed(4)}`;
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#07070F", "#0C0C1E", "#070714"]} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>Markets</Text>
        <View style={styles.headerRight}>
          {!pricesReady && <ActivityIndicator size="small" color="rgba(255,255,255,0.4)" />}
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTxt}>LIVE</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Market Cap",  value: "$2.1T",  color: "#00C48C" },
          { label: "24h Volume",  value: "$84.3B", color: "#1A5AFF" },
          { label: "BTC Dominance", value: "54.2%", color: "#F7931A" },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLbl}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.searchWrap]}>
        <Feather name="search" size={16} color="rgba(255,255,255,0.35)" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search coins..."
          placeholderTextColor="rgba(255,255,255,0.25)"
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={16} color="rgba(255,255,255,0.35)" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => { hapticLight(); setCategory(cat); }}
            activeOpacity={0.8}
            style={[styles.catChip, category === cat && styles.catChipActive]}
          >
            <Text style={[styles.catTxt, category === cat && styles.catTxtActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        <View style={styles.assetList}>
          {filtered.map((asset, idx) => {
            const price = liveData[asset.symbol]?.price ?? asset.price;
            const change = liveData[asset.symbol]?.change ?? asset.change;
            const positive = change >= 0;
            const isLast = idx === filtered.length - 1;
            return (
              <TouchableOpacity
                key={asset.symbol}
                onPress={() => { hapticLight(); router.push("/buy-crypto" as any); }}
                activeOpacity={0.75}
                style={[styles.assetRow, !isLast && styles.assetRowBorder]}
              >
                <CryptoIcon symbol={asset.symbol} size={44} />
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetSym}>{asset.symbol} · {asset.cap}</Text>
                </View>
                <View style={styles.assetSpark}>
                  <Sparkline data={asset.spark} positive={positive} />
                </View>
                <View style={styles.assetPrice}>
                  <Text style={styles.priceTxt}>{formatPrice(price)}</Text>
                  <View style={[styles.changePill, { backgroundColor: positive ? "rgba(0,196,140,0.15)" : "rgba(255,59,48,0.15)" }]}>
                    <Text style={[styles.changeTxt, { color: positive ? "#00C48C" : "#FF3B30" }]}>
                      {positive ? "+" : ""}{change.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#07070F" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  liveChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(0,196,140,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00C48C" },
  liveTxt: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#00C48C", letterSpacing: 0.5 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)", padding: 12, gap: 2,
  },
  statVal: { fontSize: 15, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12,
    paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#FFFFFF" },
  catRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 14 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  catChipActive: { backgroundColor: "#1A5AFF", borderColor: "#1A5AFF" },
  catTxt: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.5)" },
  catTxtActive: { color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  assetList: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  assetRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 14 },
  assetRowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  assetInfo: { flex: 1, gap: 3 },
  assetName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  assetSym: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  assetSpark: { marginRight: 4 },
  assetPrice: { alignItems: "flex-end", gap: 4, minWidth: 80 },
  priceTxt: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  changePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  changeTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
