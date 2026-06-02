import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWallet } from "@/contexts/WalletContext";
import { hapticLight, hapticSuccess } from "@/utils/haptics";

const ASSETS = [
  { symbol: "BTC", name: "Bitcoin",   price: 67420.50, change:  2.34, color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum",  price:  3512.80, change: -1.12, color: "#627EEA" },
  { symbol: "SOL", name: "Solana",    price:   178.90, change:  5.67, color: "#9945FF" },
  { symbol: "BNB", name: "BNB",       price:   608.40, change:  0.88, color: "#F3BA2F" },
  { symbol: "XRP", name: "XRP",       price:     0.582, change: -2.45, color: "#346AA9" },
  { symbol: "ADA", name: "Cardano",   price:     0.443, change:  1.90, color: "#0033AD" },
];

type Mode = "buy" | "sell";

export default function TradeScreen() {
  const insets = useSafeAreaInsets();
  const { usdBalance, addTransaction, updateUsdBalance } = useWallet();
  const [mode, setMode] = useState<Mode>("buy");
  const [selected, setSelected] = useState(0);
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);

  const asset = ASSETS[selected];
  const usdAmt = parseFloat(amount) || 0;
  const cryptoAmt = usdAmt / asset.price;
  const fee = usdAmt * 0.015;
  const total = mode === "buy" ? usdAmt + fee : usdAmt - fee;
  const canSubmit = usdAmt > 0 && usdAmt <= usdBalance;

  const handleTrade = () => {
    if (!canSubmit) return;
    hapticSuccess();
    addTransaction({
      id: Date.now().toString(),
      title: `${mode === "buy" ? "Bought" : "Sold"} ${asset.symbol}`,
      amount: usdAmt,
      currency: "USD",
      direction: mode === "buy" ? "out" : "in",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      type: "crypto",
    });
    updateUsdBalance(mode === "buy" ? -total : total);
    setAmount("");
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[s.headerWrap, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Trade</Text>
          <View style={s.toggle}>
            {(["buy", "sell"] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[s.toggleBtn, mode === m && s.toggleBtnActive]}
                onPress={() => { hapticLight(); setMode(m); setAmount(""); }}
                activeOpacity={0.8}
              >
                <Text style={[s.toggleLabel, mode === m && s.toggleLabelActive]}>
                  {m === "buy" ? "Buy" : "Sell"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.assetRow}
          style={{ marginBottom: 16 }}
        >
          {ASSETS.map((a, i) => (
            <TouchableOpacity
              key={a.symbol}
              style={[s.assetChip, selected === i && s.assetChipActive]}
              onPress={() => { hapticLight(); setSelected(i); setAmount(""); }}
              activeOpacity={0.8}
            >
              <View style={[s.assetDot, { backgroundColor: a.color }]} />
              <Text style={[s.assetChipLabel, selected === i && s.assetChipLabelActive]}>{a.symbol}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.card}>
          <View style={s.rateRow}>
            <View>
              <Text style={s.assetName}>{asset.name}</Text>
              <Text style={s.assetSymbol}>{asset.symbol} / USD</Text>
            </View>
            <View style={s.rateRight}>
              <Text style={s.ratePrice}>${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              <Text style={[s.rateChange, { color: asset.change >= 0 ? "#118D45" : "#E02E5B" }]}>
                {asset.change >= 0 ? "+" : ""}{asset.change.toFixed(2)}% today
              </Text>
            </View>
          </View>

          <View style={s.separator} />

          <Text style={s.label}>Amount (USD)</Text>
          <View style={s.inputWrap}>
            <Text style={s.currencySign}>$</Text>
            <TextInput
              style={s.input}
              placeholder="0.00"
              placeholderTextColor="#C7C7CC"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {usdAmt > 0 && (
            <View style={s.convertRow}>
              <Text style={s.convertLabel}>You {mode === "buy" ? "receive" : "send"}</Text>
              <Text style={s.convertVal}>{cryptoAmt.toFixed(6)} {asset.symbol}</Text>
            </View>
          )}

          <View style={s.separator} />

          <View style={s.feeRow}>
            <Text style={s.feeLabel}>Fee (1.5%)</Text>
            <Text style={s.feeVal}>${fee.toFixed(2)}</Text>
          </View>
          <View style={s.feeRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalVal}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={s.balRow}>
          <Text style={s.balLabel}>Available balance</Text>
          <Text style={s.balVal}>${usdBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>

        <TouchableOpacity onPress={handleTrade} activeOpacity={0.85} disabled={!canSubmit || done}>
          <LinearGradient
            colors={done ? ["#118D45", "#25A248"] : canSubmit ? ["#1072EA", "#05305C"] : ["#C7C7CC", "#AEAEB2"]}
            style={s.submitBtn}
          >
            <Text style={s.submitLabel}>
              {done ? "✓ Order Placed" : canSubmit ? `${mode === "buy" ? "Buy" : "Sell"} ${asset.symbol}` : "Enter amount"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F9FC" },
  headerWrap: { backgroundColor: "#F7F9FC", zIndex: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  toggle: { flexDirection: "row", backgroundColor: "#E5E5EA", borderRadius: 10, padding: 3 },
  toggleBtn: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  toggleLabelActive: { color: "#1C1C1E" },

  scroll: { paddingHorizontal: 16, paddingBottom: 120 },
  assetRow: { paddingHorizontal: 0, gap: 8, paddingBottom: 4 },
  assetChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  assetChipActive: { backgroundColor: "#1072EA" },
  assetDot: { width: 8, height: 8, borderRadius: 4 },
  assetChipLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  assetChipLabelActive: { color: "#FFFFFF" },

  card: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
    marginBottom: 12,
  },
  rateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  assetName: { fontSize: 17, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  assetSymbol: { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_400Regular", marginTop: 2 },
  rateRight: { alignItems: "flex-end" },
  ratePrice: { fontSize: 17, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  rateChange: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E5EA", marginVertical: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#8E8E93", fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#F7F9FC", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  currencySign: { fontSize: 22, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginRight: 4 },
  input: { flex: 1, fontSize: 26, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  convertRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  convertLabel: { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_400Regular" },
  convertVal: { fontSize: 13, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  feeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  feeLabel: { fontSize: 14, color: "#8E8E93", fontFamily: "Inter_400Regular" },
  feeVal: { fontSize: 14, color: "#8E8E93", fontFamily: "Inter_400Regular" },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  totalVal: { fontSize: 15, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  balRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginBottom: 16 },
  balLabel: { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_400Regular" },
  balVal: { fontSize: 13, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  submitBtn: { borderRadius: 16, paddingVertical: 17, alignItems: "center" },
  submitLabel: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
