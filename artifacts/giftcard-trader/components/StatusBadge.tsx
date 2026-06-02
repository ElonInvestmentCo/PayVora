import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export type Status = "success" | "pending" | "error";

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

const STATUS_CONFIG = {
  success: { color: "#118D45", bg: "rgba(17,141,69,0.12)", icon: "check-circle" as const, label: "Completed" },
  pending: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: "clock" as const, label: "Pending" },
  error: { color: "#E02E5B", bg: "rgba(224,46,91,0.12)", icon: "x-circle" as const, label: "Failed" },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Feather name={config.icon} size={12} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{label || config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
