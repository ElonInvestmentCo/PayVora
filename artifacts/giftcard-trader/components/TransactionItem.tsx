import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBadge, Status } from "./StatusBadge";
import { useColors } from "@/hooks/useColors";

export interface Transaction {
  id: string;
  cardType: string;
  amount: number;
  payout: number;
  status: Status;
  date: string;
}

interface TransactionItemProps {
  item: Transaction;
}

export function TransactionItem({ item }: TransactionItemProps) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: "rgba(16,114,234,0.1)" }]}>
        <Feather name="credit-card" size={18} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>{item.cardType}</Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>{item.date}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.foreground }]}>${item.amount}</Text>
        <Text style={[styles.payout, { color: colors.success }]}>₦{item.payout.toLocaleString()}</Text>
        <StatusBadge status={item.status} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  name: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 3,
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  right: { alignItems: "flex-end", gap: 4 },
  amount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  payout: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
