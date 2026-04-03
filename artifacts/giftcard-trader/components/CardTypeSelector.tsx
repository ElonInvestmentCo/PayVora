import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

export interface CardType {
  id: string;
  name: string;
  icon: string;
  rate: number;
  color: string;
}

export const CARD_TYPES: CardType[] = [
  { id: "amazon", name: "Amazon", icon: "shopping-bag", rate: 750, color: "#FF9900" },
  { id: "itunes", name: "iTunes", icon: "music", rate: 720, color: "#FC3C44" },
  { id: "steam", name: "Steam", icon: "layers", rate: 700, color: "#1B2838" },
  { id: "google", name: "Google Play", icon: "play", rate: 710, color: "#34A853" },
  { id: "visa", name: "Visa", icon: "credit-card", rate: 760, color: "#1A1F71" },
  { id: "ebay", name: "eBay", icon: "tag", rate: 680, color: "#E43137" },
];

interface CardTypeSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function CardTypeSelector({ selected, onSelect }: CardTypeSelectorProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        Select Card Type
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {CARD_TYPES.map((card) => {
          const isSelected = selected === card.id;
          return (
            <TouchableOpacity
              key={card.id}
              testID={`card-type-${card.id}`}
              onPress={() => onSelect(card.id)}
              activeOpacity={0.8}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected ? "rgba(0,229,255,0.1)" : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: isSelected ? "rgba(0,229,255,0.2)" : "rgba(148,163,184,0.1)" },
                ]}
              >
                <Feather
                  name={card.icon as any}
                  size={18}
                  color={isSelected ? colors.primary : colors.mutedForeground}
                />
              </View>
              <Text
                style={[
                  styles.cardName,
                  { color: isSelected ? colors.primary : colors.foreground },
                ]}
              >
                {card.name}
              </Text>
              <Text style={[styles.rateLabel, { color: colors.mutedForeground }]}>
                ₦{card.rate}/
                <Text style={{ color: colors.mutedForeground }}>$1</Text>
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  scroll: {
    gap: 10,
    paddingRight: 4,
  },
  card: {
    width: 90,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  rateLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
