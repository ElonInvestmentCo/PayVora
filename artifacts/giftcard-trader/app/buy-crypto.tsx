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
  Modal,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { GlowButton } from "@/components/GlowButton";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

type CryptoId = "btc" | "eth" | "usdt" | "sol" | "xrp" | "bnb";
type PaymentMethod = "wallet" | "card" | "bank";

interface Crypto {
  id: CryptoId;
  name: string;
  symbol: string;
  price: number;
  change: number;
  icon: string;
  color: string;
}

const CRYPTOS: Crypto[] = [
  { id: "btc",  name: "Bitcoin",  symbol: "BTC",  price: 45000, change: 2.4,  icon: "bold",        color: "#F7931A" },
  { id: "eth",  name: "Ethereum", symbol: "ETH",  price: 2850,  change: -1.2, icon: "triangle",    color: "#627EEA" },
  { id: "usdt", name: "Tether",   symbol: "USDT", price: 1.0,   change: 0.01, icon: "dollar-sign", color: "#26A17B" },
  { id: "sol",  name: "Solana",   symbol: "SOL",  price: 142,   change: 5.8,  icon: "sun",         color: "#9945FF" },
  { id: "xrp",  name: "Ripple",   symbol: "XRP",  price: 0.62,  change: -0.5, icon: "droplet",     color: "#23292F" },
  { id: "bnb",  name: "BNB",      symbol: "BNB",  price: 312,   change: 1.1,  icon: "hexagon",     color: "#F3BA2F" },
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; detail: string }[] = [
  { id: "wallet", label: "USD Wallet",       icon: "credit-card", detail: "USD Wallet" },
  { id: "card",   label: "Debit / Credit Card", icon: "credit-card", detail: "Visa ending 4242" },
  { id: "bank",   label: "Bank Transfer",    icon: "briefcase",   detail: "Chase ••• 8891" },
];

const CHART_DATA = [32, 35, 33, 38, 36, 40, 37, 42, 39, 44, 41, 46, 43, 48, 45, 50, 47, 52, 49, 54];

function MiniChart({ colors }: { colors: any }) {
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
            <View
              style={[
                chartStyles.bar,
                {
                  height: 8 + pct * 52,
                  backgroundColor: isLast ? "#00E5FF" : `rgba(0,229,255,${0.2 + pct * 0.5})`,
                  borderColor: isLast ? "#00E5FF" : "transparent",
                  borderWidth: isLast ? 1 : 0,
                },
              ]}
            />
          </View>
        );
      })}
      <View style={[chartStyles.baseline, { borderColor: colors.border }]} />
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 64, position: "relative" },
  col: { flex: 1, justifyContent: "flex-end" },
  bar: { borderRadius: 2, minWidth: 4 },
  baseline: { position: "absolute", bottom: 0, left: 0, right: 0, borderBottomWidth: 1, borderStyle: "dashed" },
});

const PRESETS = [50, 100, 250, 500, 1000];

export default function BuyCryptoScreen() {
  const colors = useColors();
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
      Alert.alert("Insufficient Balance", "You don't have enough USD in your wallet.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setModalVisible(false);
    if (payment === "wallet") updateUsdBalance(-totalCost);
    addTransaction({
      type: "crypto",
      category: "Crypto",
      title: `${crypto.name} Purchase`,
      amount: totalCost,
      currency: "USD",
      status: "success",
      date: "Just now",
      direction: "out",
    });
    addNotification({
      title: "Crypto Purchased",
      message: `Bought ${cryptoAmount.toFixed(8)} ${crypto.symbol} for $${totalCost.toFixed(2)}.`,
      type: "success",
      time: "Just now",
    });
    Alert.alert(
      "Purchase Complete!",
      `You bought ${cryptoAmount.toFixed(8)} ${crypto.symbol} for $${totalCost.toFixed(2)}`,
      [{ text: "Done", onPress: () => router.back() }]
    );
  }, [cryptoAmount, crypto, totalCost, payment, usdBalance, updateUsdBalance, addTransaction, addNotification]);

  const summaryRows = useMemo(() => [
    { label: "Asset",         value: `${crypto.name} (${crypto.symbol})` },
    { label: "Market Price",  value: `$${crypto.price.toLocaleString()}` },
    { label: "You Spend",     value: `$${numFiat.toFixed(2)}` },
    { label: "You Receive",   value: `${cryptoAmount.toFixed(8)} ${crypto.symbol}`, highlight: true },
    { label: "Service Fee",   value: `-$${serviceFee.toFixed(2)}`, warn: true },
    { label: "Network Fee",   value: `-$${networkFee.toFixed(2)}`, warn: true },
    { label: "Total Cost",    value: `$${totalCost.toFixed(2)}`, highlight: true },
  ], [crypto, numFiat, cryptoAmount, serviceFee, networkFee, totalCost]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
          testID="back-button"
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Buy Crypto</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="activity" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        {/* Wallet balance pill */}
        <View style={[styles.balancePill, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.balanceDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.balanceLbl, { color: colors.mutedForeground }]}>USD Wallet</Text>
          <Text style={[styles.balanceAmt, { color: colors.foreground }]}>${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        </View>

        {/* Live price + mini chart */}
        <View style={[styles.priceWidget, { backgroundColor: "rgba(0,229,255,0.06)", borderColor: "rgba(0,229,255,0.18)" }]}>
          <View style={styles.priceLeft}>
            <Text style={[styles.priceLbl, { color: colors.mutedForeground }]}>{crypto.symbol} / USD</Text>
            <Text style={[styles.priceVal, { color: colors.foreground }]}>
              ${crypto.price.toLocaleString()}
            </Text>
            <View style={styles.changeBadge}>
              <Feather
                name={crypto.change >= 0 ? "trending-up" : "trending-down"}
                size={12}
                color={crypto.change >= 0 ? "#00FF88" : "#FF4444"}
              />
              <Text style={[styles.changeText, { color: crypto.change >= 0 ? "#00FF88" : "#FF4444" }]}>
                {crypto.change >= 0 ? "+" : ""}{crypto.change}%
              </Text>
            </View>
          </View>
          <View style={styles.chartArea}>
            <MiniChart colors={colors} />
          </View>
        </View>

        {/* Crypto selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Select Asset</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CRYPTOS.map((c) => {
              const active = c.id === selectedCrypto;
              return (
                <TouchableOpacity
                  key={c.id}
                  testID={`crypto-${c.id}`}
                  onPress={() => { setSelectedCrypto(c.id); setFiatAmount(""); }}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? "rgba(0,229,255,0.1)" : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.chipIcon, { backgroundColor: `${c.color}22` }]}>
                    <Feather name={c.icon as any} size={14} color={c.color} />
                  </View>
                  <Text style={[styles.chipText, { color: active ? colors.primary : colors.foreground }]}>{c.symbol}</Text>
                  {active && <Feather name="check" size={12} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Amount (fiat) */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Amount (USD)</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: isValid || numFiat === 0 ? colors.border : "#FF4444" }]}>
            <Text style={[styles.prefix, { color: colors.primary }]}>$</Text>
            <TextInput
              testID="fiat-input"
              value={fiatAmount}
              onChangeText={setFiatAmount}
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={[styles.input, { color: colors.foreground }]}
            />
          </View>
          {numFiat > 0 && numFiat < 1 && (
            <Text style={[styles.errorText, { color: "#FF4444" }]}>Minimum purchase is $1.00</Text>
          )}

          {/* Presets */}
          <View style={styles.presets}>
            {PRESETS.map((v) => (
              <TouchableOpacity
                key={v}
                testID={`preset-${v}`}
                onPress={() => handlePreset(v)}
                activeOpacity={0.8}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: numFiat === v ? "rgba(0,229,255,0.12)" : colors.card,
                    borderColor: numFiat === v ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.presetText, { color: numFiat === v ? colors.primary : colors.mutedForeground }]}>
                  ${v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Crypto equivalent */}
        {numFiat > 0 && (
          <View style={[styles.equivCard, { backgroundColor: "rgba(0,255,136,0.06)", borderColor: "#00FF8830" }]}>
            <View style={styles.equivRow}>
              <Text style={[styles.equivLbl, { color: colors.mutedForeground }]}>You Receive</Text>
              <Text style={[styles.equivVal, { color: "#00FF88" }]}>
                {cryptoAmount.toFixed(8)} {crypto.symbol}
              </Text>
            </View>
            <View style={styles.equivRow}>
              <Text style={[styles.equivLbl, { color: colors.mutedForeground }]}>Price</Text>
              <Text style={[styles.equivDetail, { color: colors.primary }]}>
                ${crypto.price.toLocaleString()} / {crypto.symbol}
              </Text>
            </View>
          </View>
        )}

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Payment Method</Text>
          {PAYMENT_METHODS.map((pm) => {
            const active = pm.id === payment;
            return (
              <TouchableOpacity
                key={pm.id}
                testID={`payment-${pm.id}`}
                onPress={() => setPayment(pm.id)}
                activeOpacity={0.8}
                style={[
                  styles.payItem,
                  {
                    backgroundColor: active ? "rgba(0,229,255,0.07)" : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={[styles.payIcon, { backgroundColor: active ? "rgba(0,229,255,0.15)" : `${colors.border}80` }]}>
                  <Feather name={pm.icon as any} size={18} color={active ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={styles.payInfo}>
                  <Text style={[styles.payLabel, { color: active ? colors.primary : colors.foreground }]}>{pm.label}</Text>
                  <Text style={[styles.payDetail, { color: colors.mutedForeground }]}>{pm.detail}</Text>
                </View>
                <View style={[styles.radioOuter, { borderColor: active ? colors.primary : colors.border }]}>
                  {active && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Fee breakdown */}
        <View style={[styles.feeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.feeTitle, { color: colors.foreground }]}>Fee Breakdown</Text>
          {[
            { label: "Service Fee (0.5%)", value: numFiat > 0 ? `$${serviceFee.toFixed(2)}` : "-" },
            { label: "Network Fee",         value: numFiat > 0 ? `$${networkFee.toFixed(2)}` : "-" },
            { label: "Total Fees",          value: numFiat > 0 ? `$${(serviceFee + networkFee).toFixed(2)}` : "-", highlight: true },
          ].map((row) => (
            <View key={row.label} style={[styles.feeRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.feeLbl, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.feeVal, { color: row.highlight ? "#F59E0B" : colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Status indicators */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: "rgba(0,255,136,0.12)", borderColor: "#00FF8830" }]}>
            <View style={[styles.statusDot, { backgroundColor: "#00FF88" }]} />
            <Text style={[styles.statusTxt, { color: "#00FF88" }]}>Completed</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: "rgba(245,158,11,0.12)", borderColor: "#F59E0B30" }]}>
            <View style={[styles.statusDot, { backgroundColor: "#F59E0B" }]} />
            <Text style={[styles.statusTxt, { color: "#F59E0B" }]}>Pending</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: "rgba(239,68,68,0.12)", borderColor: "#EF444430" }]}>
            <View style={[styles.statusDot, { backgroundColor: "#EF4444" }]} />
            <Text style={[styles.statusTxt, { color: "#EF4444" }]}>Failed</Text>
          </View>
        </View>

        {/* Buy Now CTA */}
        <GlowButton
          testID="buy-now-button"
          title={`Buy ${crypto.symbol} · $${isValid ? totalCost.toFixed(2) : "0.00"}`}
          onPress={() => setModalVisible(true)}
          loading={false}
          disabled={!isValid}
        />

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          Prices are indicative and may change between submission and execution. Service fees apply.
        </Text>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Confirm Purchase</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalHighlight, { backgroundColor: "rgba(0,229,255,0.08)", borderColor: "rgba(0,229,255,0.2)" }]}>
              <Feather name="info" size={20} color={colors.primary} />
              <Text style={[styles.modalInfo, { color: colors.primary }]}>
                Buying {cryptoAmount.toFixed(8)} {crypto.symbol}
              </Text>
            </View>

            {summaryRows.map((row) => (
              <View key={row.label} style={[styles.modalRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalLbl, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text
                  style={[
                    styles.modalVal,
                    {
                      color: row.highlight
                        ? "#00FF88"
                        : row.warn
                        ? "#F59E0B"
                        : colors.foreground,
                    },
                  ]}
                >
                  {row.value}
                </Text>
              </View>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
                style={[styles.modalCancel, { backgroundColor: colors.border }]}
              >
                <Text style={[styles.modalCancelTxt, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <GlowButton
                  testID="confirm-buy-button"
                  title="Confirm Buy"
                  onPress={handleConfirm}
                  loading={loading}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  content: { padding: 20, gap: 4 },

  balancePill: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, marginBottom: 14,
  },
  balanceDot: { width: 8, height: 8, borderRadius: 4 },
  balanceLbl: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  balanceAmt: { fontSize: 15, fontFamily: "Inter_700Bold" },

  priceWidget: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20,
  },
  priceLeft: { gap: 4, flex: 1 },
  priceLbl: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.8 },
  priceVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  changeBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  changeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  chartArea: { width: 120, marginLeft: 12 },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 12, fontFamily: "Inter_500Medium",
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10,
  },

  chipRow: { gap: 8, paddingRight: 4 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1,
  },
  chipIcon: { width: 26, height: 26, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16, height: 60,
  },
  prefix: { fontSize: 22, fontFamily: "Inter_700Bold", marginRight: 6 },
  input: { flex: 1, fontSize: 26, fontFamily: "Inter_700Bold" },
  errorText: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 6 },

  presets: { flexDirection: "row", gap: 8, marginTop: 10 },
  presetBtn: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 8, alignItems: "center" },
  presetText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  equivCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 12, marginBottom: 20 },
  equivRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  equivLbl: { fontSize: 13, fontFamily: "Inter_400Regular" },
  equivVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  equivDetail: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  payItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10,
  },
  payIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  payInfo: { flex: 1, gap: 2 },
  payLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  payDetail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner: { width: 10, height: 10, borderRadius: 5 },

  feeCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 16 },
  feeTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 12 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  feeLbl: { fontSize: 13, fontFamily: "Inter_400Regular" },
  feeVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  statusRow: { flexDirection: "row", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16, marginTop: 6 },

  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end", padding: 16,
  },
  modal: { borderRadius: 20, padding: 20, borderWidth: 1, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalHighlight: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 16,
  },
  modalInfo: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  modalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  modalLbl: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalCancel: { flex: 0.6, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  modalCancelTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
