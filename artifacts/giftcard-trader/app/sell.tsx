import React, { useState, useCallback, useMemo } from "react";
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
import { hapticLight, hapticSuccess, hapticError, hapticSelection } from "@/utils/haptics";
import { CardTypeSelector, CARD_TYPES } from "@/components/CardTypeSelector";
import { GlowButton } from "@/components/GlowButton";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useLivePrices } from "@/hooks/useLivePrices";

type SellMode = "gift_card" | "crypto";

type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AUD";

const CURRENCIES: Currency[] = ["USD", "GBP", "EUR", "CAD", "AUD"];

export default function SellScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { assets, updateNgnBalance, updateUsdBalance, updateAsset, addTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const { prices } = useLivePrices();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [mode, setMode] = useState<SellMode>("gift_card");

  const [selectedCard, setSelectedCard] = useState("amazon");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedCrypto, setSelectedCrypto] = useState<string>("btc");
  const [cryptoAmount, setCryptoAmount] = useState("");

  const cardInfo = CARD_TYPES.find((c) => c.id === selectedCard);
  const rate = cardInfo?.rate || 750;
  const numAmount = parseFloat(amount) || 0;
  const payout = numAmount * rate;

  const cryptoAssets = useMemo(() => assets.filter((a) => a.type === "crypto" && a.symbol !== "USDT"), [assets]);
  const selectedCryptoAsset = cryptoAssets.find((a) => a.id === selectedCrypto) || cryptoAssets[0];
  const numCryptoAmount = parseFloat(cryptoAmount) || 0;
  const cryptoPrice = selectedCryptoAsset
    ? (prices[selectedCryptoAsset.symbol]?.price ?? (selectedCryptoAsset.balance > 0 ? selectedCryptoAsset.value / selectedCryptoAsset.balance : 0))
    : 0;
  const cryptoPayout = numCryptoAmount * cryptoPrice;
  const cryptoFee = cryptoPayout * 0.001;
  const cryptoNet = cryptoPayout - cryptoFee;

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

  const handleSellGiftCard = useCallback(async () => {
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

  const handleSellCrypto = useCallback(async () => {
    if (numCryptoAmount <= 0) {
      hapticError();
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    if (selectedCryptoAsset && numCryptoAmount > selectedCryptoAsset.balance) {
      hapticError();
      Alert.alert("Insufficient Balance", `You only have ${selectedCryptoAsset.balance} ${selectedCryptoAsset.symbol} available.`);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    updateUsdBalance(cryptoNet);
    if (selectedCryptoAsset) {
      updateAsset(selectedCryptoAsset.id, {
        balance: Math.max(0, selectedCryptoAsset.balance - numCryptoAmount),
        value: Math.max(0, selectedCryptoAsset.value - cryptoPayout),
      });
    }
    addTransaction({
      type: "crypto",
      category: "Crypto",
      title: `Sold ${selectedCryptoAsset?.symbol}`,
      amount: cryptoNet,
      currency: "USD",
      status: "success",
      date: "Just now",
      direction: "in",
    });
    addNotification({
      title: "Instant Sell Complete",
      message: `Sold ${numCryptoAmount} ${selectedCryptoAsset?.symbol} for $${cryptoNet.toFixed(2)}.`,
      type: "success",
      time: "Just now",
    });
    hapticSuccess();
    Alert.alert(
      "Sold Instantly!",
      `${numCryptoAmount} ${selectedCryptoAsset?.symbol} sold for $${cryptoNet.toFixed(2)} (credited to USD wallet).`,
      [{ text: "Done", onPress: () => router.back() }]
    );
  }, [numCryptoAmount, selectedCryptoAsset, cryptoNet, cryptoPayout, updateUsdBalance, updateAsset, addTransaction, addNotification]);

  const quickPercentages = [25, 50, 75, 100];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 12, paddingBottom: bottomPad + 40 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Quick Sell</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.modeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {([
            { key: "gift_card" as SellMode, label: "Gift Cards", icon: "gift" },
            { key: "crypto" as SellMode, label: "Crypto", icon: "trending-down" },
          ]).map((m) => (
            <TouchableOpacity
              key={m.key}
              activeOpacity={0.8}
              onPress={() => { hapticSelection(); setMode(m.key); }}
              style={[
                styles.modeBtn,
                mode === m.key && { backgroundColor: "rgba(0,229,255,0.15)" },
              ]}
            >
              <Feather name={m.icon as any} size={16} color={mode === m.key ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.modeBtnText, { color: mode === m.key ? colors.primary : colors.mutedForeground }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === "gift_card" && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Select Card Type</Text>
            <CardTypeSelector selected={selectedCard} onSelect={setSelectedCard} />

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Currency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.currRow}>
              {CURRENCIES.map((cur) => (
                <TouchableOpacity
                  key={cur}
                  onPress={() => setCurrency(cur)}
                  activeOpacity={0.8}
                  style={[
                    styles.currBtn,
                    {
                      backgroundColor: currency === cur ? colors.primary : colors.card,
                      borderColor: currency === cur ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.currBtnText, { color: currency === cur ? colors.primaryForeground : colors.mutedForeground }]}>
                    {cur}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Card Amount ({currency})</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="e.g. 100"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
            />

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Upload Card Image</Text>
            <TouchableOpacity
              onPress={handleImagePick}
              activeOpacity={0.8}
              style={[styles.uploadBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.uploadImage} />
              ) : (
                <>
                  <Feather name="camera" size={28} color={colors.mutedForeground} />
                  <Text style={[styles.uploadText, { color: colors.mutedForeground }]}>Tap to upload</Text>
                </>
              )}
            </TouchableOpacity>

            {numAmount > 0 && (
              <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Card</Text>
                  <Text style={[styles.summaryValue, { color: colors.foreground }]}>{cardInfo?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Amount</Text>
                  <Text style={[styles.summaryValue, { color: colors.foreground }]}>{currency} {numAmount}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Rate</Text>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>₦{rate.toLocaleString()}/{currency}</Text>
                </View>
                <View style={[styles.summaryDivider, { borderColor: colors.border }]} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>You Receive</Text>
                  <Text style={[styles.summaryValue, { color: "#00FF88", fontFamily: "Inter_700Bold", fontSize: 18 }]}>₦{payout.toLocaleString()}</Text>
                </View>
              </View>
            )}

            <GlowButton title={loading ? "Processing..." : "Sell Gift Card"} onPress={handleSellGiftCard} disabled={loading} />
          </>
        )}

        {mode === "crypto" && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Select Asset to Sell</Text>
            <View style={styles.cryptoGrid}>
              {cryptoAssets.map((asset) => (
                <TouchableOpacity
                  key={asset.id}
                  activeOpacity={0.8}
                  onPress={() => { hapticLight(); setSelectedCrypto(asset.id); setCryptoAmount(""); }}
                  style={[
                    styles.cryptoCard,
                    {
                      backgroundColor: selectedCrypto === asset.id ? `${asset.color}15` : colors.card,
                      borderColor: selectedCrypto === asset.id ? asset.color : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.cryptoIcon, { backgroundColor: `${asset.color}22` }]}>
                    <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: asset.color }}>{asset.icon}</Text>
                  </View>
                  <Text style={[styles.cryptoName, { color: colors.foreground }]}>{asset.symbol}</Text>
                  <Text style={[styles.cryptoBal, { color: colors.mutedForeground }]}>{asset.balance}</Text>
                  <Text style={[styles.cryptoVal, { color: colors.primary }]}>${asset.value.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedCryptoAsset && (
              <>
                <View style={[styles.priceBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.priceBarLabel, { color: colors.mutedForeground }]}>Current Price</Text>
                  <Text style={[styles.priceBarValue, { color: colors.foreground }]}>
                    1 {selectedCryptoAsset.symbol} = ${cryptoPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>

                <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Amount ({selectedCryptoAsset.symbol})</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
                  value={cryptoAmount}
                  onChangeText={setCryptoAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="decimal-pad"
                />

                <View style={styles.quickPercentRow}>
                  {quickPercentages.map((pct) => (
                    <TouchableOpacity
                      key={pct}
                      activeOpacity={0.8}
                      onPress={() => {
                        hapticLight();
                        const qty = (selectedCryptoAsset.balance * pct) / 100;
                        setCryptoAmount(qty.toFixed(6));
                      }}
                      style={[styles.quickPctBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <Text style={[styles.quickPctText, { color: colors.primary }]}>{pct}%</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {numCryptoAmount > 0 && (
                  <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Selling</Text>
                      <Text style={[styles.summaryValue, { color: colors.foreground }]}>{numCryptoAmount} {selectedCryptoAsset.symbol}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Price</Text>
                      <Text style={[styles.summaryValue, { color: colors.foreground }]}>${cryptoPrice.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
                      <Text style={[styles.summaryValue, { color: colors.foreground }]}>${cryptoPayout.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Fee (0.1%)</Text>
                      <Text style={[styles.summaryValue, { color: colors.mutedForeground }]}>-${cryptoFee.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryDivider, { borderColor: colors.border }]} />
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>You Receive</Text>
                      <Text style={[styles.summaryValue, { color: "#00FF88", fontFamily: "Inter_700Bold", fontSize: 18 }]}>${cryptoNet.toFixed(2)}</Text>
                    </View>
                  </View>
                )}

                <GlowButton
                  title={loading ? "Processing..." : `Sell ${selectedCryptoAsset.symbol} Instantly`}
                  onPress={handleSellCrypto}
                  disabled={loading}
                />

                <View style={[styles.instantNote, { backgroundColor: "rgba(0,255,136,0.08)", borderColor: "#00FF8830" }]}>
                  <Feather name="zap" size={14} color="#00FF88" />
                  <Text style={[styles.instantNoteText, { color: "#00FF88" }]}>
                    Instant sell — funds credited to your USD wallet immediately.
                  </Text>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },

  modeToggle: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 4, gap: 4, marginBottom: 20 },
  modeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, paddingVertical: 12 },
  modeBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  sectionLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10, marginTop: 6 },

  currRow: { gap: 8, marginBottom: 8 },
  currBtn: { borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9, borderWidth: 1 },
  currBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  input: {
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 18, fontFamily: "Inter_600SemiBold", marginBottom: 14,
  },

  uploadBox: {
    borderRadius: 14, borderWidth: 1, borderStyle: "dashed",
    height: 120, alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14, overflow: "hidden",
  },
  uploadText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  uploadImage: { width: "100%", height: "100%", resizeMode: "cover" },

  summaryBox: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10, marginBottom: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  summaryDivider: { borderTopWidth: 1, marginVertical: 4 },

  cryptoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  cryptoCard: {
    width: "47%", borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 6,
  },
  cryptoIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cryptoName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  cryptoBal: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cryptoVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  priceBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14,
  },
  priceBarLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  priceBarValue: { fontSize: 15, fontFamily: "Inter_700Bold" },

  quickPercentRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  quickPctBtn: { flex: 1, borderRadius: 8, borderWidth: 1, paddingVertical: 10, alignItems: "center" },
  quickPctText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  instantNote: {
    flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 12,
  },
  instantNoteText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 18 },
});
