import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

type TabId = "all" | "crypto" | "giftcard" | "bills" | "card" | "wallet";
type StatusFilter = "all" | "success" | "pending" | "error";

interface Transaction {
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

const TRANSACTIONS: Transaction[] = [
  { id: "1",  txId: "TXN-8F4A21", title: "BTC Sell",             category: "crypto",   amount: "-0.015 BTC",    fiatValue: "$675.00",    fee: "$0.68",  rate: "$45,000/BTC",  date: "Today, 3:45 PM",       status: "success", icon: "trending-down", iconColor: "#F7931A" },
  { id: "2",  txId: "TXN-3B7C90", title: "Amazon Gift Card",     category: "giftcard", amount: "$100.00",       fiatValue: "₦75,000",    fee: "Free",   rate: "₦750/$1",      date: "Today, 1:20 PM",       status: "success", icon: "shopping-bag",  iconColor: "#FF9900" },
  { id: "3",  txId: "TXN-5D2E18", title: "ETH Buy",              category: "crypto",   amount: "+0.5 ETH",      fiatValue: "$1,425.00",  fee: "$1.43",  rate: "$2,850/ETH",   date: "Yesterday, 11:10 AM",  status: "pending", icon: "trending-up",   iconColor: "#627EEA" },
  { id: "4",  txId: "TXN-9A1F67", title: "MTN Airtime",          category: "bills",    amount: "$10.00",        fiatValue: "₦7,500",     fee: "$0.00",  rate: "₦750/$1",      date: "Yesterday, 9:05 AM",   status: "success", icon: "phone",         iconColor: "#F59E0B" },
  { id: "5",  txId: "TXN-2C8D45", title: "Netflix Subscription",  category: "card",     amount: "-$15.99",       fiatValue: "$15.99",     fee: "$0.00",  rate: "-",            date: "Apr 1, 4:12 PM",       status: "success", icon: "tv",            iconColor: "#EF4444" },
  { id: "6",  txId: "TXN-7E3B92", title: "SOL Buy",              category: "crypto",   amount: "+18.5 SOL",     fiatValue: "$2,627.00",  fee: "$2.63",  rate: "$142/SOL",     date: "Apr 1, 2:30 PM",       status: "success", icon: "trending-up",   iconColor: "#9945FF" },
  { id: "7",  txId: "TXN-4F6A13", title: "Wallet Deposit",       category: "wallet",   amount: "+₦150,000",     fiatValue: "$200.00",    fee: "Free",   rate: "₦750/$1",      date: "Mar 31, 10:00 AM",     status: "success", icon: "download",      iconColor: "#00FF88" },
  { id: "8",  txId: "TXN-1D9C78", title: "iTunes Gift Card",     category: "giftcard", amount: "$50.00",        fiatValue: "₦36,000",    fee: "Free",   rate: "₦720/$1",      date: "Mar 31, 8:45 AM",      status: "pending", icon: "music",         iconColor: "#A3AAAE" },
  { id: "9",  txId: "TXN-6B2E34", title: "DSTV Premium",         category: "bills",    amount: "$35.00",        fiatValue: "₦26,250",    fee: "$0.00",  rate: "₦750/$1",      date: "Mar 30, 4:20 PM",      status: "error",   icon: "tv",            iconColor: "#8B5CF6" },
  { id: "10", txId: "TXN-8C5F21", title: "BTC Buy",              category: "crypto",   amount: "+0.02 BTC",     fiatValue: "$900.00",    fee: "$0.90",  rate: "$45,000/BTC",  date: "Mar 30, 2:15 PM",      status: "error",   icon: "trending-up",   iconColor: "#F7931A" },
  { id: "11", txId: "TXN-3A7D56", title: "Wallet Withdrawal",    category: "wallet",   amount: "-₦75,000",      fiatValue: "$100.00",    fee: "₦100",   rate: "₦750/$1",      date: "Mar 29, 1:00 PM",      status: "success", icon: "upload",        iconColor: "#14B8A6" },
  { id: "12", txId: "TXN-9F1B88", title: "eSIM — Europe",        category: "bills",    amount: "$15.99",        fiatValue: "$15.99",     fee: "$0.00",  rate: "-",            date: "Mar 29, 11:30 AM",     status: "success", icon: "globe",         iconColor: "#00E5FF" },
  { id: "13", txId: "TXN-5E4C72", title: "Adobe Creative",       category: "card",     amount: "-$54.99",       fiatValue: "$54.99",     fee: "$0.00",  rate: "-",            date: "Mar 28, 3:00 PM",      status: "success", icon: "pen-tool",      iconColor: "#FF4444" },
  { id: "14", txId: "TXN-2D8A19", title: "Card Funding",         category: "card",     amount: "+$500.00",      fiatValue: "$500.00",    fee: "$2.50",  rate: "-",            date: "Mar 28, 9:00 AM",      status: "success", icon: "plus",          iconColor: "#00E5FF" },
];

const STATUS_CFG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  success: { bg: "rgba(0,255,136,0.12)", border: "#00FF8830", text: "#00FF88", label: "Completed" },
  pending: { bg: "rgba(245,158,11,0.12)", border: "#F59E0B30", text: "#F59E0B", label: "Pending" },
  error:   { bg: "rgba(239,68,68,0.12)", border: "#EF444430", text: "#EF4444", label: "Failed" },
};

const VOLUME_BARS = [30, 45, 38, 55, 48, 62, 52, 70, 58, 75, 65, 82, 72, 88, 78, 92];

function VolumeChart() {
  const max = Math.max(...VOLUME_BARS);
  const min = Math.min(...VOLUME_BARS);
  const range = max - min || 1;
  return (
    <View style={vStyles.wrap}>
      {VOLUME_BARS.map((v, i) => {
        const pct = (v - min) / range;
        const isLast = i === VOLUME_BARS.length - 1;
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

  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const filtered = useMemo(() => {
    let list = TRANSACTIONS;
    if (activeTab !== "all") list = list.filter((t) => t.category === activeTab);
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.txId.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, statusFilter, search]);

  const totalVolume = TRANSACTIONS.reduce((s, t) => {
    const num = parseFloat(t.fiatValue.replace(/[^0-9.]/g, "")) || 0;
    return s + num;
  }, 0);

  const completedCount = TRANSACTIONS.filter((t) => t.status === "success").length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
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

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Transactions</Text>
            <View style={styles.statValRow}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{TRANSACTIONS.length}</Text>
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

        {/* Volume chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>Transaction Volume</Text>
            <Text style={[styles.chartSub, { color: colors.primary }]}>{completedCount} completed</Text>
          </View>
          <VolumeChart />
        </View>

        {/* Search */}
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

        {/* Tabs */}
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

        {/* Status filter pills */}
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

        {/* Result count */}
        <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
        </Text>

        {/* Transaction list */}
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
                <Text style={[styles.txAmount, { color: tx.amount.startsWith("+") || tx.amount.startsWith("$") ? "#00FF88" : colors.foreground }]}>
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

      {/* Transaction Detail Modal */}
      <Modal transparent visible={!!selectedTx} animationType="fade" onRequestClose={() => setSelectedTx(null)}>
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
      </Modal>
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
