import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, Platform, Image, ActivityIndicator,
} from "react-native";
import { FocusedModal } from "@/components/FocusedModal";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hapticSuccess, hapticError, hapticLight } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import Svg, { Path } from "react-native-svg";

type CryptoId = "btc" | "eth" | "usdt" | "sol" | "xrp" | "bnb";
type PaymentMethod = "wallet" | "card" | "bank";

const CRYPTOS = [
  { id: "btc",  name: "Bitcoin",  symbol: "BTC",  price: 45000, change: 2.4,  color: "#F7931A" },
  { id: "eth",  name: "Ethereum", symbol: "ETH",  price: 2850,  change: -1.2, color: "#627EEA" },
  { id: "usdt", name: "Tether",   symbol: "USDT", price: 1.0,   change: 0.01, color: "#26A17B" },
  { id: "sol",  name: "Solana",   symbol: "SOL",  price: 142,   change: 5.8,  color: "#9945FF" },
  { id: "xrp",  name: "Ripple",   symbol: "XRP",  price: 0.62,  change: -0.5, color: "#23292F" },
  { id: "bnb",  name: "BNB",      symbol: "BNB",  price: 312,   change: 1.1,  color: "#F3BA2F" },
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; detail: string }[] = [
  { id: "wallet", label: "USD Wallet",          detail: "Available balance" },
  { id: "card",   label: "Debit / Credit Card", detail: "Visa ending 4242" },
  { id: "bank",   label: "Bank Transfer",        detail: "Chase ••• 8891" },
];

const CHART_DATA = [32, 35, 33, 38, 36, 40, 37, 42, 39, 44, 41, 46, 43, 48, 45, 50, 47, 52, 49, 54];
const PRESETS = [50, 100, 250, 500, 1000];

function CryptoIcon({ symbol, size = 32 }: { symbol: string; size?: number }) {
  const [err, setErr] = useState(false);
  const colorMap: Record<string, string> = { BTC: "#F7931A", ETH: "#627EEA", USDT: "#26A17B", SOL: "#9945FF", XRP: "#23292F", BNB: "#F3BA2F" };
  const color = colorMap[symbol] ?? "#888";
  if (err) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + "22", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color, fontFamily: "Inter_700Bold", fontSize: size * 0.42 }}>{symbol[0]}</Text>
      </View>
    );
  }
  return (
    <Image source={{ uri: `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/200` }} style={{ width: size, height: size, borderRadius: size / 2 }} onError={() => setErr(true)} />
  );
}

function MiniChart() {
  const max = Math.max(...CHART_DATA), min = Math.min(...CHART_DATA), range = max - min || 1;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 52 }}>
      {CHART_DATA.map((v, i) => {
        const pct = (v - min) / range;
        const isLast = i === CHART_DATA.length - 1;
        return (
          <View key={i} style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={{ height: 8 + pct * 40, backgroundColor: isLast ? "#30D158" : `rgba(48,209,88,${0.2 + pct * 0.5})`, borderRadius: 2 }} />
          </View>
        );
      })}
    </View>
  );
}

export default function BuyCryptoScreen() {
  const insets = useSafeAreaInsets();
  const { usdBalance, updateUsdBalance, addTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedCrypto, setSelectedCrypto] = useState<CryptoId>("btc");
  const [fiatAmount, setFiatAmount] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("wallet");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const crypto = CRYPTOS.find((c) => c.id === selectedCrypto)!;
  const numFiat = parseFloat(fiatAmount) || 0;
  const cryptoAmount = numFiat / crypto.price;
  const serviceFee = numFiat * 0.005;
  const networkFee = numFiat > 0 ? 1.5 : 0;
  const totalCost = numFiat + serviceFee + networkFee;
  const isValid = numFiat >= 1;

  const handleConfirm = useCallback(async () => {
    if (payment === "wallet" && totalCost > usdBalance) {
      hapticError();
      Alert.alert("Insufficient Balance", "You don't have enough USD in your wallet.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setModalVisible(false);
    if (payment === "wallet") updateUsdBalance(-totalCost);
    addTransaction({ type: "crypto", category: "Crypto", title: `${crypto.name} Purchase`, amount: totalCost, currency: "USD", status: "success", date: "Just now", direction: "out" });
    addNotification({ title: "Crypto Purchased", message: `Bought ${cryptoAmount.toFixed(8)} ${crypto.symbol} for $${totalCost.toFixed(2)}.`, type: "success", time: "Just now" });
    hapticSuccess();
    Alert.alert("Purchase Complete!", `You bought ${cryptoAmount.toFixed(8)} ${crypto.symbol} for $${totalCost.toFixed(2)}`, [{ text: "Done", onPress: () => router.back() }]);
  }, [cryptoAmount, crypto, totalCost, payment, usdBalance, updateUsdBalance, addTransaction, addNotification]);

  const summaryRows = useMemo(() => [
    { label: "Asset",        value: `${crypto.name} (${crypto.symbol})` },
    { label: "Market Price", value: `$${crypto.price.toLocaleString()}` },
    { label: "You Spend",    value: `$${numFiat.toFixed(2)}` },
    { label: "You Receive",  value: `${cryptoAmount.toFixed(8)} ${crypto.symbol}`, highlight: true },
    { label: "Service Fee",  value: `-$${serviceFee.toFixed(2)}`, warn: true },
    { label: "Network Fee",  value: `-$${networkFee.toFixed(2)}`, warn: true },
    { label: "Total Cost",   value: `$${totalCost.toFixed(2)}`, accent: true },
  ], [crypto, numFiat, cryptoAmount, serviceFee, networkFee, totalCost]);

  return (
    <View style={[s.root, { paddingTop: topPad }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.headerBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 5l-7 7 7 7" stroke="#1C1C1E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Buy Crypto</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: botPad + 80 }]} keyboardShouldPersistTaps="handled">

        {/* Balance */}
        <View style={s.section}>
          <View style={s.balancePill}>
            <View style={s.balanceDot} />
            <Text style={s.balanceLbl}>USD Wallet</Text>
            <Text style={s.balanceAmt}>${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {/* Price Widget */}
        <View style={s.section}>
          <View style={s.priceCard}>
            <View>
              <Text style={s.priceLbl}>{crypto.symbol} / USD</Text>
              <Text style={s.priceVal}>${crypto.price.toLocaleString()}</Text>
              <View style={[s.changeBadge, { backgroundColor: crypto.change >= 0 ? "#F0FDF4" : "#FFF2F2" }]}>
                <Text style={[s.changeTxt, { color: crypto.change >= 0 ? "#30D158" : "#FF3B30" }]}>
                  {crypto.change >= 0 ? "+" : ""}{crypto.change}%
                </Text>
              </View>
            </View>
            <View style={{ flex: 1, maxWidth: 140 }}>
              <MiniChart />
            </View>
          </View>
        </View>

        {/* Asset Selector */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Select Asset</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {CRYPTOS.map((c) => {
              const active = c.id === selectedCrypto;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => { hapticLight(); setSelectedCrypto(c.id as CryptoId); setFiatAmount(""); }}
                  activeOpacity={0.8}
                  style={[s.chip, active && { backgroundColor: "#EEF3FF", borderColor: "#1A5AFF", borderWidth: 1.5 }]}
                >
                  <CryptoIcon symbol={c.symbol} size={24} />
                  <Text style={[s.chipTxt, active && { color: "#1A5AFF" }]}>{c.symbol}</Text>
                  {active && <Text style={{ color: "#1A5AFF", fontSize: 10 }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Amount */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Amount (USD)</Text>
          <View style={s.card}>
            <View style={s.amtRow}>
              <Text style={s.amtPrefix}>$</Text>
              <TextInput
                value={fiatAmount}
                onChangeText={setFiatAmount}
                placeholder="0.00"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                style={s.amtInput}
              />
            </View>
            {numFiat > 0 && (
              <Text style={s.cryptoEquiv}>≈ {cryptoAmount.toFixed(8)} {crypto.symbol}</Text>
            )}
            {numFiat > 0 && numFiat < 1 && (
              <Text style={s.errorTxt}>Minimum purchase is $1.00</Text>
            )}
            <View style={s.presetRow}>
              {PRESETS.map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => { hapticLight(); setFiatAmount(String(v)); }}
                  activeOpacity={0.8}
                  style={[s.presetBtn, numFiat === v && s.presetBtnActive]}
                >
                  <Text style={[s.presetTxt, numFiat === v && s.presetTxtActive]}>${v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Payment Method</Text>
          <View style={s.card}>
            {PAYMENT_METHODS.map((pm, i) => (
              <TouchableOpacity
                key={pm.id}
                onPress={() => { hapticLight(); setPayment(pm.id); }}
                activeOpacity={0.8}
                style={[s.payRow, i < PAYMENT_METHODS.length - 1 && s.payRowBorder]}
              >
                <View style={s.payIcon}>
                  <Text style={{ fontSize: 18 }}>{pm.id === "wallet" ? "💳" : pm.id === "card" ? "🏧" : "🏦"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.payLabel}>{pm.label}</Text>
                  <Text style={s.payDetail}>{pm.id === "wallet" ? `$${usdBalance.toFixed(2)} available` : pm.detail}</Text>
                </View>
                <View style={[s.radio, payment === pm.id && s.radioActive]}>
                  {payment === pm.id && <View style={s.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Confirm Button */}
        <View style={s.section}>
          <TouchableOpacity
            onPress={() => { if (isValid) { hapticLight(); setModalVisible(true); } }}
            activeOpacity={0.85}
            style={[s.confirmBtn, !isValid && { opacity: 0.4 }]}
          >
            <Text style={s.confirmBtnTxt}>Review Order</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Confirm Modal */}
      <FocusedModal visible={modalVisible} onRequestClose={() => setModalVisible(false)} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Confirm Purchase</Text>
            <View style={s.modalBody}>
              {summaryRows.map((row, i, arr) => (
                <View key={row.label} style={[s.modalRow, i < arr.length - 1 && s.modalRowBorder]}>
                  <Text style={s.modalLabel}>{row.label}</Text>
                  <Text style={[
                    s.modalValue,
                    (row as any).highlight && { color: "#30D158", fontFamily: "Inter_700Bold" },
                    (row as any).warn && { color: "#FF9F0A" },
                    (row as any).accent && { color: "#1A5AFF", fontFamily: "Inter_700Bold" },
                  ]}>{row.value}</Text>
                </View>
              ))}
            </View>
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.8} style={s.modalCancelBtn}>
                <Text style={s.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85} disabled={loading} style={[s.modalConfirmBtn, loading && { opacity: 0.65 }]}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.modalConfirmTxt}>Confirm Buy</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </FocusedModal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: {},
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1C1C1E", letterSpacing: -0.3 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  section: { paddingHorizontal: 16, marginBottom: 14 },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  balancePill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  balanceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#30D158" },
  balanceLbl: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: "#8E8E93" },
  balanceAmt: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  priceCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  priceLbl: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#8E8E93", marginBottom: 2 },
  priceVal: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#1C1C1E", marginBottom: 6, letterSpacing: -0.5 },
  changeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  changeTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  chipRow: { gap: 8, paddingBottom: 4 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "transparent", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  chipTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  amtRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16 },
  amtPrefix: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#8E8E93", marginRight: 6 },
  amtInput: { flex: 1, fontSize: 28, fontFamily: "Inter_700Bold", color: "#1C1C1E", paddingVertical: 10 },
  cryptoEquiv: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93", paddingHorizontal: 16, paddingBottom: 6 },
  errorTxt: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#FF3B30", paddingHorizontal: 16, marginBottom: 4 },
  presetRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  presetBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: "#F2F2F7", alignItems: "center" },
  presetBtnActive: { backgroundColor: "#1A5AFF" },
  presetTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  presetTxtActive: { color: "#FFFFFF" },
  payRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  payRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  payIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F2F2F7", alignItems: "center", justifyContent: "center" },
  payLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 2 },
  payDetail: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#C7C7CC", alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: "#1A5AFF" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#1A5AFF" },
  confirmBtn: { backgroundColor: "#1A5AFF", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  confirmBtnTxt: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1C1C1E", textAlign: "center", marginBottom: 20, letterSpacing: -0.3 },
  modalBody: { backgroundColor: "#F2F2F7", borderRadius: 16, marginBottom: 20, overflow: "hidden" },
  modalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 },
  modalRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  modalLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  modalValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  modalActions: { flexDirection: "row", gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, backgroundColor: "#F2F2F7", alignItems: "center" },
  modalCancelTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  modalConfirmBtn: { flex: 2, paddingVertical: 15, borderRadius: 14, backgroundColor: "#1A5AFF", alignItems: "center" },
  modalConfirmTxt: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
});
