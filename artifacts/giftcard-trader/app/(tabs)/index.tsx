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
import { WalletCard } from "@/components/WalletCard";
import { RateCard } from "@/components/RateCard";
import { TransactionItem, Transaction } from "@/components/TransactionItem";

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: "1", cardType: "Amazon Gift Card", amount: 100, payout: 75000, status: "success", date: "Today, 2:30 PM" },
  { id: "2", cardType: "iTunes Gift Card", amount: 50, payout: 36000, status: "pending", date: "Yesterday, 11:10 AM" },
  { id: "3", cardType: "Steam Gift Card", amount: 200, payout: 140000, status: "success", date: "Apr 1, 9:05 AM" },
  { id: "4", cardType: "Google Play", amount: 25, payout: 17750, status: "error", date: "Mar 30, 4:20 PM" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 120 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good morning</Text>
            <Text style={[styles.username, { color: colors.foreground }]}>Alex Johnson</Text>
          </View>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
            testID="notifications-button"
          >
            <Feather name="bell" size={20} color={colors.mutedForeground} />
            <View style={[styles.notifDot, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>
        </View>

        {/* Wallet Card */}
        <WalletCard
          balance={253750}
          onWithdraw={() => {}}
          onDeposit={() => {}}
        />

        {/* Live Rate */}
        <RateCard rate={750} fromCurrency="$" toCurrency="₦" change={2.3} />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { label: "Buy Card",     icon: "shopping-bag",  color: "#00FF88",      onPress: () => router.push("/buy") },
            { label: "Sell Card",    icon: "dollar-sign",   color: colors.primary, onPress: () => router.push("/sell") },
            { label: "Buy Crypto",   icon: "trending-up",   color: "#14B8A6",      onPress: () => router.push("/buy-crypto") },
            { label: "Dollar Card",  icon: "credit-card",   color: "#8B5CF6",      onPress: () => router.push("/virtual-card") },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              activeOpacity={0.8}
              onPress={action.onPress}
              testID={`quick-action-${action.label.toLowerCase().replace(" ", "-")}`}
              style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${action.color}18` }]}>
                <Feather name={action.icon as any} size={20} color={action.color} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {SAMPLE_TRANSACTIONS.map((t) => (
          <TransactionItem key={t.id} item={t} />
        ))}
      </ScrollView>

      {/* Floating Sell Button */}
      <View
        style={[
          styles.fabWrap,
          { bottom: bottomPad + (isWeb ? 84 : 72) },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          testID="sell-fab"
          onPress={() => router.push("/sell")}
          activeOpacity={0.85}
          style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        >
          <Feather name="dollar-sign" size={22} color={colors.primaryForeground} />
          <Text style={[styles.fabText, { color: colors.primaryForeground }]}>Sell Card</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  username: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  quickBtn: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  seeAll: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  fabWrap: {
    position: "absolute",
    right: 20,
    alignItems: "flex-end",
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  },
  fabText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
