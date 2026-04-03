import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";

interface WalletCardProps {
  balance: number;
  onWithdraw: () => void;
  onDeposit: () => void;
}

export function WalletCard({ balance, onWithdraw, onDeposit }: WalletCardProps) {
  const colors = useColors();

  return (
    <LinearGradient
      colors={["#00E5FF22", "#8B5CF622"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Total Balance</Text>
        <View style={[styles.liveBadge, { backgroundColor: "rgba(0,255,136,0.15)" }]}>
          <View style={[styles.dot, { backgroundColor: "#00FF88" }]} />
          <Text style={[styles.liveText, { color: "#00FF88" }]}>Live</Text>
        </View>
      </View>
      <Text style={[styles.balance, { color: colors.foreground }]}>
        ₦{balance.toLocaleString()}
      </Text>
      <Text style={[styles.usd, { color: colors.mutedForeground }]}>
        ≈ ${(balance / 750).toFixed(2)} USD
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onWithdraw}
          activeOpacity={0.8}
          style={[styles.actionBtn, { backgroundColor: "rgba(0,229,255,0.12)", borderColor: colors.primary }]}
        >
          <Feather name="arrow-up-right" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Withdraw</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDeposit}
          activeOpacity={0.8}
          style={[styles.actionBtn, { backgroundColor: "rgba(0,255,136,0.12)", borderColor: "#00FF88" }]}
        >
          <Feather name="arrow-down-left" size={16} color="#00FF88" />
          <Text style={[styles.actionText, { color: "#00FF88" }]}>Deposit</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  balance: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    marginBottom: 4,
  },
  usd: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
