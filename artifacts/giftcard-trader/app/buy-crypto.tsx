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
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { FocusedModal } from "@/components/FocusedModal";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { hapticSuccess, hapticError } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

const C = {
  bg: "#FFFFFF",
  surface: "#F7F7F7",
  fg: "#1C1C1E",
  muted: "#8E8E93",
  accent: "#1A5AFF",
  success: "#00C48C",
  error: "#FF3B30",
  border: "#E5E5EA",
  warn: "#FF9500",
};

type CryptoId = "btc" | "eth" | "usdt" | "sol" | "xrp" | "bnb";
type PaymentMethod = "wallet" | "card" | "bank";

interface Crypto {
  id: CryptoId;
  name: string;
  symbol: string;
  price: number;
  change: number;
  color: string;
}

const CRYPTOS: Crypto[] = [
  { id: "btc",  name: "Bitcoin",  symbol: "BTC",  price: 45000, change: 2.4,  color: "#F7931A" },
  { id: "eth",  name: "Ethereum", symbol: "ETH",  price: 2850,  change: -1.2, color: "#627EEA" },
  { id: "usdt", name: "Tether",   symbol: "USDT", price: 1.0,   change: 0.01, color: "#26A17B" },
  { id: "sol",  name: "Solana",   symbol: "SOL",  price: 142,   change: 5.8,  color: "#9945FF" },
  { id: "xrp",  name: "Ripple",   symbol: "XRP",  price: 0.62,  change: -0.5, color: "#23292F" },
  { id: "bnb",  name: "BNB",      symbol: "BNB",  price: 312,   change: 1.1,  color: "#F3BA2F" },
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; detail: string }[] = [
  { id: "wallet", label: "USD Wallet",          icon: "credit-card", detail: "Available balance" },
  { id: "card",   label: "Debit / Credit Card", icon: "credit-card", detail: "Visa ending 4242" },
  { id: "bank",   label: "Bank Transfer",        icon: "briefcase",   detail: "Chase ••• 8891" },
];

const CHART_DATA = [32, 35, 33, 38, 36, 40, 37, 42, 39, 44, 41, 46, 43, 48, 45, 50, 47, 52, 49, 54];

function CryptoIcon({ symbol, size = 32 }: { symbol: string; size?: number }) {
  const [err, setErr] = useState(false);
  const colorMap: Record<string, string> = {
    BTC: "#F7931A", ETH: "#627EEA", USDT: "#26A17B",
    SOL: "#9945FF", XRP: "#23292F", BNB: "#F3BA2F",
  };
  const color = colorMap[symbol] ?? "#666666";

  if (err) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}22`, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color, fontFamily: "Inter_700Bold", fontSize: size * 0.42 }}>{symbol[0]}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/200` }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => setErr(true)}
    />
  );
}

function MiniChart() {
  const max = Math.max(...CHART_DATA);
  const min = Math.min(...CHART_DATA);
  const range = max - min || 1;
  return (
    <View style={chartStyles.wrap}>
      {CHART_DATA.map((v, i) => {
        const pct = (v - min) / range;
        const isLast = i === CHART_DATA.length - 1;
        return (
          <View key={i} style={chartStyles.col}>
            <View style={[chartStyles.bar, {
              height: 8 + pct * 52,
              backgroundColor: isLast ? C.success : `rgba(0,196,140,${0.2 + pct * 0.5})`,
            }]} />
          </View>
        );
      })}
    </View>
  );
}
const chartStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 64 },
  col: { flex: 1, justifyContent: "flex-end" },
  bar: { borderRadius: 2, minWidth: 4 },
});

const PRESETS = [50, 100, 250, 500, 1000];

function SolidButton({
  title, onPress, disabled, loading, testID,
}: {
  title: string; onPress: () => void; disabled?: boolean; loading?: boolean; testID?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      testID={testID}
      style={[solidBtn.base, (disabled || loading) && solidBtn.disabled]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={solidBtn.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
const solidBtn = StyleSheet.create({
  base: { height: 54, borderRadius: 14, backgroundColor: C.fg, alignItems: "center", justifyContent: "center", width: "100%" },
  text: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  disabled: { opacity: 0.35 },
});

export default function BuyCryptoScreen() {
  const insets = useSafeAreaInsets();
  const { usdBalance, updateUsdBalance, addTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

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

  const handlePreset = useCallback((v: number) => {
    setFiatAmount(String(v));
  }, []);

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
    addTransaction({
      type: "crypto", category: "Crypto",
      title: `${crypto.name} Purchase`,
      amount: totalCost, currency: "USD",
      status: "success", date: "Just now", direction: "out",
    });
    addNotification({
      title: "Crypto Purchased",
      message: `Bought ${cryptoAmount.toFixed(8)} ${crypto.symbol} for $${totalCost.toFixed(2)}.`,
      type: "success", time: "Just now",
    });
    hapticSuccess();
    Alert.alert(
      "Purchase Complete!",
      `You bought ${cryptoAmount.toFixed(8)} ${crypto.symbol} for $${totalCost.toFixed(2)}`,
      [{ text: "Done", onPress: () => router.back() }]
    );
  }, [cryptoAmount, crypto, totalCost, payment, usdBalance, updateUsdBalance, addTransaction, addNotification]);

  const summaryRows = useMemo(() => [
    { label: "Asset",        value: `${crypto.name} (${crypto.symbol})` },
    { label: "Market Price", value: `$${crypto.price.toLocaleString()}` },
    { label: "You Spend",    value: `$${numFiat.toFixed(2)}` },
    { label: "You Receive",  value: `${cryptoAmount.toFixed(8)} ${crypto.symbol}`, highlight: true },
    { label: "Service Fee",  value: `-$${serviceFee.toFixed(2)}`, warn: true },
    { label: "Network Fee",  value: `-$${networkFee.toFixed(2)}`, warn: true },
    { label: "Total Cost",   value: `$${totalCost.toFixed(2)}`, highlight: true },
  ], [crypto, numFiat, cryptoAmount, serviceFee, networkFee, totalCost]);

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: C.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: C.surface }]}
          activeOpacity={0.8}
          testID="back-button"
        >
          <Feather name="arrow-left" size={20} color={C.fg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Crypto</Text>
        <View style={[styles.iconBtn, { backgroundColor: C.surface }]}>
          <Feather name="activity" size={18} color={C.muted} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        <View style={[styles.balancePill, { backgroundColor: C.surface }]}>
          <View style={[styles.balanceDot, { backgroundColor: C.success }]} />
          <Text style={[styles.balanceLbl, { color: C.muted }]}>USD Wallet</Text>
          <Text style={[styles.balanceAmt, { color: C.fg }]}>${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        </View>

        <View style={[styles.priceWidget, { backgroundColor: C.surface }]}>
          <View style={styles.priceLeft}>
            <Text style={[styles.priceLbl, { color: C.muted }]}>{crypto.symbol} / USD</Text>
            <Text style={[styles.priceVal, { color: C.fg }]}>${crypto.price.toLocaleString()}</Text>
            <View style={[styles.changeBadge, { backgroundColor: crypto.change >= 0 ? "#EBF9F3" : "#FFF2F0" }]}>
              <Feather
                name={crypto.change >= 0 ? "trending-up" : "trending-down"}
                size={12}
                color={crypto.change >= 0 ? C.success : C.error}
              />
              <Text style={[styles.changeText, { color: crypto.change >= 0 ? C.success : C.error }]}>
                {crypto.change >= 0 ? "+" : ""}{crypto.change}%
              </Text>
            </View>
          </View>
          <View style={styles.chartArea}>
            <MiniChart />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.muted }]}>Select Asset</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CRYPTOS.map((c) => {
              const active = c.id === selectedCrypto;
              return (
                <TouchableOpacity
                  key={c.id}
                  testID={`crypto-${c.id}`}
                  onPress={() => { setSelectedCrypto(c.id); setFiatAmount(""); }}
                  activeOpacity={0.8}
                  style={[styles.chip, {
                    backgroundColor: active ? "#EBF0FF" : C.surface,
                    borderColor: active ? C.accent : "transparent",
                    borderWidth: active ? 1.5 : 0,
                  }]}
                >
                  <CryptoIcon symbol={c.symbol} size={26} />
                  <Text style={[styles.chipText, { color: active ? C.accent : C.fg }]}>{c.symbol}</Text>
                  {active && <Feather name="check" size={12} color={C.accent} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.muted }]}>Amount (USD)</Text>
          <View style={[styles.inputRow, {
            backgroundColor: C.surface,
            borderColor: !isValid && numFiat > 0 ? C.error : "transparent",
            borderWidth: !isValid && numFiat > 0 ? 1.5 : 0,
          }]}>
            <Text style={[styles.prefix, { color: C.accent }]}>$</Text>
            <TextInput
              testID="fiat-input"
              value={fiatAmount}
              onChangeText={setFiatAmount}
              placeholder="0.00"
              placeholderTextColor={C.muted}
              keyboardType="numeric"
              style={[styles.input, { color: C.fg }]}
            />
          </View>
          {numFiat > 0 && numFiat < 1 && (
            <Text style={[styles.errorText, { color: C.error }]}>Minimum purchase is $1.00</Text>
          )}

          <View style={styles.presets}>
            {PRESETS.map((v) => (
              <TouchableOpacity
                key={v}
                testID={`preset-${v}`}
                onPress={() => handlePreset(v)}
                activeOpacity={0.8}
                style={[styles.presetBtn, {
                  backgroundColor: numFiat === v ? "#EBF0FF" : C.surface,
                  borderColor: numFiat === v ? C.accent : "transparent",
                  borderWidth: numFiat === v ? 1.5 : 0,
                }]}
              >
                <Text style={[styles.presetText, { color: numFiat === v ? C.accent : C.muted }]}>${v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {numFiat > 0 && (
          <View style={[styles.equivCard, { backgroundColor: "#EBF9F3" }]}>
            <View style={styles.equivRow}>
              <Text style={[styles.equivLbl, { color: C.muted }]}>You Receive</Text>
              <Text style={[styles.equivVal, { color: C.success }]}>
                {cryptoAmount.toFixed(8)} {crypto.symbol}
              </Text>
            </View>
            <View style={styles.equivRow}>
              <Text style={[styles.equivLbl, { color: C.muted }]}>Rate</Text>
              <Text style={[styles.equivDetail, { color: C.fg }]}>
                ${crypto.price.toLocaleString()} / {crypto.symbol}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.muted }]}>Payment Method</Text>
          {PAYMENT_METHODS.map((pm) => {
            const active = pm.id === payment;
            return (
              <TouchableOpacity
                key={pm.id}
                testID={`payment-${pm.id}`}
                onPress={() => setPayment(pm.id)}
                activeOpacity={0.8}
                style={[styles.payItem, {
                  backgroundColor: active ? "#EBF0FF" : C.surface,
                  borderColor: active ? C.accent : "transparent",
                  borderWidth: active ? 1.5 : 0,
                }]}
              >
                <View style={[styles.payIcon, { backgroundColor: active ? "#D2DEFF" : C.bg }]}>
                  <Feather name={pm.icon as any} size={18} color={active ? C.accent : C.muted} />
                </View>
                <View style={styles.payInfo}>
                  <Text style={[styles.payLabel, { color: active ? C.accent : C.fg }]}>{pm.label}</Text>
                  <Text style={[styles.payDetail, { color: C.muted }]}>{pm.detail}</Text>
                </View>
                <View style={[styles.radioOuter, { borderColor: active ? C.accent : C.border }]}>
                  {active && <View style={[styles.radioInner, { backgroundColor: C.accent }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.feeCard, { backgroundColor: C.surface }]}>
          <Text style={[styles.feeTitle, { color: C.fg }]}>Fee Breakdown</Text>
          {[
            { label: "Service Fee (0.5%)", value: numFiat > 0 ? `$${serviceFee.toFixed(2)}` : "—" },
            { label: "Network Fee",        value: numFiat > 0 ? `$${networkFee.toFixed(2)}` : "—" },
            { label: "Total Fees",         value: numFiat > 0 ? `$${(serviceFee + networkFee).toFixed(2)}` : "—", highlight: true },
          ].map((row) => (
            <View key={row.label} style={[styles.feeRow, { borderBottomColor: C.border }]}>
              <Text style={[styles.feeLbl, { color: C.muted }]}>{row.label}</Text>
              <Text style={[styles.feeVal, { color: row.highlight ? C.warn : C.fg }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        <SolidButton
          testID="buy-now-button"
          title={`Buy ${crypto.symbol}${isValid ? ` · $${totalCost.toFixed(2)}` : ""}`}
          onPress={() => setModalVisible(true)}
          disabled={!isValid}
        />

        <Text style={[styles.disclaimer, { color: C.muted }]}>
          Prices are indicative and may change between submission and execution. Fees apply.
        </Text>
      </ScrollView>

      <FocusedModal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={[styles.modal, { backgroundColor: C.bg }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.fg }]}>Confirm Purchase</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                <Feather name="x" size={22} color={C.muted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalHighlight, { backgroundColor: "#EBF9F3" }]}>
              <CryptoIcon symbol={crypto.symbol} size={28} />
              <Text style={[styles.modalInfo, { color: C.fg }]}>
                Buying {cryptoAmount.toFixed(8)} {crypto.symbol}
              </Text>
            </View>

            {summaryRows.map((row) => (
              <View key={row.label} style={[styles.modalRow, { borderBottomColor: C.border }]}>
                <Text style={[styles.modalLbl, { color: C.muted }]}>{row.label}</Text>
                <Text style={[styles.modalVal, { color: row.highlight ? C.success : row.warn ? C.warn : C.fg }]}>
                  {row.value}
                </Text>
              </View>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
                style={[styles.modalCancel, { backgroundColor: C.surface }]}
              >
                <Text style={[styles.modalCancelTxt, { color: C.fg }]}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <SolidButton
                  testID="confirm-buy-button"
                  title="Confirm Buy"
                  onPress={handleConfirm}
                  loading={loading}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </FocusedModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: "#FFFFFF",
  },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  content: { padding: 20, gap: 4 },
  balancePill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14,
  },
  balanceDot: { width: 8, height: 8, borderRadius: 4 },
  balanceLbl: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  balanceAmt: { fontSize: 15, fontFamily: "Inter_700Bold" },
  priceWidget: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 16, padding: 18, marginBottom: 20,
  },
  priceLeft: { gap: 4, flex: 1 },
  priceLbl: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.8 },
  priceVal: { fontSize: 26, fontFamily: "Inter_700Bold" },
  changeBadge: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  changeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  chartArea: { width: 120, marginLeft: 12 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10,
  },
  chipRow: { gap: 8, paddingRight: 4 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12, paddingHorizontal: 16, height: 64,
  },
  prefix: { fontSize: 24, fontFamily: "Inter_700Bold", marginRight: 6 },
  input: { flex: 1, fontSize: 28, fontFamily: "Inter_700Bold" },
  errorText: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 6 },
  presets: { flexDirection: "row", gap: 8, marginTop: 10 },
  presetBtn: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: "center" },
  presetText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  equivCard: { borderRadius: 14, padding: 16, gap: 12, marginBottom: 20 },
  equivRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  equivLbl: { fontSize: 13, fontFamily: "Inter_400Regular" },
  equivVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  equivDetail: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  payItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 14, padding: 14, marginBottom: 10,
  },
  payIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  payInfo: { flex: 1, gap: 2 },
  payLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  payDetail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  feeCard: { borderRadius: 16, padding: 18, marginBottom: 20 },
  feeTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 12 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  feeLbl: { fontSize: 13, fontFamily: "Inter_400Regular" },
  feeVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16, marginTop: 10 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end", padding: 16 },
  modal: { borderRadius: 24, padding: 22, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalHighlight: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 12, padding: 14, marginBottom: 16,
  },
  modalInfo: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  modalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  modalLbl: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalCancel: { flex: 0.6, borderRadius: 14, height: 54, alignItems: "center", justifyContent: "center" },
  modalCancelTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
