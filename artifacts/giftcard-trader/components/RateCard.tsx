import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface RateCardProps {
  rate: number;
  fromCurrency: string;
  toCurrency: string;
  change?: number;
}

export function RateCard({ rate, fromCurrency, toCurrency, change = 0 }: RateCardProps) {
  const colors = useColors();
  const isUp = change >= 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={styles.rateSection}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Live Rate</Text>
          <Text style={[styles.rate, { color: colors.primary }]}>
            {fromCurrency}1 = {toCurrency}{rate.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: isUp ? "rgba(0,255,136,0.12)" : "rgba(255,68,68,0.12)" }]}>
          <Feather name={isUp ? "trending-up" : "trending-down"} size={14} color={isUp ? "#00FF88" : "#FF4444"} />
          <Text style={[styles.change, { color: isUp ? "#00FF88" : "#FF4444" }]}>
            {isUp ? "+" : ""}{change.toFixed(1)}%
          </Text>
        </View>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <View style={styles.footer}>
        <View style={styles.dot} />
        <Text style={[styles.live, { color: colors.success }]}>Live market rate</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rateSection: {},
  label: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  rate: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  change: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#00FF88",
  },
  live: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
