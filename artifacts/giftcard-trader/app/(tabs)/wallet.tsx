import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { WalletCard } from "@/components/WalletCard";
import { StatusBadge } from "@/components/StatusBadge";

const BANK_ACCOUNTS = [
  { id: "1", bank: "First Bank", account: "•••• 4521", name: "Alex Johnson" },
  { id: "2", bank: "GTBank", account: "•••• 8830", name: "Alex J." },
];

export default function WalletScreen() {
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
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Wallet</Text>

        <WalletCard balance={253750} onWithdraw={() => {}} onDeposit={() => {}} />

        {/* Payout Accounts */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payout Accounts</Text>
        {BANK_ACCOUNTS.map((acc) => (
          <View
            key={acc.id}
            style={[styles.bankCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.bankIcon, { backgroundColor: "rgba(0,229,255,0.1)" }]}>
              <Feather name="credit-card" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bankName, { color: colors.foreground }]}>{acc.bank}</Text>
              <Text style={[styles.bankAcc, { color: colors.mutedForeground }]}>
                {acc.name} · {acc.account}
              </Text>
            </View>
            <StatusBadge status="success" label="Active" />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.addAccount, { borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <Feather name="plus-circle" size={20} color={colors.primary} />
          <Text style={[styles.addAccountText, { color: colors.primary }]}>Add Payout Account</Text>
        </TouchableOpacity>

        {/* Payout history */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payout History</Text>
        {[
          { amount: "₦75,000", date: "Today 2:30 PM", method: "First Bank", status: "success" as const },
          { amount: "₦36,000", date: "Yesterday", method: "GTBank", status: "pending" as const },
          { amount: "₦140,000", date: "Apr 1", method: "First Bank", status: "success" as const },
        ].map((payout, i) => (
          <View
            key={i}
            style={[styles.payoutRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.payoutIcon, { backgroundColor: "rgba(16,185,129,0.1)" }]}>
              <Feather name="arrow-up-right" size={16} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.payoutAmount, { color: colors.foreground }]}>{payout.amount}</Text>
              <Text style={[styles.payoutMeta, { color: colors.mutedForeground }]}>
                {payout.method} · {payout.date}
              </Text>
            </View>
            <StatusBadge status={payout.status} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
    marginTop: 8,
  },
  bankCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  bankIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bankName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  bankAcc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  addAccount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 14,
    marginBottom: 24,
  },
  addAccountText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  payoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  payoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  payoutAmount: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  payoutMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
