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
import { CARD_TYPES } from "@/components/CardTypeSelector";

const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD"];
const CURRENCY_MULTIPLIERS: Record<string, number> = {
  USD: 1,
  GBP: 1.26,
  EUR: 1.09,
  CAD: 0.74,
  AUD: 0.65,
};

export default function RatesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;
  const [activeCurrency, setActiveCurrency] = useState("USD");

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Live Rates</Text>

        {/* Currency Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.currencyTabs}
          style={{ marginBottom: 20 }}
        >
          {CURRENCIES.map((cur) => (
            <TouchableOpacity
              key={cur}
              onPress={() => setActiveCurrency(cur)}
              activeOpacity={0.8}
              style={[
                styles.currencyTab,
                {
                  backgroundColor: activeCurrency === cur ? colors.primary : colors.card,
                  borderColor: activeCurrency === cur ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.currencyTabText,
                  { color: activeCurrency === cur ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {cur}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Rate cards */}
        {CARD_TYPES.map((card) => {
          const baseRate = card.rate;
          const rate = Math.round(baseRate * CURRENCY_MULTIPLIERS[activeCurrency]);
          const change = (Math.random() * 4 - 1).toFixed(1);
          const isUp = parseFloat(change) >= 0;

          return (
            <View
              key={card.id}
              style={[styles.rateCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.cardIcon, { backgroundColor: `${card.color}20` }]}>
                <Feather name={card.icon as any} size={22} color={card.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardName, { color: colors.foreground }]}>{card.name}</Text>
                <Text style={[styles.cardRate, { color: colors.primary }]}>
                  {activeCurrency}1 = ₦{rate.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.changeBadge, { backgroundColor: isUp ? "rgba(0,255,136,0.1)" : "rgba(255,68,68,0.1)" }]}>
                <Feather name={isUp ? "trending-up" : "trending-down"} size={13} color={isUp ? "#00FF88" : "#FF4444"} />
                <Text style={[styles.changeText, { color: isUp ? "#00FF88" : "#FF4444" }]}>
                  {isUp ? "+" : ""}{change}%
                </Text>
              </View>
            </View>
          );
        })}

        {/* Note */}
        <View style={[styles.note, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
            Rates are updated in real-time and may vary at the time of trade completion.
          </Text>
        </View>
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
  currencyTabs: {
    gap: 8,
  },
  currencyTab: {
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderWidth: 1,
  },
  currencyTabText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  rateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  cardRate: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  changeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  note: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
