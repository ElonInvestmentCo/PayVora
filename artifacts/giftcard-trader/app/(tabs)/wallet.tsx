import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useKyc } from "@/contexts/KycContext";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

type FilterTab = "all" | "crypto" | "fiat";

const CHART_POINTS = [42, 45, 43, 48, 46, 50, 47, 53, 51, 55, 52, 58, 56, 60, 57, 62, 59, 64, 61, 66, 63, 68, 65, 70];

const ICON_MAP: Record<string, string> = {
  BTC: "bold", ETH: "triangle", SOL: "sun", USDT: "dollar-sign",
  BNB: "hexagon", NGN: "dollar-sign", USD: "dollar-sign",
};

function PortfolioChart() {
  const max = Math.max(...CHART_POINTS);
  const min = Math.min(...CHART_POINTS);
  const range = max - min || 1;
  const h = 80;

  return (
    <View style={cStyles.wrap}>
      {CHART_POINTS.map((v, i) => {
        const pct = (v - min) / range;
        const barH = 6 + pct * (h - 6);
        const isLast = i === CHART_POINTS.length - 1;
        return (
          <View key={i} style={cStyles.col}>
            <View
              style={{
                height: barH,
                borderRadius: 2,
                backgroundColor: isLast ? "#00E5FF" : `rgba(0,229,255,${0.15 + pct * 0.55})`,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

const cStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 80 },
  col: { flex: 1, justifyContent: "flex-end" },
});

const ACTION_ICON_MAP: Record<string, string> = {
  Buy: "arrow-down-left",
  Sell: "arrow-up-right",
  Deposit: "download",
  Withdraw: "upload",
};
const ACTION_COLOR_MAP: Record<string, string> = {
  Buy: "#00E5FF",
  Sell: "#FF4444",
  Deposit: "#00FF88",
  Withdraw: "#F59E0B",
};
const STATUS_CFG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  success: { bg: "rgba(0,255,136,0.12)", border: "#00FF8830", text: "#00FF88", label: "Completed" },
  pending: { bg: "rgba(245,158,11,0.12)", border: "#F59E0B30", text: "#F59E0B", label: "Pending" },
  error:   { bg: "rgba(239,68,68,0.12)", border: "#EF444430", text: "#EF4444", label: "Failed" },
};

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { kycStatus } = useKyc();
  const { assets, transactions, ngnBalance, usdBalance } = useWallet();
  const { togglePanel } = useNotifications();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [filter, setFilter] = useState<FilterTab>("all");

  const filteredAssets = filter === "all" ? assets : assets.filter((a) => a.type === filter);

  const walletTxs = transactions.slice(0, 7).map((t) => ({
    id: t.id,
    action: (t.direction === "in" ? (t.type === "crypto" ? "Sell" : "Deposit") : (t.type === "crypto" ? "Buy" : "Withdraw")) as "Buy" | "Sell" | "Deposit" | "Withdraw",
    asset: t.currency,
    amount: `${t.direction === "in" ? "+" : "-"}${t.currency === "NGN" ? "₦" : "$"}${t.amount.toLocaleString()}`,
    fiat: "",
    date: t.date,
    status: t.status,
    type: (t.type === "crypto" ? "crypto" : "fiat") as "crypto" | "fiat",
  }));

  const filteredTx = filter === "all" ? walletTxs : walletTxs.filter((t) => t.type === filter);

  const totalBalance = assets.reduce((s, a) => s + (a.type === "fiat" && a.symbol === "NGN" ? a.value : a.value), 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 }]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Wallet Balance</Text>
          <TouchableOpacity onPress={togglePanel} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
            <Feather name="bell" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Total Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.balLabel, { color: colors.mutedForeground }]}>Total Portfolio Value</Text>
          <View style={styles.balRow}>
            <Text style={[styles.balAmount, { color: colors.foreground }]}>
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={[styles.changePill, { backgroundColor: "rgba(0,255,136,0.12)" }]}>
              <Feather name="trending-up" size={12} color="#00FF88" />
              <Text style={[styles.changeText, { color: "#00FF88" }]}>+3.2%</Text>
            </View>
          </View>
          <PortfolioChart />
        </View>

        {kycStatus !== "verified" && (
          <View style={[styles.alertBanner, {
            backgroundColor: kycStatus === "pending" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
            borderColor: kycStatus === "pending" ? "#F59E0B30" : "#EF444430",
          }]}>
            <Feather name={kycStatus === "pending" ? "clock" : "alert-circle"} size={16} color={kycStatus === "pending" ? "#F59E0B" : "#EF4444"} />
            <Text style={[styles.alertText, { color: kycStatus === "pending" ? "#F59E0B" : "#EF4444" }]}>
              {kycStatus === "pending" ? "Your KYC verification is under review." : "Complete KYC verification to increase your withdrawal limit."}
            </Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/kyc")}>
              <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: kycStatus === "pending" ? "#F59E0B" : "#EF4444" }}>
                {kycStatus === "pending" ? "View" : "Verify"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionRow}>
          {[
            { label: "Deposit",  icon: "download",      color: colors.primary },
            { label: "Withdraw", icon: "upload",         color: "#14B8A6" },
            { label: "Transfer", icon: "repeat",         color: colors.mutedForeground, outlined: true },
          ].map((btn) => (
            <TouchableOpacity
              key={btn.label}
              activeOpacity={0.8}
              style={[
                styles.actionBtn,
                btn.outlined
                  ? { borderColor: colors.border, borderWidth: 1, backgroundColor: "transparent" }
                  : { backgroundColor: `${btn.color}18` },
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${btn.color}20` }]}>
                <Feather name={btn.icon as any} size={18} color={btn.color} />
              </View>
              <Text style={[styles.actionLabel, { color: btn.outlined ? colors.mutedForeground : btn.color }]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filter tabs */}
        <View style={[styles.filterRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(["all", "crypto", "fiat"] as FilterTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              testID={`filter-${tab}`}
              onPress={() => setFilter(tab)}
              activeOpacity={0.8}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: filter === tab ? "rgba(0,229,255,0.15)" : "transparent",
                  borderColor: filter === tab ? colors.primary : "transparent",
                },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === tab ? colors.primary : colors.mutedForeground }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Assets list */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Assets</Text>
        {filteredAssets.map((asset) => {
          const iconName = ICON_MAP[asset.symbol] || "circle";
          return (
            <View key={asset.id} style={[styles.assetRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.assetIcon, { backgroundColor: `${asset.color}22` }]}>
                <Feather name={iconName as any} size={18} color={asset.color} />
              </View>
              <View style={styles.assetInfo}>
                <Text style={[styles.assetName, { color: colors.foreground }]}>{asset.name}</Text>
                <Text style={[styles.assetBal, { color: colors.mutedForeground }]}>
                  {asset.type === "fiat"
                    ? `${asset.symbol === "NGN" ? "₦" : "$"}${asset.balance.toLocaleString()}`
                    : `${asset.balance} ${asset.symbol}`}
                </Text>
              </View>
              <View style={styles.assetRight}>
                <Text style={[styles.assetFiat, { color: colors.foreground }]}>
                  ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                {asset.change !== 0 && (
                  <View style={styles.assetChangeRow}>
                    <Feather
                      name={asset.change >= 0 ? "trending-up" : "trending-down"}
                      size={10}
                      color={asset.change >= 0 ? "#00FF88" : "#FF4444"}
                    />
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: asset.change >= 0 ? "#00FF88" : "#FF4444" }}>
                      {asset.change >= 0 ? "+" : ""}{asset.change}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Transaction History */}
        <View style={styles.txHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Transaction History</Text>
          <TouchableOpacity onPress={() => router.push("/transactions")} activeOpacity={0.8}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {filteredTx.map((tx) => {
          const st = STATUS_CFG[tx.status];
          return (
            <View key={tx.id} style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.txIcon, { backgroundColor: `${ACTION_COLOR_MAP[tx.action]}15` }]}>
                <Feather name={ACTION_ICON_MAP[tx.action] as any} size={16} color={ACTION_COLOR_MAP[tx.action]} />
              </View>
              <View style={styles.txInfo}>
                <View style={styles.txTop}>
                  <Text style={[styles.txAction, { color: colors.foreground }]}>{tx.action} {tx.asset}</Text>
                  <Text style={[styles.txAmount, { color: tx.action === "Buy" || tx.action === "Deposit" ? "#00FF88" : "#FF4444" }]}>
                    {tx.amount}
                  </Text>
                </View>
                <View style={styles.txBottom}>
                  <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{tx.date}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                    <View style={[styles.statusDot, { backgroundColor: st.text }]} />
                    <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>
                {tx.fiat ? (
                  <Text style={[styles.txFiat, { color: colors.mutedForeground }]}>{tx.fiat}</Text>
                ) : null}
              </View>
            </View>
          );
        })}

        {filteredTx.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="inbox" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No transactions found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },

  balanceCard: { borderRadius: 16, padding: 20, borderWidth: 1, marginBottom: 14, gap: 12 },
  balLabel: { fontSize: 12, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.8 },
  balRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  balAmount: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  changePill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  changeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  alertBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 16,
  },
  alertText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 17 },

  actionRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", gap: 8,
  },
  actionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  filterRow: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 4, gap: 4, marginBottom: 20 },
  filterBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 14 },

  assetRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  assetIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  assetInfo: { flex: 1, gap: 2 },
  assetName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  assetBal: { fontSize: 12, fontFamily: "Inter_400Regular" },
  assetRight: { alignItems: "flex-end", gap: 3 },
  assetFiat: { fontSize: 15, fontFamily: "Inter_700Bold" },
  assetChangeRow: { flexDirection: "row", alignItems: "center", gap: 3 },

  txHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, marginTop: 8 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },

  txRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  txInfo: { flex: 1, gap: 4 },
  txTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  txAction: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  txAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  txBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  txDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  txFiat: { fontSize: 12, fontFamily: "Inter_400Regular" },

  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  emptyState: {
    borderRadius: 14, borderWidth: 1, padding: 30,
    alignItems: "center", gap: 10,
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
