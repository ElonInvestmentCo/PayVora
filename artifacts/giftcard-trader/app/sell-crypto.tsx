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

type CryptoId = "btc" | "eth" | "usdt" | "sol" | "xrp" | "bnb";
type OrderType = "market" | "limit";

interface Crypto {
  id: CryptoId;
  name: string;
  symbol: string;
  price: number;
  change: number;
  balance: number;
  icon: string;
  color: string;
}

const CRYPTOS: Crypto[] = [
  { id: "btc",  name: "Bitcoin",  symbol: "BTC",  price: 45000, change: 2.4,  balance: 0.3425, icon: "bold",     color: "#F7931A" },
  { id: "eth",  name: "Ethereum", symbol: "ETH",  price: 2850,  change: -1.2, balance: 4.125,  icon: "triangle", color: "#627EEA" },
  { id: "usdt", name: "Tether",   symbol: "USDT", price: 1.0,   change: 0.01, balance: 2500,   icon: "dollar-sign", color: "#26A17B" },
  { id: "sol",  name: "Solana",   symbol: "SOL",  price: 142,   change: 5.8,  balance: 18.5,   icon: "sun",     color: "#9945FF" },
  { id: "xrp",  name: "Ripple",   symbol: "XRP",  price: 0.62,  change: -0.5, balance: 3200,   icon: "droplet", color: "#23292F" },
  { id: "bnb",  name: "BNB",      symbol: "BNB",  price: 312,   change: 1.1,  balance: 2.8,    icon: "hexagon", color: "#F3BA2F" },
];

const CHART_DATA = [38, 42, 40, 45, 43, 48, 46, 50, 47, 52, 49, 55, 53, 51, 56, 54, 58, 55, 60, 57];

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

export default function SellCryptoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const [selectedCrypto, setSelectedCrypto] = useState<CryptoId>("btc");
  const [cryptoSelectorOpen, setCryptoSelectorOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const crypto = CRYPTOS.find((c) => c.id === selectedCrypto)!;
  const numAmount = parseFloat(amount) || 0;
  const effectivePrice = orderType === "limit" ? (parseFloat(limitPrice) || crypto.price) : crypto.price;
  const fiatValue = numAmount * effectivePrice;
  const fee = fiatValue * 0.001;
  const payout = fiatValue - fee;
  const isValid = numAmount > 0 && numAmount <= crypto.balance;
  const balanceUSD = crypto.balance * crypto.price;

  const handlePercentage = useCallback((pct: number) => {
    setAmount((crypto.balance * pct).toFixed(pct === 1 ? 4 : 6));
  }, [crypto.balance]);

  const handleConfirm = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setModalVisible(false);
    Alert.alert(
      "Sell Order Placed!",
      `Successfully sold ${numAmount} ${crypto.symbol} for $${payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      [{ text: "Done", onPress: () => router.back() }]
    );
  }, [numAmount, crypto, payout]);

  const summaryRows = useMemo(() => [
    { label: "Asset",        value: `${crypto.name} (${crypto.symbol})` },
    { label: "Amount",       value: `${numAmount} ${crypto.symbol}` },
    { label: "Order Type",   value: orderType === "market" ? "Market" : "Limit" },
    { label: "Price",        value: `$${effectivePrice.toLocaleString()}` },
    { label: "Subtotal",     value: `$${fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
    { label: "Fee (0.1%)",   value: `-$${fee.toFixed(2)}`, warn: true },
    { label: "You Receive",  value: `$${payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, highlight: true },
  ], [crypto, numAmount, orderType, effectivePrice, fiatValue, fee, payout]);

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Sell Crypto</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="activity" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        {/* Wallet balance card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.balanceHeader}>
            <View style={[styles.cryptoBadge, { backgroundColor: `${crypto.color}22` }]}>
              <Feather name={crypto.icon as any} size={18} color={crypto.color} />
            </View>
            <View style={styles.balanceInfo}>
              <Text style={[styles.balanceName, { color: colors.foreground }]}>{crypto.name} Balance</Text>
              <Text style={[styles.balanceSub, { color: colors.mutedForeground }]}>Available to sell</Text>
            </View>
          </View>
          <Text style={[styles.balanceCrypto, { color: colors.foreground }]}>
            {crypto.balance} {crypto.symbol}
          </Text>
          <Text style={[styles.balanceFiat, { color: colors.mutedForeground }]}>
            ≈ ${balanceUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Live price + mini chart */}
        <View style={[styles.priceWidget, { backgroundColor: "rgba(0,229,255,0.06)", borderColor: "rgba(0,229,255,0.18)" }]}>
          <View style={styles.priceLeft}>
            <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>{crypto.symbol} / USD</Text>
            <Text style={[styles.priceValue, { color: colors.foreground }]}>
              ${crypto.price.toLocaleString()}
            </Text>
            <View style={styles.changeBadge}>
              <Feather name={crypto.change >= 0 ? "trending-up" : "trending-down"} size={12} color={crypto.change >= 0 ? "#00FF88" : "#FF4444"} />
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cryptoRow}>
            {CRYPTOS.map((c) => {
              const active = c.id === selectedCrypto;
              return (
                <TouchableOpacity
                  key={c.id}
                  testID={`crypto-${c.id}`}
                  onPress={() => { setSelectedCrypto(c.id); setAmount(""); }}
                  activeOpacity={0.8}
                  style={[
                    styles.cryptoChip,
                    {
                      backgroundColor: active ? "rgba(0,229,255,0.1)" : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.cryptoIcon, { backgroundColor: `${c.color}22` }]}>
                    <Feather name={c.icon as any} size={14} color={c.color} />
                  </View>
                  <Text style={[styles.cryptoSymbol, { color: active ? colors.primary : colors.foreground }]}>{c.symbol}</Text>
                  {active && <Feather name="check" size={12} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Market / Limit toggle */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Order Type</Text>
          <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {(["market", "limit"] as OrderType[]).map((t) => (
              <TouchableOpacity
                key={t}
                testID={`order-${t}`}
                onPress={() => setOrderType(t)}
                activeOpacity={0.8}
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: orderType === t ? "rgba(0,229,255,0.15)" : "transparent",
                    borderColor: orderType === t ? colors.primary : "transparent",
                  },
                ]}
              >
                <Text style={[styles.toggleText, { color: orderType === t ? colors.primary : colors.mutedForeground }]}>
                  {t === "market" ? "Market" : "Limit"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Limit price input */}
        {orderType === "limit" && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Limit Price (USD)</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.inputPrefix, { color: colors.primary }]}>$</Text>
              <TextInput
                testID="limit-price-input"
                value={limitPrice}
                onChangeText={setLimitPrice}
                placeholder={crypto.price.toLocaleString()}
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                style={[styles.textInput, { color: colors.foreground }]}
              />
            </View>
          </View>
        )}

        {/* Amount to sell */}
        <View style={styles.section}>
          <View style={styles.amountHeader}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Amount to Sell</Text>
            <Text style={[styles.maxLabel, { color: colors.mutedForeground }]}>
              Max: {crypto.balance} {crypto.symbol}
            </Text>
          </View>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: isValid || numAmount === 0 ? colors.border : "#FF4444" }]}>
            <TextInput
              testID="amount-input"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={[styles.textInput, styles.amountText, { color: colors.foreground }]}
            />
            <View style={[styles.symbolTag, { backgroundColor: `${crypto.color}18`, borderColor: `${crypto.color}40` }]}>
              <Text style={[styles.symbolText, { color: crypto.color }]}>{crypto.symbol}</Text>
            </View>
          </View>
          {numAmount > crypto.balance && (
            <Text style={[styles.errorText, { color: "#FF4444" }]}>Insufficient balance</Text>
          )}

          {/* Percentage quick-select */}
          <View style={styles.pctRow}>
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <TouchableOpacity
                key={pct}
                testID={`pct-${pct * 100}`}
                onPress={() => handlePercentage(pct)}
                activeOpacity={0.8}
                style={[styles.pctBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.pctText, { color: colors.mutedForeground }]}>
                  {pct === 1 ? "Max" : `${pct * 100}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fiat equivalent */}
        {numAmount > 0 && (
          <View style={[styles.fiatCard, { backgroundColor: "rgba(0,255,136,0.06)", borderColor: "#00FF8830" }]}>
            <View style={styles.fiatRow}>
              <Text style={[styles.fiatLabel, { color: colors.mutedForeground }]}>You Receive (USD)</Text>
              <Text style={[styles.fiatValue, { color: "#00FF88" }]}>
                ${payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.fiatRow}>
              <Text style={[styles.fiatLabel, { color: colors.mutedForeground }]}>
                {orderType === "market" ? "Market" : "Limit"} Price
              </Text>
              <Text style={[styles.fiatDetail, { color: colors.primary }]}>
                ${effectivePrice.toLocaleString()} / {crypto.symbol}
              </Text>
            </View>
            <View style={styles.fiatRow}>
              <Text style={[styles.fiatLabel, { color: colors.mutedForeground }]}>Network Fee</Text>
              <Text style={[styles.fiatDetail, { color: "#F59E0B" }]}>-${fee.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Fee breakdown */}
        <View style={[styles.feeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.feeTitle, { color: colors.foreground }]}>Fee Breakdown</Text>
          {[
            { label: "Trading Fee",  value: "0.1%",  detail: numAmount > 0 ? `$${fee.toFixed(2)}` : "-" },
            { label: "Network Fee",  value: "Free",  detail: "$0.00" },
            { label: "Withdrawal",   value: "Free",  detail: "$0.00" },
          ].map((row) => (
            <View key={row.label} style={[styles.feeRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.feeLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <View style={styles.feeRight}>
                <Text style={[styles.feeValue, { color: colors.foreground }]}>{row.value}</Text>
                <Text style={[styles.feeDetail, { color: colors.mutedForeground }]}>{row.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Status indicators */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: "rgba(0,255,136,0.12)", borderColor: "#00FF8830" }]}>
            <View style={[styles.statusDot, { backgroundColor: "#00FF88" }]} />
            <Text style={[styles.statusText, { color: "#00FF88" }]}>Completed</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: "rgba(245,158,11,0.12)", borderColor: "#F59E0B30" }]}>
            <View style={[styles.statusDot, { backgroundColor: "#F59E0B" }]} />
            <Text style={[styles.statusText, { color: "#F59E0B" }]}>Pending</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: "rgba(239,68,68,0.12)", borderColor: "#EF444430" }]}>
            <View style={[styles.statusDot, { backgroundColor: "#EF4444" }]} />
            <Text style={[styles.statusText, { color: "#EF4444" }]}>Failed</Text>
          </View>
        </View>

        {/* Sell Now CTA */}
        <GlowButton
          testID="sell-now-button"
          title={`Sell ${crypto.symbol} · $${isValid ? payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}`}
          onPress={() => setModalVisible(true)}
          loading={false}
          disabled={!isValid}
          variant="primary"
        />

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          Market orders execute at the best available price. Prices may change between submission and execution.
        </Text>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Confirm Sale</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalHighlight, { backgroundColor: "rgba(255,68,68,0.08)", borderColor: "#FF444430" }]}>
              <Feather name="alert-triangle" size={20} color="#FF4444" />
              <Text style={[styles.modalWarn, { color: "#FF4444" }]}>
                You are selling {numAmount} {crypto.symbol}
              </Text>
            </View>

            {summaryRows.map((row) => (
              <View key={row.label} style={[styles.modalRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text
                  style={[
                    styles.modalValue,
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
                <Text style={[styles.modalCancelText, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <GlowButton
                  testID="confirm-sell-button"
                  title="Confirm Sell"
                  onPress={handleConfirm}
                  loading={loading}
                  variant="primary"
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

  balanceCard: {
    borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 14, gap: 8,
  },
  balanceHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  cryptoBadge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  balanceInfo: { gap: 2 },
  balanceName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  balanceSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  balanceCrypto: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  balanceFiat: { fontSize: 14, fontFamily: "Inter_400Regular" },

  priceWidget: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20,
  },
  priceLeft: { gap: 4, flex: 1 },
  priceLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.8 },
  priceValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  changeBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  changeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  chartArea: { width: 120, marginLeft: 12 },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 12, fontFamily: "Inter_500Medium",
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10,
  },

  cryptoRow: { gap: 8, paddingRight: 4 },
  cryptoChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1,
  },
  cryptoIcon: { width: 26, height: 26, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  cryptoSymbol: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  toggleRow: {
    flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 4, gap: 4,
  },
  toggleBtn: {
    flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1,
  },
  toggleText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16, height: 60,
  },
  inputPrefix: { fontSize: 18, fontFamily: "Inter_700Bold", marginRight: 6 },
  textInput: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold" },
  amountText: { fontSize: 26, fontFamily: "Inter_700Bold" },
  symbolTag: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1,
  },
  symbolText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  amountHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  maxLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  errorText: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 6 },

  pctRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  pctBtn: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 8, alignItems: "center" },
  pctText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  fiatCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 12, marginBottom: 20 },
  fiatRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fiatLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  fiatValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  fiatDetail: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  feeCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 16 },
  feeTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 12 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  feeLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  feeRight: { alignItems: "flex-end", gap: 2 },
  feeValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  feeDetail: { fontSize: 11, fontFamily: "Inter_400Regular" },

  statusRow: { flexDirection: "row", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16, marginTop: 6 },

  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end", padding: 16,
  },
  modal: {
    borderRadius: 20, padding: 20, borderWidth: 1,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalHighlight: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 16,
  },
  modalWarn: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  modalRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 10, borderBottomWidth: 1,
  },
  modalLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalCancel: {
    flex: 0.6, borderRadius: 14, paddingVertical: 16, alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
