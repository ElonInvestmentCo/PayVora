import React, { useState, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hapticLight } from "@/utils/haptics";

type TimeTab = "daily" | "weekly" | "monthly" | "alltime";
type AssetFilter = "all" | "crypto" | "giftcards" | "bills";

interface Trader {
  id: string;
  username: string;
  initials: string;
  avatarColor: string;
  profit: number;
  pctChange: number;
  totalVolume: string;
  badge?: string;
  badgeColor?: string;
  isCurrentUser?: boolean;
}

const TIME_TABS: { id: TimeTab; label: string }[] = [
  { id: "daily",   label: "Daily" },
  { id: "weekly",  label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "alltime", label: "All-Time" },
];

const ASSET_FILTERS: { id: AssetFilter; label: string }[] = [
  { id: "all",       label: "All" },
  { id: "crypto",    label: "Crypto" },
  { id: "giftcards", label: "Gift Cards" },
  { id: "bills",     label: "Bills" },
];

const TRADERS: Trader[] = [
  { id: "1",  username: "CryptoKing_",   initials: "CK", avatarColor: "#F7931A", profit: 24850, pctChange: 142.5, totalVolume: "$1.2M",  badge: "Top Trader",  badgeColor: "#1072EA" },
  { id: "2",  username: "TradeQueen",    initials: "TQ", avatarColor: "#8B5CF6", profit: 18320, pctChange: 98.3,  totalVolume: "$890K",  badge: "Rising Star", badgeColor: "#FF9F0A" },
  { id: "3",  username: "BlockMaster",   initials: "BM", avatarColor: "#118D45", profit: 15680, pctChange: 87.1,  totalVolume: "$720K" },
  { id: "4",  username: "SatoshiFan",    initials: "SF", avatarColor: "#14B8A6", profit: 12450, pctChange: 72.8,  totalVolume: "$580K" },
  { id: "5",  username: "DiamondHands",  initials: "DH", avatarColor: "#627EEA", profit: 9820,  pctChange: 58.4,  totalVolume: "$445K" },
  { id: "6",  username: "You",           initials: "ME", avatarColor: "#1072EA", profit: 7340,  pctChange: 43.2,  totalVolume: "$330K",  isCurrentUser: true },
  { id: "7",  username: "MoonShot99",    initials: "MS", avatarColor: "#E02E5B", profit: 6120,  pctChange: 35.7,  totalVolume: "$278K" },
  { id: "8",  username: "AltcoinPro",    initials: "AP", avatarColor: "#FF9F0A", profit: 5290,  pctChange: 29.1,  totalVolume: "$241K" },
  { id: "9",  username: "HodlMaster",    initials: "HM", avatarColor: "#34C759", profit: 4430,  pctChange: 24.6,  totalVolume: "$201K" },
  { id: "10", username: "StealthMode",   initials: "SM", avatarColor: "#5AC8FA", profit: 3780,  pctChange: 18.9,  totalVolume: "$172K" },
  { id: "11", username: "GainStation",   initials: "GS", avatarColor: "#BF5AF2", profit: 3120,  pctChange: 15.2,  totalVolume: "$142K" },
  { id: "12", username: "WhaleAlert",    initials: "WA", avatarColor: "#FF6B6B", profit: 2560,  pctChange: 12.4,  totalVolume: "$116K" },
  { id: "13", username: "TokenHero",     initials: "TH", avatarColor: "#4ECDC4", profit: 1890,  pctChange: 9.1,   totalVolume: "$86K"  },
  { id: "14", username: "GridTrader",    initials: "GT", avatarColor: "#45B7D1", profit: 1230,  pctChange: 5.8,   totalVolume: "$56K"  },
];

const PERF_BARS = [0.3, 0.5, 0.4, 0.7, 0.55, 0.9, 0.65, 0.8, 0.7, 0.95, 0.75, 1.0];

const PODIUM_ORDER = [
  { rank: 2, height: 80,  gradient: ["#C0C0C0", "#A8A8A8"] as const },
  { rank: 1, height: 110, gradient: ["#FFD700", "#F5A623"] as const },
  { rank: 3, height: 60,  gradient: ["#CD7F32", "#B8692A"] as const },
];

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [timeTab, setTimeTab] = useState<TimeTab>("weekly");
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => TRADERS.filter((t) =>
    t.username.toLowerCase().includes(search.toLowerCase())
  ), [search]);

  return (
    <View style={[s.root, { paddingTop: topPad }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Leaderboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: botPad + 60 }]}>

        {/* Time Tabs */}
        <View style={s.tabSection}>
          {TIME_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => { hapticLight(); setTimeTab(tab.id); }}
              activeOpacity={0.8}
              style={[s.tab, timeTab === tab.id && s.tabActive]}
            >
              <Text style={[s.tabTxt, timeTab === tab.id && s.tabTxtActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Performance Chart Card */}
        <View style={s.section}>
          <View style={s.card}>
            <View style={s.chartHeader}>
              <View>
                <Text style={s.chartTitle}>Top Performance</Text>
                <Text style={s.chartSub}>Portfolio gains this period</Text>
              </View>
              <View style={s.gainBadge}>
                <Text style={s.gainBadgeTxt}>↑ +18.2%</Text>
              </View>
            </View>
            <View style={s.chartArea}>
              {PERF_BARS.map((h, i) => {
                const isLast = i === PERF_BARS.length - 1;
                return (
                  <View key={i} style={{ flex: 1, justifyContent: "flex-end" }}>
                    <View style={{ height: h * 52, backgroundColor: isLast ? "#1072EA" : `rgba(16,114,234,${0.2 + h * 0.6})`, borderRadius: 3 }} />
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Asset Filters */}
        <View style={s.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
            {ASSET_FILTERS.map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => { hapticLight(); setAssetFilter(f.id); }}
                activeOpacity={0.8}
                style={[s.filterBtn, assetFilter === f.id && s.filterBtnActive]}
              >
                <Text style={[s.filterTxt, assetFilter === f.id && s.filterTxtActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search */}
        <View style={s.section}>
          <View style={s.searchRow}>
            <Text style={s.searchEmoji}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search traders…"
              placeholderTextColor="#8E8E93"
              style={s.searchInput}
            />
          </View>
        </View>

        {/* Podium */}
        {!search && (
          <View style={s.section}>
            <View style={s.podiumWrap}>
              {PODIUM_ORDER.map((p) => {
                const trader = TRADERS[p.rank - 1];
                return (
                  <View key={p.rank} style={s.podiumSlot}>
                    <View style={[s.podiumAvatar, { backgroundColor: trader.avatarColor + "22" }]}>
                      <Text style={[s.podiumInitials, { color: trader.avatarColor }]}>{trader.initials}</Text>
                      <Text style={s.podiumMedal}>{p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : "🥉"}</Text>
                    </View>
                    <Text style={s.podiumName} numberOfLines={1}>{trader.username}</Text>
                    <Text style={s.podiumProfit}>${trader.profit.toLocaleString()}</Text>
                    <LinearGradient colors={p.gradient} style={[s.podiumPillar, { height: p.height }]}>
                      <Text style={s.podiumRankTxt}>#{p.rank}</Text>
                    </LinearGradient>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Trader List */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Rankings</Text>
          <View style={s.card}>
            {filtered.map((trader, i) => (
              <View
                key={trader.id}
                style={[s.traderRow, trader.isCurrentUser && s.traderRowMe, i < filtered.length - 1 && s.traderRowBorder]}
              >
                {/* Rank */}
                <View style={[s.rankBadge, i === 0 && { backgroundColor: "#FFD70018" }, i === 1 && { backgroundColor: "#C0C0C018" }, i === 2 && { backgroundColor: "#CD7F3218" }]}>
                  <Text style={[s.rankTxt, i < 3 && { color: ["#F5A623", "#A8A8A8", "#B8692A"][i] }]}>
                    {i + 1}
                  </Text>
                </View>

                {/* Avatar */}
                <View style={[s.avatar, { backgroundColor: trader.avatarColor + "20" }]}>
                  <Text style={[s.avatarTxt, { color: trader.avatarColor }]}>{trader.initials}</Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={s.nameRow}>
                    <Text style={[s.traderName, trader.isCurrentUser && { color: "#1072EA" }]}>{trader.username}</Text>
                    {trader.badge && (
                      <View style={[s.badgePill, { backgroundColor: (trader.badgeColor ?? "#8E8E93") + "18" }]}>
                        <Text style={[s.badgeTxt, { color: trader.badgeColor ?? "#8E8E93" }]}>{trader.badge}</Text>
                      </View>
                    )}
                    {trader.isCurrentUser && (
                      <View style={s.youPill}><Text style={s.youTxt}>YOU</Text></View>
                    )}
                  </View>
                  <Text style={s.traderVol}>{trader.totalVolume} volume</Text>
                </View>

                {/* Stats */}
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.profit}>${trader.profit.toLocaleString()}</Text>
                  <Text style={s.change}>↑ +{trader.pctChange}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F9FC" },
  scroll: {},
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1C1C1E", letterSpacing: -0.3 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  backArrow: { fontSize: 20, color: "#1C1C1E" },
  section: { paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  tabSection: { flexDirection: "row", paddingHorizontal: 16, gap: 6, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  tabActive: { backgroundColor: "#1072EA" },
  tabTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  tabTxtActive: { color: "#FFFFFF" },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 16, paddingBottom: 10 },
  chartTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1C1C1E", marginBottom: 2 },
  chartSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  gainBadge: { backgroundColor: "#E8F7EE", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  gainBadgeTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#118D45" },
  chartArea: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 60, paddingHorizontal: 16, paddingBottom: 16 },
  filterSection: { marginBottom: 14 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  filterBtnActive: { backgroundColor: "#1072EA" },
  filterTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  filterTxtActive: { color: "#FFFFFF" },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  searchEmoji: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#1C1C1E", paddingVertical: 13 },
  podiumWrap: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 16, paddingBottom: 8 },
  podiumSlot: { alignItems: "center", flex: 1 },
  podiumAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 6, position: "relative" },
  podiumInitials: { fontSize: 14, fontFamily: "Inter_700Bold" },
  podiumMedal: { position: "absolute", top: -8, right: -8, fontSize: 18 },
  podiumName: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 3, textAlign: "center" },
  podiumProfit: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#118D45", marginBottom: 5, textAlign: "center" },
  podiumPillar: { width: "100%", borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: "center", justifyContent: "flex-end", paddingBottom: 8 },
  podiumRankTxt: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  traderRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 13 },
  traderRowMe: { backgroundColor: "#F5F8FF" },
  traderRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F7F9FC", alignItems: "center", justifyContent: "center" },
  rankTxt: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#8E8E93" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontSize: 13, fontFamily: "Inter_700Bold" },
  nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 5, marginBottom: 2 },
  traderName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  badgePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  badgeTxt: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  youPill: { backgroundColor: "#E8F1FD", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  youTxt: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#1072EA" },
  traderVol: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  profit: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#1C1C1E", marginBottom: 2 },
  change: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#118D45" },
});
