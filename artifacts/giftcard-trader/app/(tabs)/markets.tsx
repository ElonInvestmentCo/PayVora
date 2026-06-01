import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hapticLight } from "@/utils/haptics";
import { router } from "expo-router";
import Svg, { Path, Polyline } from "react-native-svg";

const CATEGORIES = ["All", "Crypto", "Trending", "Top Gainers", "Top Losers"];

const ASSETS = [
  { id: "bitcoin",     symbol: "BTC",  name: "Bitcoin",   cap: "$880B",  price: 45200,  change: 2.41,   spark: [38,40,37,42,39,43,41,44,42,46,44,47,45] },
  { id: "ethereum",    symbol: "ETH",  name: "Ethereum",  cap: "$343B",  price: 2860,   change: -1.22,  spark: [52,50,53,48,51,47,50,46,49,45,48,44,47] },
  { id: "tether",      symbol: "USDT", name: "Tether",    cap: "$120B",  price: 1.00,   change: 0.01,   spark: [50,50,50,50,51,50,50,50,50,50,51,50,50] },
  { id: "solana",      symbol: "SOL",  name: "Solana",    cap: "$65B",   price: 142,    change: 5.82,   spark: [30,33,31,36,34,38,36,41,39,43,41,45,44] },
  { id: "ripple",      symbol: "XRP",  name: "Ripple",    cap: "$34B",   price: 0.62,   change: -0.52,  spark: [48,47,49,46,48,45,47,44,46,43,45,42,44] },
  { id: "binancecoin", symbol: "BNB",  name: "BNB",       cap: "$46B",   price: 312,    change: 1.12,   spark: [44,45,43,46,44,47,45,48,46,49,47,50,49] },
  { id: "cardano",     symbol: "ADA",  name: "Cardano",   cap: "$16B",   price: 0.46,   change: -2.1,   spark: [55,53,56,51,54,49,52,47,50,45,48,43,46] },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", cap: "$18B",   price: 38.4,   change: 3.8,    spark: [35,37,36,39,38,41,40,43,42,45,44,47,46] },
];

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const H = 32, W = 64;
  const step = W / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${H - ((v - min) / range) * H}`).join(" ");
  const color = positive ? "#30D158" : "#FF3B30";
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
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c + "18", alignItems: "center", justifyContent: "center" }}>
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

  const totalMarketCap = "$2.1T";
  const volume24h = "$84.3B";
  const btcDominance = "54.2%";

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Markets</Text>
          <View style={s.headerRight}>
            {!pricesReady && <ActivityIndicator size="small" color="#8E8E93" />}
            <View style={s.liveChip}>
              <View style={s.liveDot} />
              <Text style={s.liveTxt}>LIVE</Text>
            </View>
          </View>
        </View>

        {/* ── Market Stats ── */}
        <View style={s.statsRow}>
          {[
            { label: "Market Cap",    value: totalMarketCap, color: "#30D158" },
            { label: "24h Volume",    value: volume24h,      color: "#1A5AFF" },
            { label: "BTC Dominance", value: btcDominance,   color: "#F7931A" },
          ].map((st) => (
            <View key={st.label} style={s.statCard}>
              <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
              <Text style={s.statLbl}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Search ── */}
        <View style={s.section}>
          <View style={s.searchBar}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search coins…"
              placeholderTextColor="#8E8E93"
              style={s.searchInput}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.8}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Category Tabs ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => { hapticLight(); setCategory(cat); }}
              activeOpacity={0.8}
              style={[s.catChip, category === cat && s.catChipActive]}
            >
              <Text style={[s.catTxt, category === cat && s.catTxtActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Asset List ── */}
        <View style={s.section}>
          <View style={s.assetList}>
            {filtered.map((asset, idx) => {
              const price = liveData[asset.symbol]?.price ?? asset.price;
              const change = liveData[asset.symbol]?.change ?? asset.change;
              const positive = change >= 0;
              const isLast = idx === filtered.length - 1;
              return (
                <TouchableOpacity
                  key={asset.symbol}
                  onPress={() => { hapticLight(); router.push("/buy-crypto" as any); }}
                  activeOpacity={0.8}
                  style={[s.assetRow, !isLast && s.assetRowBorder]}
                >
                  <CryptoIcon symbol={asset.symbol} size={44} />
                  <View style={s.assetInfo}>
                    <Text style={s.assetName}>{asset.name}</Text>
                    <Text style={s.assetSym}>{asset.symbol} · {asset.cap}</Text>
                  </View>
                  <View style={s.assetSpark}>
                    <Sparkline data={asset.spark} positive={positive} />
                  </View>
                  <View style={s.assetPrice}>
                    <Text style={s.priceTxt}>{formatPrice(price)}</Text>
                    <View style={[s.changePill, { backgroundColor: positive ? "#30D15812" : "#FF3B3012" }]}>
                      <Text style={[s.changeTxt, { color: positive ? "#30D158" : "#FF3B30" }]}>
                        {positive ? "+" : ""}{change.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            {filtered.length === 0 && (
              <View style={s.emptyState}>
                <Text style={s.emptyTitle}>No results</Text>
                <Text style={s.emptySub}>Try a different search or filter</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: { paddingBottom: 120 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  liveChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#30D15815", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#30D158" },
  liveTxt: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#30D158", letterSpacing: 0.5 },

  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 10 },
  statCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, gap: 3,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statVal: { fontSize: 15, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#8E8E93" },

  section: { paddingHorizontal: 16, marginBottom: 10 },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 14, height: 46,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1C1C1E", fontFamily: "Inter_400Regular" },

  catRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12, paddingRight: 20 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  catChipActive: { backgroundColor: "#1A5AFF" },
  catTxt: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8E8E93" },
  catTxtActive: { color: "#FFFFFF", fontFamily: "Inter_700Bold" },

  assetList: {
    backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  assetRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  assetRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  assetInfo: { flex: 1, gap: 3 },
  assetName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  assetSym: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  assetSpark: { marginRight: 4 },
  assetPrice: { alignItems: "flex-end", gap: 4, minWidth: 80 },
  priceTxt: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  changePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  changeTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  emptyState: { padding: 32, alignItems: "center" },
  emptyTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 4 },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },
});
