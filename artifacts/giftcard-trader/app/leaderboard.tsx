import React, { useState, useMemo } from "react";
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
  { id: "all",        label: "All" },
  { id: "crypto",     label: "Crypto" },
  { id: "giftcards",  label: "Gift Cards" },
  { id: "bills",      label: "Bills" },
];

const TRADERS: Trader[] = [
  { id: "1",  username: "CryptoKing_",    initials: "CK", avatarColor: "#F7931A", profit: 24850,  pctChange: 142.5, totalVolume: "$1.2M", badge: "Top Trader",  badgeColor: "#00E5FF" },
  { id: "2",  username: "TradeQueen",     initials: "TQ", avatarColor: "#8B5CF6", profit: 18320,  pctChange: 98.3,  totalVolume: "$890K", badge: "Rising Star", badgeColor: "#F59E0B" },
  { id: "3",  username: "BlockMaster",    initials: "BM", avatarColor: "#00FF88", profit: 15680,  pctChange: 87.1,  totalVolume: "$720K" },
  { id: "4",  username: "SatoshiFan",     initials: "SF", avatarColor: "#14B8A6", profit: 12450,  pctChange: 72.8,  totalVolume: "$580K" },
  { id: "5",  username: "Alex_Johnson",   initials: "AJ", avatarColor: "#00E5FF", profit: 9870,   pctChange: 56.4,  totalVolume: "$420K", isCurrentUser: true },
  { id: "6",  username: "DeFiWhale",      initials: "DW", avatarColor: "#627EEA", profit: 8920,   pctChange: 48.2,  totalVolume: "$380K" },
  { id: "7",  username: "CardFlip_Pro",   initials: "CF", avatarColor: "#FF9900", profit: 7650,   pctChange: 41.5,  totalVolume: "$310K" },
  { id: "8",  username: "MoonShot",       initials: "MS", avatarColor: "#9945FF", profit: 6340,   pctChange: 35.7,  totalVolume: "$265K" },
  { id: "9",  username: "BullRunner",     initials: "BR", avatarColor: "#10B981", profit: 5120,   pctChange: 28.9,  totalVolume: "$210K" },
  { id: "10", username: "TokenMaster",    initials: "TM", avatarColor: "#EF4444", profit: 4280,   pctChange: 22.1,  totalVolume: "$175K" },
  { id: "11", username: "CoinHunter",     initials: "CH", avatarColor: "#F59E0B", profit: 3150,   pctChange: 15.6,  totalVolume: "$130K" },
  { id: "12", username: "GiftGuru",       initials: "GG", avatarColor: "#14B8A6", profit: -1240,  pctChange: -8.3,  totalVolume: "$95K" },
  { id: "13", username: "SwapNinja",      initials: "SN", avatarColor: "#8B5CF6", profit: -2850,  pctChange: -14.7, totalVolume: "$72K" },
  { id: "14", username: "NoviceTrader",   initials: "NT", avatarColor: "#94A3B8", profit: -4100,  pctChange: -21.2, totalVolume: "$45K" },
];

const PERF_BARS = [20, 35, 28, 42, 38, 55, 48, 60, 52, 68, 58, 75, 70, 82, 78, 90, 85, 92, 88, 95];

function PerfChart() {
  const max = Math.max(...PERF_BARS);
  const min = Math.min(...PERF_BARS);
  const range = max - min || 1;
  return (
    <View style={chartStyles.wrap}>
      {PERF_BARS.map((v, i) => {
        const pct = (v - min) / range;
        const t = i / (PERF_BARS.length - 1);
        return (
          <View key={i} style={chartStyles.col}>
            <View style={{
              height: 4 + pct * 32,
              borderRadius: 2,
              backgroundColor: `rgba(${Math.round(0 + t * 139)},${Math.round(229 - t * 137)},${Math.round(255 - t * 9)},${0.3 + pct * 0.7})`,
            }} />
          </View>
        );
      })}
    </View>
  );
}
const chartStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 40 },
  col: { flex: 1, justifyContent: "flex-end" },
});

const PODIUM_CFG = [
  { rank: 2, size: 64, glow: false, crownColor: "#94A3B8" },
  { rank: 1, size: 76, glow: true,  crownColor: "#F59E0B" },
  { rank: 3, size: 64, glow: false, crownColor: "#CD7F32" },
];

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const [timeTab, setTimeTab] = useState<TimeTab>("monthly");
  const [assetFilter, setAssetFilter] = useState<AssetFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = TRADERS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.username.toLowerCase().includes(q));
    }
    return list;
  }, [search]);

  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Leaderboard</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="award" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        {/* Performance chart */}
        <View style={[styles.perfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.perfHeader}>
            <Text style={[styles.perfTitle, { color: colors.foreground }]}>Community Performance</Text>
            <View style={[styles.trendPill, { backgroundColor: "rgba(0,255,136,0.12)" }]}>
              <Feather name="trending-up" size={10} color="#00FF88" />
              <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#00FF88" }}>+34.2%</Text>
            </View>
          </View>
          <PerfChart />
        </View>

        {/* Time tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TIME_TABS.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTimeTab(t.id)}
              activeOpacity={0.8}
              style={[styles.tabChip, { backgroundColor: timeTab === t.id ? "rgba(0,229,255,0.15)" : colors.card, borderColor: timeTab === t.id ? colors.primary : colors.border }]}
            >
              <Text style={[styles.tabText, { color: timeTab === t.id ? colors.primary : colors.mutedForeground }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Asset filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {ASSET_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setAssetFilter(f.id)}
              activeOpacity={0.8}
              style={[styles.assetChip, { backgroundColor: assetFilter === f.id ? "rgba(20,184,166,0.12)" : "transparent", borderColor: assetFilter === f.id ? "#14B8A6" : "transparent" }]}
            >
              <Text style={[styles.assetText, { color: assetFilter === f.id ? "#14B8A6" : colors.mutedForeground }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search traders..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <View style={styles.podiumRow}>
            {PODIUM_CFG.map((cfg) => {
              const trader = top3[cfg.rank - 1];
              const isProfit = trader.pctChange >= 0;
              return (
                <View key={cfg.rank} style={[styles.podiumItem, cfg.rank === 1 && { marginTop: -16 }]}>
                  <Text style={[styles.crownIcon, { color: cfg.crownColor }]}>
                    {cfg.rank === 1 ? "👑" : cfg.rank === 2 ? "🥈" : "🥉"}
                  </Text>
                  <View style={[
                    styles.podiumAvatar,
                    {
                      width: cfg.size, height: cfg.size, borderRadius: cfg.size / 2,
                      backgroundColor: `${trader.avatarColor}20`,
                      borderColor: cfg.glow ? colors.primary : trader.avatarColor + "50",
                      borderWidth: cfg.glow ? 2.5 : 1.5,
                    },
                  ]}>
                    <Text style={[styles.podiumInitials, { color: trader.avatarColor, fontSize: cfg.rank === 1 ? 22 : 18 }]}>{trader.initials}</Text>
                  </View>
                  <Text style={[styles.podiumName, { color: colors.foreground }]} numberOfLines={1}>{trader.username}</Text>
                  <Text style={[styles.podiumProfit, { color: isProfit ? "#00FF88" : "#EF4444" }]}>
                    {isProfit ? "+" : ""}{trader.pctChange}%
                  </Text>
                  <Text style={[styles.podiumVolume, { color: colors.mutedForeground }]}>{trader.totalVolume}</Text>
                  {trader.badge && (
                    <View style={[styles.badge, { backgroundColor: `${trader.badgeColor}15`, borderColor: `${trader.badgeColor}30` }]}>
                      <Text style={[styles.badgeText, { color: trader.badgeColor }]}>{trader.badge}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Ranked list */}
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: colors.foreground }]}>Rankings</Text>
          <Text style={[styles.listCount, { color: colors.mutedForeground }]}>{filtered.length} traders</Text>
        </View>

        {rest.map((trader, i) => {
          const rank = i + 4;
          const isProfit = trader.pctChange >= 0;
          const isMe = trader.isCurrentUser;
          return (
            <View
              key={trader.id}
              style={[
                styles.rankRow,
                {
                  backgroundColor: isMe ? "rgba(0,229,255,0.06)" : colors.card,
                  borderColor: isMe ? colors.primary + "40" : colors.border,
                },
              ]}
            >
              <Text style={[styles.rankNum, { color: colors.mutedForeground }]}>#{rank}</Text>
              <View style={[styles.rankAvatar, { backgroundColor: `${trader.avatarColor}20` }]}>
                <Text style={[styles.rankInitials, { color: trader.avatarColor }]}>{trader.initials}</Text>
              </View>
              <View style={styles.rankInfo}>
                <View style={styles.rankNameRow}>
                  <Text style={[styles.rankName, { color: colors.foreground }]}>{trader.username}</Text>
                  {isMe && (
                    <View style={[styles.youBadge, { backgroundColor: "rgba(0,229,255,0.15)", borderColor: colors.primary + "30" }]}>
                      <Text style={{ fontSize: 9, fontFamily: "Inter_700Bold", color: colors.primary }}>YOU</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.rankVolume, { color: colors.mutedForeground }]}>{trader.totalVolume} volume</Text>
              </View>
              <View style={styles.rankRight}>
                <Text style={[styles.rankProfit, { color: isProfit ? "#00FF88" : "#EF4444" }]}>
                  {isProfit ? "+" : ""}${Math.abs(trader.profit).toLocaleString()}
                </Text>
                <View style={[styles.rankPctPill, { backgroundColor: isProfit ? "rgba(0,255,136,0.12)" : "rgba(239,68,68,0.12)" }]}>
                  <Feather name={isProfit ? "trending-up" : "trending-down"} size={10} color={isProfit ? "#00FF88" : "#EF4444"} />
                  <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: isProfit ? "#00FF88" : "#EF4444" }}>
                    {isProfit ? "+" : ""}{trader.pctChange}%
                  </Text>
                </View>
              </View>
            </View>
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
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  content: { padding: 20, gap: 14 },

  perfCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 12 },
  perfHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  perfTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  trendPill: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },

  tabScroll: { gap: 8 },
  tabChip: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  assetChip: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  assetText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },

  podiumRow: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", gap: 12, paddingVertical: 10 },
  podiumItem: { alignItems: "center", width: 100, gap: 4 },
  crownIcon: { fontSize: 20 },
  podiumAvatar: { alignItems: "center", justifyContent: "center" },
  podiumInitials: { fontFamily: "Inter_700Bold" },
  podiumName: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  podiumProfit: { fontSize: 14, fontFamily: "Inter_700Bold" },
  podiumVolume: { fontSize: 10, fontFamily: "Inter_400Regular" },
  badge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  badgeText: { fontSize: 9, fontFamily: "Inter_700Bold" },

  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  listTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  listCount: { fontSize: 12, fontFamily: "Inter_400Regular" },

  rankRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, padding: 12,
  },
  rankNum: { fontSize: 13, fontFamily: "Inter_700Bold", width: 28, textAlign: "center" },
  rankAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  rankInitials: { fontSize: 14, fontFamily: "Inter_700Bold" },
  rankInfo: { flex: 1, gap: 2 },
  rankNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  rankName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  youBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  rankVolume: { fontSize: 11, fontFamily: "Inter_400Regular" },
  rankRight: { alignItems: "flex-end", gap: 4 },
  rankProfit: { fontSize: 14, fontFamily: "Inter_700Bold" },
  rankPctPill: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 20, paddingHorizontal: 6, paddingVertical: 3 },
});
