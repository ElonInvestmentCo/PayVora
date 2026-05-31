import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { FocusedModal } from "@/components/FocusedModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
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
  icon: "up" | "down" | "card" | "bag" | "zap" | "repeat";
  iconColor: string;
  isIn: boolean;
}

const ICON_MAP: Record<string, { iconType: DisplayTransaction["icon"]; color: string }> = {
  gift_card: { iconType: "bag",    color: "#FF9500" },
  crypto:    { iconType: "up",     color: "#1A5AFF" },
  bills:     { iconType: "zap",    color: "#FF9F0A" },
  card:      { iconType: "card",   color: "#AF52DE" },
  wallet:    { iconType: "down",   color: "#30D158" },
  transfer:  { iconType: "repeat", color: "#5AC8FA" },
};

const TABS: { id: TabId; label: string }[] = [
  { id: "all",      label: "All" },
  { id: "crypto",   label: "Crypto" },
  { id: "giftcard", label: "Gift Cards" },
  { id: "bills",    label: "Bills" },
  { id: "card",     label: "Card" },
  { id: "wallet",   label: "Wallet" },
];

const STATUS_CFG = {
  success: { bg: "#F0FDF4", dot: "#30D158", text: "#30D158",  label: "Completed" },
  pending: { bg: "#FFFBEB", dot: "#FF9F0A", text: "#FF9F0A",  label: "Pending" },
  error:   { bg: "#FFF2F2", dot: "#FF3B30", text: "#FF3B30",  label: "Failed" },
};

function mapWalletTx(tx: WalletTransaction): DisplayTransaction {
  const mapping = ICON_MAP[tx.type] || { iconType: "up" as const, color: "#8E8E93" };
  const prefix = tx.direction === "in" ? "+" : "-";
  const sym = tx.currency === "NGN" ? "₦" : "$";
  const amountStr = `${prefix}${sym}${tx.amount.toLocaleString()}`;

  let catTab: Exclude<TabId, "all"> = "wallet";
  if (tx.type === "gift_card") catTab = "giftcard";
  else if (tx.type === "crypto") catTab = "crypto";
  else if (tx.type === "bills") catTab = "bills";
  else if (tx.type === "card") catTab = "card";

  const iconType: DisplayTransaction["icon"] =
    tx.direction === "out" && tx.type === "crypto" ? "down" : mapping.iconType;

  return {
    id: tx.id,
    txId: `TXN-${tx.id.replace("t", "").padStart(4, "0")}`,
    title: tx.title,
    category: catTab,
    amount: amountStr,
    fiatValue: `${sym}${tx.amount.toLocaleString()}`,
    fee: tx.amount > 10000 ? `${sym}${(tx.amount * 0.001).toFixed(2)}` : "Free",
    rate: tx.currency === "NGN" ? "₦750/$1" : "—",
    date: tx.date,
    status: tx.status as "success" | "pending" | "error",
    icon: iconType,
    iconColor: mapping.color,
    isIn: tx.direction === "in",
  };
}

// ─── Icon Components ──────────────────────────────────────────────────────────
function TxIconShape({ type, color }: { type: DisplayTransaction["icon"]; color: string }) {
  const paths: Record<DisplayTransaction["icon"], string> = {
    up:     "M12 19V5M5 12l7-7 7 7",
    down:   "M12 5v14M5 12l7 7 7-7",
    card:   "M3 10h18M7 15h1m4 0h1M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z",
    bag:    "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
    zap:    "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    repeat: "M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3",
  };
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path d={paths[type]} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function FilterIcon({ active }: { active: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={active ? "#1A5AFF" : "#8E8E93"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function VolumeChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  return (
    <View style={chart.wrap}>
      {data.map((v, i) => {
        const pct = (v - min) / range;
        const isLast = i === data.length - 1;
        return (
          <View key={i} style={chart.col}>
            <View style={{ height: 4 + pct * 32, borderRadius: 2, backgroundColor: isLast ? "#1A5AFF" : `rgba(26,90,255,${0.15 + pct * 0.5})` }} />
          </View>
        );
      })}
    </View>
  );
}
const chart = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 40 },
  col: { flex: 1, justifyContent: "flex-end" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions: walletTxs } = useWallet();

  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState<DisplayTransaction | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const allTxs = useMemo(() => walletTxs.map(mapWalletTx), [walletTxs]);

  const filtered = useMemo(() => {
    let list = allTxs;
    if (activeTab !== "all") list = list.filter((t) => t.category === activeTab);
    if (statusFilter !== "all") list = list.filter((t) => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.txId.toLowerCase().includes(q));
    }
    return list;
  }, [allTxs, activeTab, statusFilter, search]);

  const totalVolume = useMemo(() =>
    allTxs.reduce((s, t) => s + (parseFloat(t.fiatValue.replace(/[^0-9.]/g, "")) || 0), 0),
  [allTxs]);

  const completedCount = allTxs.filter((t) => t.status === "success").length;

  const volumeBars = useMemo(() => {
    const step = Math.max(1, Math.floor(allTxs.length / 16));
    return Array.from({ length: 16 }, (_, i) => {
      const idx = Math.min(i * step, allTxs.length - 1);
      return idx >= 0 && allTxs[idx]
        ? parseFloat(allTxs[idx].fiatValue.replace(/[^0-9.]/g, "")) || 30
        : 30 + Math.random() * 60;
    });
  }, [allTxs]);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Transactions</Text>
          <TouchableOpacity
            onPress={() => setShowFilter(!showFilter)}
            activeOpacity={0.8}
            style={[s.filterBtn, showFilter && s.filterBtnActive]}
          >
            <FilterIcon active={showFilter || statusFilter !== "all"} />
          </TouchableOpacity>
        </View>

        {/* ── Stats Row ── */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Transactions</Text>
            <Text style={s.statValue}>{allTxs.length}</Text>
            <View style={s.trendPill}>
              <Text style={s.trendText}>+12%</Text>
            </View>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Total Volume</Text>
            <Text style={s.statValue}>${(totalVolume / 1000).toFixed(1)}k</Text>
            <View style={s.trendPill}>
              <Text style={s.trendText}>{completedCount} done</Text>
            </View>
          </View>
        </View>

        {/* ── Volume Chart ── */}
        <View style={[s.section, { marginBottom: 12 }]}>
          <View style={s.chartCard}>
            <View style={s.chartHeader}>
              <Text style={s.chartTitle}>Transaction Volume</Text>
              <Text style={s.chartSub}>{completedCount} completed</Text>
            </View>
            <VolumeChart data={volumeBars} />
          </View>
        </View>

        {/* ── Search ── */}
        <View style={s.section}>
          <View style={s.searchBar}>
            <SearchIcon />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name or ID…"
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabScroll} style={s.tabScrollWrapper}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              activeOpacity={0.8}
              style={[s.tabChip, activeTab === t.id && s.tabChipActive]}
            >
              <Text style={[s.tabChipText, activeTab === t.id && s.tabChipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Status Filter ── */}
        {showFilter && (
          <View style={s.statusRow}>
            {(["all", "success", "pending", "error"] as StatusFilter[]).map((sf) => {
              const active = statusFilter === sf;
              const cfg = sf !== "all" ? STATUS_CFG[sf] : null;
              return (
                <TouchableOpacity
                  key={sf}
                  onPress={() => setStatusFilter(sf)}
                  activeOpacity={0.8}
                  style={[s.statusChip, active && cfg && { backgroundColor: cfg.bg }]}
                >
                  {cfg && active && <View style={[s.statusDot, { backgroundColor: cfg.dot }]} />}
                  <Text style={[s.statusChipText, active && cfg && { color: cfg.text }]}>
                    {sf === "all" ? "All" : STATUS_CFG[sf].label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Result Count ── */}
        <View style={s.resultRow}>
          <Text style={s.resultCount}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</Text>
        </View>

        {/* ── Transaction List ── */}
        <View style={s.section}>
          {filtered.length === 0 ? (
            <View style={s.emptyCard}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="3" width="18" height="18" rx="3" stroke="#C7C7CC" strokeWidth={1.5} />
                <Path d="M8 8h8M8 12h5M8 16h6" stroke="#C7C7CC" strokeWidth={1.5} strokeLinecap="round" />
              </Svg>
              <Text style={s.emptyTitle}>No Transactions Found</Text>
              <Text style={s.emptySub}>Try changing your filters or search query</Text>
            </View>
          ) : (
            <View style={s.txList}>
              {filtered.map((tx, i) => {
                const st = STATUS_CFG[tx.status];
                return (
                  <TouchableOpacity
                    key={tx.id}
                    onPress={() => setSelectedTx(tx)}
                    activeOpacity={0.8}
                    style={[s.txRow, i < filtered.length - 1 && s.txRowBorder]}
                  >
                    <View style={[s.txIcon, { backgroundColor: tx.iconColor + "18" }]}>
                      <TxIconShape type={tx.icon} color={tx.iconColor} />
                    </View>
                    <View style={s.txInfo}>
                      <Text style={s.txTitle}>{tx.title}</Text>
                      <Text style={s.txDate}>{tx.date}</Text>
                    </View>
                    <View style={s.txRight}>
                      <Text style={[s.txAmount, { color: tx.isIn ? "#30D158" : "#1C1C1E" }]}>{tx.amount}</Text>
                      <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                        <View style={[s.statusDot, { backgroundColor: st.dot }]} />
                        <Text style={[s.statusText, { color: st.text }]}>{st.label}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>

      {/* ── Transaction Detail Modal ── */}
      <FocusedModal transparent visible={!!selectedTx} animationType="fade" onRequestClose={() => setSelectedTx(null)}>
        <Pressable style={s.overlay} onPress={() => setSelectedTx(null)}>
          <Pressable style={s.modal} onPress={() => {}}>
            {selectedTx && (() => {
              const st = STATUS_CFG[selectedTx.status];
              return (
                <>
                  <View style={s.modalHeaderRow}>
                    <Text style={s.modalTitle}>Transaction Details</Text>
                    <TouchableOpacity onPress={() => setSelectedTx(null)} activeOpacity={0.8}>
                      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                        <Path d="M18 6L6 18M6 6l12 12" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" />
                      </Svg>
                    </TouchableOpacity>
                  </View>

                  <View style={[s.modalTop, { backgroundColor: selectedTx.iconColor + "10" }]}>
                    <View style={[s.modalIconLg, { backgroundColor: selectedTx.iconColor + "20" }]}>
                      <TxIconShape type={selectedTx.icon} color={selectedTx.iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.modalTxTitle}>{selectedTx.title}</Text>
                      <Text style={s.modalTxId}>{selectedTx.txId}</Text>
                    </View>
                    <View style={[s.statusBadgeLg, { backgroundColor: st.bg }]}>
                      <View style={[s.statusDot, { backgroundColor: st.dot }]} />
                      <Text style={[s.statusText, { color: st.text }]}>{st.label}</Text>
                    </View>
                  </View>

                  {[
                    { label: "Amount",     value: selectedTx.amount,    color: selectedTx.isIn ? "#30D158" : "#1C1C1E" },
                    { label: "Fiat Value", value: selectedTx.fiatValue, color: "#1C1C1E" },
                    { label: "Fee",        value: selectedTx.fee,       color: selectedTx.fee !== "Free" ? "#FF9F0A" : "#30D158" },
                    { label: "Rate",       value: selectedTx.rate,      color: "#8E8E93" },
                    { label: "Date",       value: selectedTx.date,      color: "#8E8E93" },
                    { label: "Status",     value: st.label,             color: st.text },
                  ].map((row) => (
                    <View key={row.label} style={s.detailRow}>
                      <Text style={s.detailLabel}>{row.label}</Text>
                      <Text style={[s.detailValue, { color: row.color }]}>{row.value}</Text>
                    </View>
                  ))}

                  <TouchableOpacity onPress={() => setSelectedTx(null)} activeOpacity={0.8} style={s.modalCloseBtn}>
                    <Text style={s.modalCloseTxt}>Close</Text>
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

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: { paddingBottom: 32 },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  filterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  filterBtnActive: { backgroundColor: "#EEF3FF" },

  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 10 },
  statCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  statLabel: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular", marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", marginBottom: 4 },
  trendPill: { backgroundColor: "#EEF3FF", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  trendText: { fontSize: 11, color: "#1A5AFF", fontFamily: "Inter_600SemiBold" },

  section: { paddingHorizontal: 16 },
  chartCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  chartTitle: { fontSize: 15, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  chartSub: { fontSize: 12, color: "#1A5AFF", fontFamily: "Inter_500Medium" },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 14, height: 46,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1C1C1E", fontFamily: "Inter_400Regular" },

  tabScrollWrapper: { marginTop: 12 },
  tabScroll: { paddingHorizontal: 16, gap: 8, paddingRight: 20 },
  tabChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  tabChipActive: { backgroundColor: "#1A5AFF" },
  tabChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  tabChipTextActive: { color: "#FFFFFF" },

  statusRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginTop: 10, flexWrap: "wrap" },
  statusChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: "#FFFFFF" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },

  resultRow: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
  resultCount: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular" },

  txList: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  txRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  txIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1, gap: 2 },
  txTitle: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  txDate: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular" },
  txRight: { alignItems: "flex-end", gap: 4 },
  txAmount: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  emptyCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 48, alignItems: "center", gap: 10,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_400Regular", textAlign: "center" },

  // Modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end", padding: 16 },
  modal: { backgroundColor: "#FFFFFF", borderRadius: 28, padding: 24, maxHeight: "88%" },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  modalTop: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 14, marginBottom: 16 },
  modalIconLg: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  modalTxTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  modalTxId: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadgeLg: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  detailLabel: { fontSize: 14, color: "#8E8E93", fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  modalCloseBtn: { backgroundColor: "#F2F2F7", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 16 },
  modalCloseTxt: { fontSize: 15, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
});
