import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useColors } from "@/hooks/useColors";
import { hapticSuccess, hapticError } from "@/utils/haptics";
import { CardTypeSelector, CARD_TYPES } from "@/components/CardTypeSelector";
import { RateCard } from "@/components/RateCard";
import { GlowButton } from "@/components/GlowButton";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AUD";

const CURRENCY_RATES: Record<Currency, number> = {
  USD: 750,
  GBP: 945,
  EUR: 820,
  CAD: 555,
  AUD: 490,
};

const CURRENCIES: Currency[] = ["USD", "GBP", "EUR", "CAD", "AUD"];

export default function SellScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateNgnBalance, addTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [selectedCard, setSelectedCard] = useState("amazon");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const cardInfo = CARD_TYPES.find((c) => c.id === selectedCard);
  const rate = CURRENCY_RATES[currency];
  const numAmount = parseFloat(amount) || 0;
  const payout = numAmount * rate;

  const handleImagePick = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!amount || numAmount <= 0) {
      hapticError();
      Alert.alert("Error", "Please enter a valid card amount.");
      return;
    }
    if (!imageUri) {
      hapticError();
      Alert.alert("Error", "Please upload your gift card image.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    updateNgnBalance(payout);
    addTransaction({
      type: "gift_card",
      category: "Gift Cards",
      title: `${cardInfo?.name} Gift Card Sold`,
      amount: payout,
      currency: "NGN",
      status: "success",
      date: "Just now",
      direction: "in",
    });
    addNotification({
      title: "Trade Completed",
      message: `Your ${cardInfo?.name} card trade for ${currency}${numAmount} completed. ₦${payout.toLocaleString()} credited.`,
      type: "success",
      time: "Just now",
    });
    hapticSuccess();
    Alert.alert(
      "Trade Submitted!",
      `Your ${cardInfo?.name} card trade for ${currency}${numAmount} (₦${payout.toLocaleString()}) has been submitted and is being reviewed.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  }, [amount, imageUri, numAmount, payout, cardInfo, currency, updateNgnBalance, addTransaction, addNotification]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
          testID="back-button"
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Sell Gift Card</Text>
        <View style={[styles.headerRight, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={18} color={colors.mutedForeground} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card type selector */}
        <CardTypeSelector selected={selectedCard} onSelect={setSelectedCard} />

        {/* Live Rate */}
        <RateCard rate={rate} fromCurrency="$" toCurrency="₦" change={2.3} />

        {/* Amount & Currency Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Card Amount</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              testID="amount-input"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={[styles.input, { color: colors.foreground }]}
            />
            {/* Currency selector */}
            <TouchableOpacity
              testID="currency-selector"
              onPress={() => setCurrencyOpen(!currencyOpen)}
              activeOpacity={0.8}
              style={[styles.currencyBtn, { backgroundColor: "rgba(0,229,255,0.1)", borderColor: colors.primary }]}
            >
              <Text style={[styles.currencyText, { color: colors.primary }]}>{currency}</Text>
              <Feather name={currencyOpen ? "chevron-up" : "chevron-down"} size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Currency dropdown */}
          {currencyOpen && (
            <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => { setCurrency(c); setCurrencyOpen(false); }}
                  style={[styles.dropdownItem, c === currency && { backgroundColor: "rgba(0,229,255,0.08)" }]}
                >
                  <Text style={[styles.dropdownText, { color: c === currency ? colors.primary : colors.foreground }]}>{c}</Text>
                  {c === currency && <Feather name="check" size={14} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Payout display */}
        {numAmount > 0 && (
          <View style={[styles.payoutCard, { backgroundColor: "rgba(0,255,136,0.06)", borderColor: "#00FF8830" }]}>
            <View style={styles.payoutRow}>
              <Text style={[styles.payoutLabel, { color: colors.mutedForeground }]}>You Receive</Text>
              <Text style={[styles.payoutAmount, { color: "#00FF88" }]}>
                ₦{payout.toLocaleString()}
              </Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={[styles.payoutLabel, { color: colors.mutedForeground }]}>Rate Applied</Text>
              <Text style={[styles.payoutRate, { color: colors.primary }]}>
                {currency}1 = ₦{rate}
              </Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={[styles.payoutLabel, { color: colors.mutedForeground }]}>Card Type</Text>
              <Text style={[styles.payoutRate, { color: colors.foreground }]}>
                {cardInfo?.name}
              </Text>
            </View>
          </View>
        )}

        {/* Upload section */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Card Image / Code</Text>
          <TouchableOpacity
            testID="upload-button"
            onPress={handleImagePick}
            activeOpacity={0.8}
            style={[
              styles.uploadArea,
              {
                backgroundColor: imageUri ? "transparent" : colors.card,
                borderColor: imageUri ? colors.primary : colors.border,
              },
            ]}
          >
            {imageUri ? (
              <View style={styles.imagePreviewWrap}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
                <View style={[styles.imageOverlay, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
                  <Feather name="check-circle" size={28} color="#00FF88" />
                  <Text style={[styles.imageOverlayText, { color: "#FFFFFF" }]}>Image Uploaded</Text>
                  <Text style={[styles.imageTapChange, { color: colors.mutedForeground }]}>Tap to change</Text>
                </View>
              </View>
            ) : (
              <View style={styles.uploadContent}>
                <View style={[styles.uploadIcon, { backgroundColor: "rgba(0,229,255,0.12)" }]}>
                  <Feather name="upload-cloud" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Upload Gift Card</Text>
                <Text style={[styles.uploadHint, { color: colors.mutedForeground }]}>
                  Tap to select photo of card or code
                </Text>
                <Text style={[styles.uploadFormats, { color: colors.mutedForeground }]}>
                  JPG, PNG supported
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Transaction summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Transaction Summary</Text>
          {[
            { label: "Card Type", value: cardInfo?.name || "-" },
            { label: "Card Value", value: numAmount > 0 ? `${currency} ${numAmount}` : "-" },
            { label: "Exchange Rate", value: `₦${rate}/${currency}` },
            { label: "Payout", value: numAmount > 0 ? `₦${payout.toLocaleString()}` : "-", highlight: true },
            { label: "Processing Fee", value: "Free" },
            { label: "Credit Time", value: "< 5 minutes" },
          ].map((row) => (
            <View key={row.label} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.summaryValue, { color: row.highlight ? "#00FF88" : colors.foreground }]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Submit button */}
        <GlowButton
          testID="sell-now-button"
          title="Sell Now"
          onPress={handleSubmit}
          loading={loading}
          disabled={!amount || numAmount <= 0}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  content: { padding: 20, gap: 4 },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  currencyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  currencyText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  dropdown: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  payoutCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  payoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payoutLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  payoutAmount: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  payoutRate: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  uploadArea: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    overflow: "hidden",
    minHeight: 150,
  },
  uploadContent: {
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  uploadTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  uploadHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  uploadFormats: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  imagePreviewWrap: {
    height: 200,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  imageOverlayText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  imageTapChange: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  summaryCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 0,
  },
  summaryTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  summaryValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
