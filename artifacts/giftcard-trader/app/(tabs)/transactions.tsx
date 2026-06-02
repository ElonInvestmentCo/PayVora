import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useWallet } from "@/contexts/WalletContext";
import { hapticLight } from "@/utils/haptics";

const FILTERS = ["All", "Crypto", "Cards", "Bills", "Wallet"] as const;
type Filter = typeof FILTERS[number];

const TYPE_COLORS: Record<string, string> = {
  crypto: "#9945FF", gift: "#F7931A", bills: "#30D158", wallet: "#1A5AFF",
};

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions } = useWallet();
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery]   = useState("");

  const filtered = (transactions || []).filter((tx) => {
    const q = query.toLowerCase();
    const matchQ = !q || tx.title.toLowerCase().includes(q);
    if (!matchQ) return false;
    if (filter === "Crypto") return tx.type === "crypto";
    if (filter === "Cards")  return tx.type === "gift";
    if (filter === "Bills")  return tx.type === "bills";
    if (filter === "Wallet") return tx.type === "wallet";
    return true;
  });

  const totalIn  = filtered.filter((t) => t.direction === "in").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.direction === "out").reduce((s, t) => s + t.amount, 0);

  return (
    <View style={s.root}>
      <View style={[s.headerWrap, { paddingTop: insets.top }]}>
        <Text style={s.headerTitle}>Transactions</Text>
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>Total In</Text>
            <Text style={[s.summaryVal, { color: "#30D158" }]}>+${totalIn.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>Total Out</Text>
            <Text style={[s.summaryVal, { color: "#FF3B30" }]}>-${totalOut.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </View>
        </View>
      </View>

      <View style={s.controls}>
        <View style={s.searchBar}>
          <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
            <Path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <TextInput
            style={s.searchInput}
            placeholder="Search transactions…"
            placeholderTextColor="#8E8E93"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.chip, filter === f && s.chipActive]}
              onPress={() => { hapticLight(); setFilter(f); }}
              activeOpacity={0.75}
            >
              <Text style={[s.chipLabel, filter === f && s.chipLabelActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>No transactions</Text>
            <Text style={s.emptySub}>{query ? "Try a different search" : "Your transactions will appear here"}</Text>
          </View>
        ) : (
          <View style={s.listCard}>
            {filtered.map((tx, i) => (
              <View key={tx.id} style={[s.row, i < filtered.length - 1 && s.rowBorder]}>
                <View style={[s.txIcon, { backgroundColor: tx.direction === "in" ? "rgba(48,209,88,0.12)" : "rgba(255,59,48,0.08)" }]}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d={tx.direction === "in" ? "M12 19V5M5 12l7-7 7 7" : "M12 5v14M5 12l7 7 7-7"} stroke={tx.direction === "in" ? "#30D158" : "#FF3B30"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.txTitle}>{tx.title}</Text>
                  <View style={s.txMeta}>
                    <Text style={s.txDate}>{tx.date}</Text>
                    {tx.type && (
                      <View style={[s.typeBadge, { backgroundColor: (TYPE_COLORS[tx.type] || "#8E8E93") + "18" }]}>
                        <Text style={[s.typeLabel, { color: TYPE_COLORS[tx.type] || "#8E8E93" }]}>{tx.type}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={[s.txAmount, { color: tx.direction === "in" ? "#30D158" : "#1C1C1E" }]}>
                  {tx.direction === "in" ? "+" : "-"}{tx.currency === "NGN" ? "₦" : "$"}{tx.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  headerWrap: { backgroundColor: "#F2F2F7", paddingHorizontal: 16, paddingTop: 0 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", letterSpacing: -0.5, paddingHorizontal: 4, paddingVertical: 12 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  summaryLabel: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular", marginBottom: 4 },
  summaryVal: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },

  controls: { paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#1C1C1E", fontFamily: "Inter_400Regular" },
  filterRow: { gap: 8, paddingBottom: 2 },
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  chipActive: { backgroundColor: "#1A5AFF" },
  chipLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  chipLabelActive: { color: "#FFFFFF" },

  scroll: { paddingHorizontal: 16, paddingBottom: 120 },
  listCard: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  txTitle: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  txMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  txDate: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular" },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typeLabel: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
  txAmount: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },

  empty: { paddingTop: 60, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  emptySub: { fontSize: 14, color: "#8E8E93", fontFamily: "Inter_400Regular" },
});
