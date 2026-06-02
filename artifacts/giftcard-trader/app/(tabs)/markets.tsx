import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Polyline } from "react-native-svg";
import { hapticLight } from "@/utils/haptics";

const ASSETS = [
  { id: "btc",   symbol: "BTC",   name: "Bitcoin",    price: 67420.50, change:  2.34, color: "#F7931A" },
  { id: "eth",   symbol: "ETH",   name: "Ethereum",   price:  3512.80, change: -1.12, color: "#627EEA" },
  { id: "sol",   symbol: "SOL",   name: "Solana",     price:   178.90, change:  5.67, color: "#9945FF" },
  { id: "bnb",   symbol: "BNB",   name: "BNB",        price:   608.40, change:  0.88, color: "#F3BA2F" },
  { id: "xrp",   symbol: "XRP",   name: "XRP",        price:     0.582, change: -2.45, color: "#346AA9" },
  { id: "ada",   symbol: "ADA",   name: "Cardano",    price:     0.443, change:  1.90, color: "#0033AD" },
  { id: "dot",   symbol: "DOT",   name: "Polkadot",   price:     7.21,  change: -0.73, color: "#E6007A" },
  { id: "link",  symbol: "LINK",  name: "Chainlink",  price:    14.56,  change:  3.21, color: "#2A5ADA" },
  { id: "avax",  symbol: "AVAX",  name: "Avalanche",  price:    35.18,  change: -1.55, color: "#E84142" },
  { id: "matic", symbol: "MATIC", name: "Polygon",    price:     0.892, change:  4.08, color: "#8247E5" },
];

const CATS = ["All", "Gainers", "Losers"] as const;
type Cat = typeof CATS[number];

function MiniChart({ up }: { up: boolean }) {
  const pts = up
    ? "0,18 8,14 16,16 24,10 32,12 40,6 48,8 56,2"
    : "0,4 8,8 16,6 24,12 32,10 40,14 48,12 56,18";
  return (
    <Svg width={56} height={20} viewBox="0 0 56 20">
      <Polyline points={pts} fill="none" stroke={up ? "#30D158" : "#FF3B30"} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

export default function MarketsScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Cat>("All");

  const filtered = ASSETS.filter((a) => {
    const q = query.toLowerCase();
    const matchQ = !q || a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q);
    if (!matchQ) return false;
    if (cat === "Gainers") return a.change > 0;
    if (cat === "Losers")  return a.change < 0;
    return true;
  });

  return (
    <View style={s.root}>
      <View style={[s.headerWrap, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Markets</Text>
          <View style={s.statsRow}>
            <Text style={s.stat}>Cap <Text style={s.statVal}>$2.47T</Text></Text>
            <View style={s.divider} />
            <Text style={s.stat}>Vol <Text style={s.statVal}>$94.2B</Text></Text>
          </View>
        </View>
      </View>

      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <TextInput
            style={s.searchInput}
            placeholder="Search assets…"
            placeholderTextColor="#8E8E93"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <View style={s.catRow}>
          {CATS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[s.chip, cat === c && s.chipActive]}
              onPress={() => { hapticLight(); setCat(c); }}
              activeOpacity={0.75}
            >
              <Text style={[s.chipLabel, cat === c && s.chipLabelActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={s.listCard}>
          {filtered.map((a, i) => (
            <View key={a.id} style={[s.row, i < filtered.length - 1 && s.rowBorder]}>
              <View style={[s.badge, { backgroundColor: a.color + "22" }]}>
                <Text style={[s.badgeText, { color: a.color }]}>{a.symbol[0]}</Text>
              </View>
              <View style={s.nameCol}>
                <Text style={s.name}>{a.name}</Text>
                <Text style={s.symbol}>{a.symbol}</Text>
              </View>
              <MiniChart up={a.change >= 0} />
              <View style={s.priceCol}>
                <Text style={s.price}>
                  ${a.price < 1 ? a.price.toFixed(4) : a.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={[s.change, { color: a.change >= 0 ? "#30D158" : "#FF3B30" }]}>
                  {a.change >= 0 ? "+" : ""}{a.change.toFixed(2)}%
                </Text>
              </View>
            </View>
          ))}
          {filtered.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No results</Text>
              <Text style={s.emptySub}>Try a different search or filter</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  headerWrap: { backgroundColor: "#F2F2F7", zIndex: 10 },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginBottom: 4 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  stat: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular" },
  statVal: { color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  divider: { width: 1, height: 10, backgroundColor: "#C7C7CC" },

  searchWrap: { paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#1C1C1E", fontFamily: "Inter_400Regular" },
  catRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  chipActive: { backgroundColor: "#1A5AFF" },
  chipLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  chipLabelActive: { color: "#FFFFFF" },

  listCard: {
    marginHorizontal: 16, backgroundColor: "#FFFFFF", borderRadius: 20,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
    overflow: "hidden",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 16, fontWeight: "800", fontFamily: "Inter_700Bold" },
  nameCol: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  symbol: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular", marginTop: 1 },
  priceCol: { alignItems: "flex-end" },
  price: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  change: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 1 },
  empty: { padding: 32, alignItems: "center" },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  emptySub: { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_400Regular" },
});
