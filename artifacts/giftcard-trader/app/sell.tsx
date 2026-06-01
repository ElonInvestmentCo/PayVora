import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, Platform, Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { hapticLight, hapticSuccess, hapticError, hapticSelection } from "@/utils/haptics";
import { CardTypeSelector, CARD_TYPES } from "@/components/CardTypeSelector";
import { GlowButton } from "@/components/GlowButton";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useLivePrices } from "@/hooks/useLivePrices";
import Svg, { Path } from "react-native-svg";

type SellMode = "gift_card" | "crypto";
type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AUD";

const CURRENCIES: Currency[] = ["USD", "GBP", "EUR", "CAD", "AUD"];

function ArrowLeft() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 5l-7 7 7 7" stroke="#1C1C1E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function SellScreen() {
  const insets = useSafeAreaInsets();
  const { assets, updateNgnBalance, updateUsdBalance, updateAsset, addTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const { prices } = useLivePrices();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [mode, setMode] = useState<SellMode>("gift_card");

  // Gift card state
  const [selectedCard, setSelectedCard] = useState("amazon");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Crypto state
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
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  }, []);

  const handleSellGiftCard = useCallback(async () => {
    if (!amount || numAmount <= 0) { hapticError(); Alert.alert("Error", "Please enter a valid card amount."); return; }
    if (!imageUri) { hapticError(); Alert.alert("Error", "Please upload your gift card image."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    updateNgnBalance(payout);
    addTransaction({ type: "gift_card", category: "Gift Cards", title: `${cardInfo?.name} Gift Card Sold`, amount: payout, currency: "NGN", status: "success", date: "Just now", direction: "in" });
    addNotification({ title: "Trade Completed", message: `Your ${cardInfo?.name} card trade for ${currency}${numAmount} completed. ₦${payout.toLocaleString()} credited.`, type: "success", time: "Just now" });
    hapticSuccess();
    Alert.alert("Trade Submitted!", `Your ${cardInfo?.name} card trade for ${currency}${numAmount} (₦${payout.toLocaleString()}) has been submitted.`, [{ text: "OK", onPress: () => router.back() }]);
  }, [amount, imageUri, numAmount, payout, cardInfo, currency, updateNgnBalance, addTransaction, addNotification]);

  const handleSellCrypto = useCallback(async () => {
    if (numCryptoAmount <= 0) { hapticError(); Alert.alert("Error", "Please enter a valid amount."); return; }
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
    addTransaction({ type: "crypto", category: "Crypto", title: `Sold ${selectedCryptoAsset?.symbol}`, amount: cryptoNet, currency: "USD", status: "success", date: "Just now", direction: "in" });
    addNotification({ title: "Instant Sell Complete", message: `Sold ${numCryptoAmount} ${selectedCryptoAsset?.symbol} for $${cryptoNet.toFixed(2)}.`, type: "success", time: "Just now" });
    hapticSuccess();
    Alert.alert("Sold!", `${numCryptoAmount} ${selectedCryptoAsset?.symbol} sold for $${cryptoNet.toFixed(2)}`, [{ text: "Done", onPress: () => router.back() }]);
  }, [numCryptoAmount, selectedCryptoAsset, cryptoNet, cryptoPayout, updateUsdBalance, updateAsset, addTransaction, addNotification]);

  return (
    <View style={[s.root, { paddingTop: topPad }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: bottomPad + 60 }]} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.backBtn}>
            <ArrowLeft />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Quick Sell</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Mode Toggle */}
        <View style={s.section}>
          <View style={s.modeToggle}>
            {([
              { key: "gift_card" as SellMode, label: "Gift Cards" },
              { key: "crypto" as SellMode, label: "Crypto" },
            ]).map((m) => (
              <TouchableOpacity
                key={m.key}
                activeOpacity={0.8}
                onPress={() => { hapticSelection(); setMode(m.key); }}
                style={[s.modeBtn, mode === m.key && s.modeBtnActive]}
              >
                <Text style={[s.modeBtnTxt, mode === m.key && s.modeBtnTxtActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Gift Card Mode ── */}
        {mode === "gift_card" && (
          <>
            <View style={s.section}>
              <Text style={s.sectionTitle}>Select Card Type</Text>
              <CardTypeSelector selected={selectedCard} onSelect={setSelectedCard} />
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>Currency</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.currRow}>
                {CURRENCIES.map((cur) => (
                  <TouchableOpacity
                    key={cur}
                    onPress={() => setCurrency(cur)}
                    activeOpacity={0.8}
                    style={[s.currBtn, currency === cur && s.currBtnActive]}
                  >
                    <Text style={[s.currBtnTxt, currency === cur && s.currBtnTxtActive]}>{cur}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>Card Amount ({currency})</Text>
              <View style={s.card}>
                <View style={s.inputRow}>
                  <Text style={s.inputPrefix}>{currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : currency === "CAD" ? "CA$" : "A$"}</Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#8E8E93"
                    keyboardType="decimal-pad"
                    style={s.input}
                  />
                </View>
              </View>
            </View>

            <View style={s.section}>
              <Text style={s.sectionTitle}>Upload Card Image</Text>
              <TouchableOpacity onPress={handleImagePick} activeOpacity={0.8} style={s.uploadBox}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={s.uploadPreview} />
                ) : (
                  <>
                    <Text style={s.uploadEmoji}>📷</Text>
                    <Text style={s.uploadTxt}>Tap to upload card image</Text>
                    <Text style={s.uploadSub}>JPG or PNG · Max 5MB</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {numAmount > 0 && (
              <View style={s.section}>
                <View style={s.card}>
                  {[
                    { label: "Card", value: cardInfo?.name },
                    { label: "Amount", value: `${currency} ${numAmount}` },
                    { label: "Rate", value: `₦${rate.toLocaleString()}/${currency}` },
                  ].map((row, i, arr) => (
                    <View key={row.label} style={[s.summaryRow, i < arr.length - 1 && s.summaryRowBorder]}>
                      <Text style={s.summaryLabel}>{row.label}</Text>
                      <Text style={s.summaryValue}>{row.value}</Text>
                    </View>
                  ))}
                  <View style={[s.summaryRow, { backgroundColor: "#F0FDF4", borderRadius: 12, margin: 4, marginTop: 0 }]}>
                    <Text style={[s.summaryLabel, { fontFamily: "Inter_600SemiBold", color: "#1C1C1E" }]}>You Receive</Text>
                    <Text style={[s.summaryValue, { color: "#30D158", fontSize: 18, fontFamily: "Inter_700Bold" }]}>₦{payout.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={s.section}>
              <GlowButton title={loading ? "Processing..." : "Sell Gift Card"} onPress={handleSellGiftCard} disabled={loading} />
            </View>
          </>
        )}

        {/* ── Crypto Mode ── */}
        {mode === "crypto" && (
          <>
            <View style={s.section}>
              <Text style={s.sectionTitle}>Select Asset to Sell</Text>
              <View style={s.cryptoGrid}>
                {cryptoAssets.map((asset) => {
                  const isSelected = selectedCrypto === asset.id;
                  return (
                    <TouchableOpacity
                      key={asset.id}
                      activeOpacity={0.8}
                      onPress={() => { hapticLight(); setSelectedCrypto(asset.id); setCryptoAmount(""); }}
                      style={[s.cryptoCard, isSelected && { borderColor: asset.color, backgroundColor: asset.color + "10" }]}
                    >
                      <View style={[s.cryptoIconCircle, { backgroundColor: asset.color + "20" }]}>
                        <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: asset.color }}>{asset.symbol[0]}</Text>
                      </View>
                      <Text style={[s.cryptoSym, isSelected && { color: asset.color }]}>{asset.symbol}</Text>
                      <Text style={s.cryptoBal}>{asset.balance.toFixed(4)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {selectedCryptoAsset && (
              <View style={s.section}>
                <View style={s.card}>
                  <View style={s.pricePill}>
                    <Text style={s.pricePillLbl}>{selectedCryptoAsset.symbol} Price</Text>
                    <Text style={s.pricePillVal}>${cryptoPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
                  </View>

                  <View style={[s.inputRow, { margin: 16, marginTop: 8, backgroundColor: "#F2F2F7", borderRadius: 14 }]}>
                    <TextInput
                      value={cryptoAmount}
                      onChangeText={setCryptoAmount}
                      placeholder="0.000000"
                      placeholderTextColor="#8E8E93"
                      keyboardType="decimal-pad"
                      style={[s.input, { paddingLeft: 0 }]}
                    />
                    <Text style={s.inputSuffix}>{selectedCryptoAsset.symbol}</Text>
                  </View>

                  {/* Quick % buttons */}
                  <View style={s.pctRow}>
                    {[25, 50, 75, 100].map((pct) => (
                      <TouchableOpacity
                        key={pct}
                        onPress={() => {
                          const v = (selectedCryptoAsset.balance * pct / 100).toFixed(6);
                          setCryptoAmount(v);
                        }}
                        activeOpacity={0.8}
                        style={s.pctBtn}
                      >
                        <Text style={s.pctBtnTxt}>{pct === 100 ? "Max" : `${pct}%`}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Fee Breakdown */}
                  <View style={s.feeSection}>
                    {[
                      { label: "Gross Payout", value: `$${cryptoPayout.toFixed(2)}` },
                      { label: "Fee (0.1%)", value: `-$${cryptoFee.toFixed(2)}` },
                      { label: "Net Payout", value: `$${cryptoNet.toFixed(2)}`, highlight: true },
                    ].map((row, i, arr) => (
                      <View key={row.label} style={[s.feeRow, i < arr.length - 1 && s.feeRowBorder]}>
                        <Text style={s.feeLbl}>{row.label}</Text>
                        <Text style={[s.feeVal, (row as any).highlight && { color: "#30D158", fontFamily: "Inter_700Bold" }]}>{row.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            <View style={s.section}>
              <GlowButton title={loading ? "Processing..." : "Instant Sell"} onPress={handleSellCrypto} disabled={loading} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: {},

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1C1C1E", letterSpacing: -0.3 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },

  section: { paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },

  modeToggle: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 4, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  modeBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: "center" },
  modeBtnActive: { backgroundColor: "#1A5AFF" },
  modeBtnTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  modeBtnTxtActive: { color: "#FFFFFF" },

  currRow: { gap: 8, paddingBottom: 4 },
  currBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  currBtnActive: { backgroundColor: "#1A5AFF" },
  currBtnTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  currBtnTxtActive: { color: "#FFFFFF" },

  card: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  inputPrefix: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#8E8E93", marginRight: 8 },
  inputSuffix: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#8E8E93", marginLeft: 8, paddingRight: 8 },
  input: { flex: 1, fontSize: 26, fontFamily: "Inter_700Bold", color: "#1C1C1E", paddingVertical: 10 },

  uploadBox: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 32, alignItems: "center", borderWidth: 2, borderColor: "#E5E5EA", borderStyle: "dashed", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  uploadPreview: { width: "100%", height: 160, borderRadius: 12, resizeMode: "cover" },
  uploadEmoji: { fontSize: 32, marginBottom: 8 },
  uploadTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 4 },
  uploadSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93" },

  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13 },
  summaryRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  summaryValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },

  cryptoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cryptoCard: { width: "30%", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, alignItems: "center", gap: 4, borderWidth: 1.5, borderColor: "transparent", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cryptoIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  cryptoSym: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  cryptoBal: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#8E8E93" },

  pricePill: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, paddingBottom: 8 },
  pricePillLbl: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8E8E93" },
  pricePillVal: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1C1C1E" },

  pctRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  pctBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: "#F2F2F7", alignItems: "center" },
  pctBtnTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },

  feeSection: { marginHorizontal: 16, backgroundColor: "#F2F2F7", borderRadius: 12, marginBottom: 16 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 11 },
  feeRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  feeLbl: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  feeVal: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
});
