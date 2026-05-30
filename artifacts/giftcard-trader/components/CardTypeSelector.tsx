import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { BrandLogo } from "@/components/BrandLogo";

export interface CardType {
  id: string;
  name: string;
  rate: number;
  color: string;
}

export const CARD_TYPES: CardType[] = [
  { id: "amazon", name: "Amazon",      rate: 750, color: "#FF9900" },
  { id: "itunes", name: "iTunes",      rate: 720, color: "#FC3C44" },
  { id: "steam",  name: "Steam",       rate: 700, color: "#4A90D9" },
  { id: "google", name: "Google Play", rate: 710, color: "#34A853" },
  { id: "visa",   name: "Visa",        rate: 760, color: "#1A1F71" },
  { id: "ebay",   name: "eBay",        rate: 680, color: "#E43137" },
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
              <BrandLogo
                id={card.id}
                name={card.name}
                color={card.color}
                size={38}
                borderRadius={12}
              />
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
