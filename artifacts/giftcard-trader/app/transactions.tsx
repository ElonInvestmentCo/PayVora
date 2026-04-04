import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Pressable,
} from "react-native";
import { FocusedModal } from "@/components/FocusedModal";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useWallet, type WalletTransaction } from "@/contexts/WalletContext";

type TabId = "all" | "crypto" | "giftcard" | "bills" | "card" | "wallet";
type StatusFilter = "all" | "success" | "pending" | "error";

interface DisplayTransaction {
  id: string;
  txId: string;
  title: string;
  category: Exclude<TabId, "all">;
  amount: string;
  fiatValue: string;
  fee: string;
  rate: string;
  date: string;
  status: "success" | "pending" | "error";
  icon: string;
  iconColor: string;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "all",      label: "All" },
  { id: "crypto",   label: "Crypto" },
  { id: "giftcard", label: "Gift Cards" },
  { id: "bills",    label: "Bills" },
  { id: "card",     label: "Card" },
  { id: "wallet",   label: "Wallet" },
];

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all",     label: "All" },
  { id: "success", label: "Completed" },
  { id: "pending", label: "Pending" },
  { id: "error",   label: "Failed" },
];

const ICON_MAP: Record<string, { icon: string; color: string }> = {
  gift_card: { icon: "shopping-bag", color: "#FF9900" },
  crypto:    { icon: "trending-up",  color: "#F7931A" },
  bills:     { icon: "zap",          color: "#F59E0B" },
  card:      { icon: "credit-card",  color: "#8B5CF6" },
  wallet:    { icon: "download",     color: "#00FF88" },
  transfer:  { icon: "repeat",       color: "#14B8A6" },
};

function mapWalletTx(tx: WalletTransaction): DisplayTransaction {
  const mapping = ICON_MAP[tx.type] || { icon: "activity", color: "#94A3B8" };
  const prefix = tx.direction === "in" ? "+" : "-";
  const currencySymbol = tx.currency === "NGN" ? "₦" : "$";
  const amountStr = `${prefix}${currencySymbol}${tx.amount.toLocaleString()}`;

  let catTab: Exclude<TabId, "all"> = "wallet";
  if (tx.type === "gift_card") catTab = "giftcard";
  else if (tx.type === "crypto") catTab = "crypto";
  else if (tx.type === "bills") catTab = "bills";
  else if (tx.type === "card") catTab = "card";
  else catTab = "wallet";

  const icon = tx.direction === "out" && tx.type === "crypto" ? "trending-down" : mapping.icon;

  return {
    id: tx.id,
    txId: `TXN-${tx.id.replace("t", "").padStart(4, "0")}`,
    title: tx.title,
    category: catTab,
    amount: amountStr,
    fiatValue: `${currencySymbol}${tx.amount.toLocaleString()}`,
    fee: tx.amount > 10000 ? `${currencySymbol}${(tx.amount * 0.001).toFixed(2)}` : "Free",
    rate: tx.currency === "NGN" ? "₦750/$1" : "-",
    date: tx.date,
    status: tx.status,
    icon,
    iconColor: mapping.color,
  };
}

const STATUS_CFG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  success: { bg: "rgba(0,255,136,0.12)", border: "#00FF8830", text: "#00FF88", label: "Completed" },
  pending: { bg: "rgba(245,158,11,0.12)", border: "#F59E0B30", text: "#F59E0B", label: "Pending" },
  error:   { bg: "rgba(239,68,68,0.12)", border: "#EF444430", text: "#EF4444", label: "Failed" },
};

function VolumeChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  return (
    <View style={vStyles.wrap}>
      {data.map((v, i) => {
        const pct = (v - min) / range;
        const isLast = i === data.length - 1;
        return (
          <View key={i} style={vStyles.col}>
            <View style={{ height: 4 + pct * 36, borderRadius: 2, backgroundColor: isLast ? "#8B5CF6" : `rgba(0,229,255,${0.2 + pct * 0.6})` }} />
          </View>
        );
      })}
    </View>
  );
}

const vStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 44 },
  col: { flex: 1, justifyContent: "flex-end" },
});

export default function TransactionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;
  const { transactions: walletTxs } = useWallet();

  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState<DisplayTransaction | null>(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const allDisplayTxs = useMemo(() => walletTxs.map(mapWalletTx), [walletTxs]);

  const filtered = useMemo(() => {
    let list = allDisplayTxs;
    if (activeTab !== "all") list = list.filter((t) => t.category === activeTab);
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.txId.toLowerCase().includes(q));
    }
    return list;
  }, [allDisplayTxs, activeTab, statusFilter, search]);

  const totalVolume = useMemo(() =>
    allDisplayTxs.reduce((s, t) => {
      const num = parseFloat(t.fiatValue.replace(/[^0-9.]/g, "")) || 0;
      return s + num;
    }, 0),
  [allDisplayTxs]);

  const completedCount = allDisplayTxs.filter((t) => t.status === "success").length;

  const volumeBars = useMemo(() => {
    const bars: number[] = [];
    const step = Math.max(1, Math.floor(allDisplayTxs.length / 16));
    for (let i = 0; i < 16; i++) {
      const idx = Math.min(i * step, allDisplayTxs.length - 1);
      if (idx >= 0 && allDisplayTxs[idx]) {
        bars.push(parseFloat(allDisplayTxs[idx].fiatValue.replace(/[^0-9.]/g, "")) || 30);
      } else {
        bars.push(30 + Math.random() * 60);
      }
    }
    return bars;
  }, [allDisplayTxs]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8} testID="back-button">
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Transactions</Text>
        <TouchableOpacity onPress={() => setShowStatusFilter(!showStatusFilter)} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="filter" size={18} color={statusFilter !== "all" ? colors.primary : colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Transactions</Text>
            <View style={styles.statValRow}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{allDisplayTxs.length}</Text>
              <View style={[styles.trendPill, { backgroundColor: "rgba(0,255,136,0.12)" }]}>
                <Feather name="trending-up" size={10} color="#00FF88" />
                <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#00FF88" }}>+12%</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Volume</Text>
            <View style={styles.statValRow}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>${(totalVolume / 1000).toFixed(1)}k</Text>
              <View style={[styles.trendPill, { backgroundColor: "rgba(0,255,136,0.12)" }]}>
                <Feather name="trending-up" size={10} color="#00FF88" />
                <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#00FF88" }}>+8%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>Transaction Volume</Text>
            <Text style={[styles.chartSub, { color: colors.primary }]}>{completedCount} completed</Text>
          </View>
          <VolumeChart data={volumeBars} />
        </View>

        <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            testID="search-input"
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or ID..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.id}
              testID={`tab-${t.id}`}
              onPress={() => setActiveTab(t.id)}
              activeOpacity={0.8}
              style={[styles.tabChip, { backgroundColor: activeTab === t.id ? "rgba(0,229,255,0.15)" : colors.card, borderColor: activeTab === t.id ? colors.primary : colors.border }]}
            >
              <Text style={[styles.tabText, { color: activeTab === t.id ? colors.primary : colors.mutedForeground }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {showStatusFilter && (
          <View style={styles.statusFilters}>
            {STATUS_FILTERS.map((sf) => {
              const active = statusFilter === sf.id;
              const cfg = sf.id !== "all" ? STATUS_CFG[sf.id] : null;
              return (
                <TouchableOpacity
                  key={sf.id}
                  testID={`status-${sf.id}`}
                  onPress={() => setStatusFilter(sf.id)}
                  activeOpacity={0.8}
                  style={[styles.statusChip, { backgroundColor: active ? (cfg?.bg || "rgba(0,229,255,0.12)") : colors.card, borderColor: active ? (cfg?.border || colors.primary + "30") : colors.border }]}
                >
                  {cfg && active && <View style={[styles.statusDotSm, { backgroundColor: cfg.text }]} />}
                  <Text style={[styles.statusChipText, { color: active ? (cfg?.text || colors.primary) : colors.mutedForeground }]}>{sf.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
        </Text>

        {filtered.map((tx) => {
          const st = STATUS_CFG[tx.status];
          return (
            <TouchableOpacity
              key={tx.id}
              testID={`tx-${tx.id}`}
              onPress={() => setSelectedTx(tx)}
              activeOpacity={0.8}
              style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.txIcon, { backgroundColor: `${tx.iconColor}18` }]}>
                <Feather name={tx.icon as any} size={16} color={tx.iconColor} />
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txTitle, { color: colors.foreground }]}>{tx.title}</Text>
                <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{tx.date}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={[styles.txAmount, { color: tx.amount.startsWith("+") ? "#00FF88" : colors.foreground }]}>
                  {tx.amount}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                  <View style={[styles.statusDot, { backgroundColor: st.text }]} />
                  <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Transactions Found</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Try changing your filters or search query
            </Text>
          </View>
        )}
      </ScrollView>

      <FocusedModal transparent visible={!!selectedTx} animationType="fade" onRequestClose={() => setSelectedTx(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelectedTx(null)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => {}}>
            {selectedTx && (() => {
              const st = STATUS_CFG[selectedTx.status];
              return (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.foreground }]}>Transaction Details</Text>
                    <TouchableOpacity onPress={() => setSelectedTx(null)} activeOpacity={0.8}>
                      <Feather name="x" size={22} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.modalTop, { backgroundColor: `${selectedTx.iconColor}10`, borderColor: `${selectedTx.iconColor}30` }]}>
                    <View style={[styles.modalIconLg, { backgroundColor: `${selectedTx.iconColor}20` }]}>
                      <Feather name={selectedTx.icon as any} size={22} color={selectedTx.iconColor} />
                    </View>
                    <View>
                      <Text style={[styles.modalTxTitle, { color: colors.foreground }]}>{selectedTx.title}</Text>
                      <Text style={[styles.modalTxId, { color: colors.mutedForeground }]}>{selectedTx.txId}</Text>
                    </View>
                    <View style={[styles.statusBadgeLg, { backgroundColor: st.bg, borderColor: st.border }]}>
                      <View style={[styles.statusDot, { backgroundColor: st.text }]} />
                      <Text style={[styles.statusTextLg, { color: st.text }]}>{st.label}</Text>
                    </View>
                  </View>

                  {[
                    { label: "Transaction ID", value: selectedTx.txId },
                    { label: "Amount",          value: selectedTx.amount },
                    { label: "Fiat Value",      value: selectedTx.fiatValue, highlight: true },
                    { label: "Fee",             value: selectedTx.fee, warn: selectedTx.fee !== "Free" && selectedTx.fee !== "$0.00" },
                    { label: "Rate",            value: selectedTx.rate },
                    { label: "Date",            value: selectedTx.date },
                    { label: "Status",          value: st.label, statusColor: st.text },
                  ].map((row) => (
                    <View key={row.label} style={[styles.modalRow, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.modalLbl, { color: colors.mutedForeground }]}>{row.label}</Text>
                      <Text style={[styles.modalVal, { color: row.statusColor || (row.highlight ? "#00FF88" : row.warn ? "#F59E0B" : colors.foreground) }]}>{row.value}</Text>
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={() => setSelectedTx(null)}
                    activeOpacity={0.8}
                    style={[styles.modalClose, { backgroundColor: colors.border }]}
                  >
                    <Text style={[styles.modalCloseTxt, { color: colors.foreground }]}>Close</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </Pressable>
        </Pressable>
      </FocusedModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  content: { padding: 20, gap: 4 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, gap: 6 },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.6 },
  statValRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  trendPill: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 20, paddingHorizontal: 6, paddingVertical: 3 },

  chartCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 16, gap: 12 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chartTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  chartSub: { fontSize: 12, fontFamily: "Inter_500Medium" },

  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 46, marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },

  tabScroll: { gap: 8, paddingRight: 4, marginBottom: 12 },
  tabChip: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  statusFilters: { flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  statusChip: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  statusDotSm: { width: 6, height: 6, borderRadius: 3 },
  statusChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  resultCount: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 10 },

  txRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  txIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1, gap: 2 },
  txTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  txDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  txRight: { alignItems: "flex-end", gap: 4 },
  txAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },

  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  emptyState: { borderRadius: 14, borderWidth: 1, padding: 40, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end", padding: 16 },
  modal: { borderRadius: 20, padding: 20, borderWidth: 1, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalTop: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 16,
  },
  modalIconLg: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modalTxTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  modalTxId: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadgeLg: {
    flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto",
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5,
  },
  statusTextLg: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  modalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  modalLbl: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  modalClose: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 16 },
  modalCloseTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
