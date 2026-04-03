import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { GlowButton } from "@/components/GlowButton";

interface CardTx {
  id: string;
  merchant: string;
  amount: string;
  date: string;
  status: "success" | "pending" | "error";
  icon: string;
}

const CARD_TRANSACTIONS: CardTx[] = [
  { id: "1", merchant: "Netflix",          amount: "-$15.99",  date: "Today, 4:12 PM",      status: "success", icon: "tv" },
  { id: "2", merchant: "Amazon",           amount: "-$42.50",  date: "Today, 1:30 PM",      status: "success", icon: "shopping-bag" },
  { id: "3", merchant: "Spotify",          amount: "-$9.99",   date: "Yesterday, 8:00 AM",  status: "pending", icon: "music" },
  { id: "4", merchant: "Adobe Creative",   amount: "-$54.99",  date: "Apr 1, 2:15 PM",      status: "success", icon: "pen-tool" },
  { id: "5", merchant: "Google Cloud",     amount: "-$120.00", date: "Mar 31, 11:00 AM",    status: "error",   icon: "cloud" },
  { id: "6", merchant: "Figma",            amount: "-$12.00",  date: "Mar 30, 9:30 AM",     status: "success", icon: "layout" },
];

const SPENDING_DATA = [25, 40, 35, 55, 45, 60, 50, 70, 65, 80, 72, 90, 85, 78, 92, 88];

const STATUS_CFG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  success: { bg: "rgba(0,255,136,0.12)", border: "#00FF8830", text: "#00FF88", label: "Successful" },
  pending: { bg: "rgba(245,158,11,0.12)", border: "#F59E0B30", text: "#F59E0B", label: "Pending" },
  error:   { bg: "rgba(239,68,68,0.12)", border: "#EF444430", text: "#EF4444", label: "Failed" },
};

function SpendingChart() {
  const max = Math.max(...SPENDING_DATA);
  const min = Math.min(...SPENDING_DATA);
  const range = max - min || 1;
  return (
    <View style={chStyles.wrap}>
      {SPENDING_DATA.map((v, i) => {
        const pct = (v - min) / range;
        const isLast = i === SPENDING_DATA.length - 1;
        return (
          <View key={i} style={chStyles.col}>
            <View
              style={{
                height: 6 + pct * 44,
                borderRadius: 3,
                backgroundColor: isLast ? "#8B5CF6" : `rgba(0,229,255,${0.2 + pct * 0.6})`,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

const chStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 54 },
  col: { flex: 1, justifyContent: "flex-end" },
});

export default function VirtualCardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const [showDetails, setShowDetails] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [onlineTx, setOnlineTx] = useState(true);
  const [fundLoading, setFundLoading] = useState(false);

  const handleFund = useCallback(async () => {
    setFundLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setFundLoading(false);
    Alert.alert("Card Funded", "Successfully added $100.00 to your virtual card.");
  }, []);

  const handleWithdraw = useCallback(() => {
    Alert.alert("Withdraw", "Withdrawal of $50.00 initiated from your virtual card.");
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
          testID="back-button"
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Virtual Dollar Card</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="settings" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        {/* Virtual Card */}
        <View style={[styles.card, frozen && styles.cardFrozen]}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardLabel}>Virtual Card</Text>
              <Text style={styles.cardBalance}>$2,450.00</Text>
            </View>
            <View style={styles.cardBrand}>
              <Text style={styles.brandText}>VISA</Text>
            </View>
          </View>
          <View style={styles.cardMiddle}>
            <Text style={styles.cardNumber}>
              {showDetails ? "4532  7891  2345  6789" : "****  ****  ****  6789"}
            </Text>
          </View>
          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardFieldLabel}>CARD HOLDER</Text>
              <Text style={styles.cardFieldValue}>ALEX JOHNSON</Text>
            </View>
            <View>
              <Text style={styles.cardFieldLabel}>EXPIRES</Text>
              <Text style={styles.cardFieldValue}>{showDetails ? "12/28" : "**/**"}</Text>
            </View>
            <View>
              <Text style={styles.cardFieldLabel}>CVV</Text>
              <Text style={styles.cardFieldValue}>{showDetails ? "491" : "***"}</Text>
            </View>
          </View>
          {frozen && (
            <View style={styles.frozenOverlay}>
              <Feather name="lock" size={28} color="#FFFFFF" />
              <Text style={styles.frozenText}>Card Frozen</Text>
            </View>
          )}
          <View style={styles.cardGlow} />
        </View>

        {/* Show/Hide toggle */}
        <TouchableOpacity
          testID="toggle-details"
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.8}
          style={styles.toggleRow}
        >
          <Feather name={showDetails ? "eye-off" : "eye"} size={16} color={colors.primary} />
          <Text style={[styles.toggleText, { color: colors.primary }]}>
            {showDetails ? "Hide" : "Show"} Card Details
          </Text>
        </TouchableOpacity>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleFund}
            style={[styles.actionBtn, { backgroundColor: "rgba(0,229,255,0.12)" }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: "rgba(0,229,255,0.2)" }]}>
              <Feather name="plus" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.primary }]}>Fund Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleWithdraw}
            style={[styles.actionBtn, { backgroundColor: "rgba(20,184,166,0.12)" }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: "rgba(20,184,166,0.2)" }]}>
              <Feather name="arrow-up-right" size={18} color="#14B8A6" />
            </View>
            <Text style={[styles.actionLabel, { color: "#14B8A6" }]}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFrozen(!frozen)}
            style={[styles.actionBtn, { backgroundColor: frozen ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)" }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: frozen ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)" }]}>
              <Feather name={frozen ? "unlock" : "lock"} size={18} color={frozen ? "#EF4444" : "#F59E0B"} />
            </View>
            <Text style={[styles.actionLabel, { color: frozen ? "#EF4444" : "#F59E0B" }]}>
              {frozen ? "Unfreeze" : "Freeze"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Spending chart */}
        <View style={[styles.spendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.spendHeader}>
            <Text style={[styles.spendTitle, { color: colors.foreground }]}>Monthly Spending</Text>
            <Text style={[styles.spendTotal, { color: colors.primary }]}>$255.47</Text>
          </View>
          <SpendingChart />
        </View>

        {/* Card Settings */}
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.settingsTitle, { color: colors.foreground }]}>Card Settings</Text>

          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Feather name="globe" size={16} color={colors.mutedForeground} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Online Transactions</Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>Allow online purchases</Text>
              </View>
            </View>
            <Switch
              testID="online-tx-switch"
              value={onlineTx}
              onValueChange={setOnlineTx}
              trackColor={{ false: colors.border, true: "rgba(0,229,255,0.4)" }}
              thumbColor={onlineTx ? colors.primary : colors.mutedForeground}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Feather name="shield" size={16} color={colors.mutedForeground} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Spending Limit</Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>$500.00 / day</Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.8}>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="bell" size={16} color={colors.mutedForeground} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Transaction Alerts</Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>Push notifications</Text>
              </View>
            </View>
            <Switch
              value={true}
              trackColor={{ false: colors.border, true: "rgba(0,255,136,0.4)" }}
              thumbColor="#00FF88"
            />
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.txHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Card Transactions</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {CARD_TRANSACTIONS.map((tx) => {
          const st = STATUS_CFG[tx.status];
          return (
            <View key={tx.id} style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.txIcon, { backgroundColor: `${st.text}15` }]}>
                <Feather name={tx.icon as any} size={16} color={st.text} />
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txMerchant, { color: colors.foreground }]}>{tx.merchant}</Text>
                <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{tx.date}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={[styles.txAmount, { color: colors.foreground }]}>{tx.amount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                  <View style={[styles.statusDot, { backgroundColor: st.text }]} />
                  <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
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
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  content: { padding: 20, gap: 4 },

  card: {
    borderRadius: 20, padding: 24, height: 210,
    backgroundColor: "#1E293B",
    borderWidth: 1, borderColor: "rgba(0,229,255,0.2)",
    justifyContent: "space-between",
    overflow: "hidden",
    position: "relative",
  },
  cardFrozen: { opacity: 0.6 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1 },
  cardBalance: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 4 },
  cardBrand: {
    backgroundColor: "rgba(0,229,255,0.15)", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  brandText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#00E5FF", letterSpacing: 2 },
  cardMiddle: { marginVertical: 4 },
  cardNumber: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: "#FFFFFF", letterSpacing: 3 },
  cardBottom: { flexDirection: "row", gap: 24 },
  cardFieldLabel: { fontSize: 9, fontFamily: "Inter_400Regular", color: "#94A3B8", letterSpacing: 1, marginBottom: 2 },
  cardFieldValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  frozenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 20,
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  frozenText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  cardGlow: {
    position: "absolute", top: -40, right: -40,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(0,229,255,0.08)",
  },

  toggleRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    justifyContent: "center", paddingVertical: 12, marginBottom: 4,
  },
  toggleText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  actionRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", gap: 8 },
  actionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  spendCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20, gap: 12 },
  spendHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  spendTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  spendTotal: { fontSize: 15, fontFamily: "Inter_700Bold" },

  settingsCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20 },
  settingsTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 12 },
  settingRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1,
  },
  settingInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  settingDesc: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },

  txHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },

  txRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1, gap: 2 },
  txMerchant: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  txDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  txRight: { alignItems: "flex-end", gap: 4 },
  txAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },

  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
