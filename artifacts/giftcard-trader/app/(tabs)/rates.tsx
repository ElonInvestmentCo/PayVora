import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Dimensions, ActivityIndicator, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import Svg, { Path, Polyline } from "react-native-svg";
import { useLivePrices } from "@/hooks/useLivePrices";

const { width: W } = Dimensions.get("window");
const CHART_H = 110;

type CryptoId = "BTC" | "ETH" | "SOL" | "BNB" | "ADA" | "XRP";
type Side = "buy" | "sell";

const ASSETS: { symbol: CryptoId; name: string; price: number; change: number; chart: number[] }[] = [
  { symbol: "BTC", name: "Bitcoin",  price: 45200,  change: 2.41,  chart: [40,42,38,44,41,46,43,48,45,50,47,52,49,54,51,56,53,58,55,57] },
  { symbol: "ETH", name: "Ethereum", price: 2860,   change: -1.22, chart: [55,53,57,51,55,49,53,47,51,45,49,43,47,41,45,39,43,41,44,42] },
  { symbol: "SOL", name: "Solana",   price: 142,    change: 5.82,  chart: [30,33,31,36,34,38,36,41,39,44,42,46,44,48,46,50,48,52,50,53] },
  { symbol: "BNB", name: "BNB",      price: 312,    change: 1.12,  chart: [44,46,43,47,45,48,46,49,47,50,48,51,49,52,50,53,51,54,52,54] },
  { symbol: "ADA", name: "Cardano",  price: 0.46,   change: -2.1,  chart: [55,53,56,51,54,49,52,47,50,45,48,43,46,41,44,39,42,40,43,41] },
  { symbol: "XRP", name: "Ripple",   price: 0.62,   change: -0.52, chart: [48,47,49,46,48,45,47,44,46,43,45,42,44,41,43,40,42,41,43,42] },
];

const ORDER_BOOK = {
  asks: [
    { price: 45320, size: 0.42, depth: 0.35 },
    { price: 45300, size: 0.85, depth: 0.55 },
    { price: 45280, size: 1.20, depth: 0.72 },
    { price: 45260, size: 0.63, depth: 0.44 },
    { price: 45240, size: 2.10, depth: 0.95 },
  ],
  bids: [
    { price: 45180, size: 1.80, depth: 0.88 },
    { price: 45160, size: 0.95, depth: 0.62 },
    { price: 45140, size: 0.40, depth: 0.32 },
    { price: 45120, size: 1.50, depth: 0.78 },
    { price: 45100, size: 0.72, depth: 0.48 },
  ],
};

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];

function CryptoIcon({ symbol, size = 32 }: { symbol: string; size?: number }) {
  const [err, setErr] = useState(false);
  const COLORS: Record<string, string> = { BTC: "#F7931A", ETH: "#627EEA", SOL: "#9945FF", BNB: "#F3BA2F", ADA: "#0033AD", XRP: "#23292F" };
  const c = COLORS[symbol] ?? "#888";
  if (err) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c + "18", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: c, fontFamily: "Inter_700Bold", fontSize: size * 0.4 }}>{symbol[0]}</Text>
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

function PriceChart({ data, positive }: { data: number[]; positive: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const cW = W - 32;
  const step = cW / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${CHART_H - ((v - min) / range) * CHART_H}`).join(" ");
  const color = positive ? "#30D158" : "#FF3B30";
  return (
    <Svg width={cW} height={CHART_H + 8}>
      <Polyline points={pts} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function TradeScreen() {
  const insets = useSafeAreaInsets();
  const { assets, updateAsset, updateUsdBalance, addTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const { prices } = useLivePrices();

  const [selectedSymbol, setSelectedSymbol] = useState<CryptoId>("BTC");
  const [side, setSide] = useState<Side>("buy");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const asset = ASSETS.find((a) => a.symbol === selectedSymbol)!;
  const livePrice = prices[selectedSymbol]?.price ?? asset.price;
  const liveChange = prices[selectedSymbol]?.change ?? asset.change;
  const positive = liveChange >= 0;

  const numAmount = parseFloat(amount) || 0;
  const cryptoQty = numAmount > 0 ? numAmount / livePrice : 0;
  const fee = numAmount * 0.001;
  const spread = ORDER_BOOK.asks[ORDER_BOOK.asks.length - 1].price - ORDER_BOOK.bids[0].price;

  const handleOrder = useCallback(async () => {
    if (!amount || numAmount <= 0) {
      hapticError();
      Alert.alert("Invalid Amount", "Please enter an amount to trade.");
      return;
    }
    if (side === "sell") {
      const walletAsset = assets.find((a) => a.symbol === selectedSymbol);
      if (!walletAsset || walletAsset.balance < cryptoQty) {
        hapticError();
        Alert.alert("Insufficient Balance", `You don't have enough ${selectedSymbol} to sell.`);
        return;
      }
    }
    hapticMedium();
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    setProcessing(false);

    if (side === "buy") {
      updateUsdBalance(-numAmount);
      const walletAsset = assets.find((a) => a.symbol === selectedSymbol);
      if (walletAsset) {
        updateAsset(walletAsset.id, {
          balance: walletAsset.balance + cryptoQty,
          value: walletAsset.value + numAmount,
        });
      }
    } else {
      updateUsdBalance(numAmount - fee);
      const walletAsset = assets.find((a) => a.symbol === selectedSymbol);
      if (walletAsset) {
        updateAsset(walletAsset.id, {
          balance: Math.max(0, walletAsset.balance - cryptoQty),
          value: Math.max(0, walletAsset.value - numAmount),
        });
      }
    }

    addTransaction({
      type: "crypto", category: "Crypto",
      title: `${side === "buy" ? "Bought" : "Sold"} ${selectedSymbol}`,
      amount: numAmount, currency: "USD", status: "success", date: "Just now",
      direction: side === "buy" ? "out" : "in",
    });
    addNotification({
      title: `${side === "buy" ? "Buy" : "Sell"} Order Filled`,
      message: `${cryptoQty.toFixed(6)} ${selectedSymbol} ${side === "buy" ? "purchased" : "sold"} for $${numAmount.toFixed(2)}`,
      type: "success", time: "Just now",
    });
    hapticSuccess();
    setAmount("");
    Alert.alert("Order Filled! 🎉", `Successfully ${side === "buy" ? "bought" : "sold"} ${cryptoQty.toFixed(6)} ${selectedSymbol}`);
  }, [amount, numAmount, side, selectedSymbol, cryptoQty, fee, assets, updateUsdBalance, updateAsset, addTransaction, addNotification]);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Trade</Text>
          <View style={s.liveChip}>
            <View style={s.liveDot} />
            <Text style={s.liveTxt}>LIVE</Text>
          </View>
        </View>

        {/* ── Asset Selector ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.assetRow}>
          {ASSETS.map((a) => {
            const isActive = a.symbol === selectedSymbol;
            const lp = prices[a.symbol]?.price ?? a.price;
            const lc = prices[a.symbol]?.change ?? a.change;
            return (
              <TouchableOpacity
                key={a.symbol}
                onPress={() => { hapticLight(); setSelectedSymbol(a.symbol); }}
                activeOpacity={0.8}
                style={[s.assetChip, isActive && s.assetChipActive]}
              >
                <CryptoIcon symbol={a.symbol} size={26} />
                <View style={s.assetChipInfo}>
                  <Text style={[s.assetChipSym, isActive && s.assetChipSymActive]}>{a.symbol}</Text>
                  <Text style={[s.assetChipChange, { color: lc >= 0 ? "#30D158" : "#FF3B30" }]}>
                    {lc >= 0 ? "+" : ""}{lc.toFixed(2)}%
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Price Card ── */}
        <View style={s.section}>
          <View style={s.card}>
            <View style={s.priceHeaderRow}>
              <View style={s.priceLeft}>
                <CryptoIcon symbol={selectedSymbol} size={36} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={s.assetName}>{asset.name}</Text>
                  <Text style={s.assetSym}>{selectedSymbol}/USD</Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={s.priceValue}>
                  ${livePrice >= 1000
                    ? livePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : livePrice.toFixed(livePrice < 1 ? 4 : 2)}
                </Text>
                <View style={[s.changePill, { backgroundColor: positive ? "#30D15812" : "#FF3B3012" }]}>
                  <Text style={[s.changeTxt, { color: positive ? "#30D158" : "#FF3B30" }]}>
                    {positive ? "+" : ""}{liveChange.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
            <View style={s.chartWrap}>
              <PriceChart data={asset.chart} positive={positive} />
            </View>
          </View>
        </View>

        {/* ── Order Book ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Order Book</Text>
          <Text style={s.spreadText}>Spread: ${spread.toFixed(0)}</Text>
        </View>
        <View style={s.section}>
          <View style={s.card}>
            <View style={s.obHeader}>
              <Text style={s.obHeaderTxt}>Price (USD)</Text>
              <Text style={s.obHeaderTxt}>Size (BTC)</Text>
              <Text style={[s.obHeaderTxt, { textAlign: "right" }]}>Depth</Text>
            </View>
            {ORDER_BOOK.asks.map((ask, i) => (
              <View key={`ask-${i}`} style={s.obRow}>
                <View style={[s.obDepthBar, { width: `${ask.depth * 100}%`, backgroundColor: "rgba(255,59,48,0.07)" }]} />
                <Text style={[s.obPrice, { color: "#FF3B30" }]}>${ask.price.toLocaleString()}</Text>
                <Text style={s.obSize}>{ask.size.toFixed(2)}</Text>
                <Text style={s.obDepthTxt}>{(ask.depth * 100).toFixed(0)}%</Text>
              </View>
            ))}
            <View style={s.obSpreadRow}>
              <Text style={s.obSpreadTxt}>Spread: ${spread.toFixed(0)}</Text>
            </View>
            {ORDER_BOOK.bids.map((bid, i) => (
              <View key={`bid-${i}`} style={s.obRow}>
                <View style={[s.obDepthBar, { width: `${bid.depth * 100}%`, backgroundColor: "rgba(48,209,88,0.07)" }]} />
                <Text style={[s.obPrice, { color: "#30D158" }]}>${bid.price.toLocaleString()}</Text>
                <Text style={s.obSize}>{bid.size.toFixed(2)}</Text>
                <Text style={s.obDepthTxt}>{(bid.depth * 100).toFixed(0)}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Trade Panel ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Place Order</Text>
        </View>
        <View style={s.section}>
          <View style={s.card}>
            {/* Buy / Sell Toggle */}
            <View style={s.sideToggle}>
              <TouchableOpacity
                onPress={() => { hapticLight(); setSide("buy"); }}
                activeOpacity={0.8}
                style={[s.sideBtn, side === "buy" && s.sideBtnBuy]}
              >
                <Text style={[s.sideBtnTxt, side === "buy" && s.sideBtnTxtActive]}>Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { hapticLight(); setSide("sell"); }}
                activeOpacity={0.8}
                style={[s.sideBtn, side === "sell" && s.sideBtnSell]}
              >
                <Text style={[s.sideBtnTxt, side === "sell" && s.sideBtnTxtActive]}>Sell</Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <View style={s.inputSection}>
              <Text style={s.inputLabel}>Amount (USD)</Text>
              <View style={s.inputRow}>
                <Text style={s.inputPrefix}>$</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#8E8E93"
                  keyboardType="decimal-pad"
                  style={s.amtInput}
                />
              </View>
              {numAmount > 0 && (
                <Text style={s.cryptoEquiv}>≈ {cryptoQty.toFixed(6)} {selectedSymbol}</Text>
              )}
            </View>

            {/* Quick Amounts */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickRow}>
              {QUICK_AMOUNTS.map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => { hapticLight(); setAmount(q.toString()); }}
                  activeOpacity={0.8}
                  style={[s.quickBtn, amount === q.toString() && s.quickBtnActive]}
                >
                  <Text style={[s.quickBtnTxt, amount === q.toString() && s.quickBtnTxtActive]}>${q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Fee Breakdown */}
            <View style={s.feeSection}>
              {[
                { label: "Price", value: `$${livePrice >= 1000 ? livePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : livePrice.toFixed(2)}` },
                { label: "Quantity", value: `${cryptoQty.toFixed(6)} ${selectedSymbol}` },
                { label: "Fee (0.1%)", value: `$${fee.toFixed(2)}` },
                { label: "Total", value: `$${(numAmount + (side === "buy" ? fee : 0)).toFixed(2)}` },
              ].map((row, i, arr) => (
                <View key={row.label} style={[s.feeRow, i < arr.length - 1 && s.feeRowBorder]}>
                  <Text style={s.feeLabel}>{row.label}</Text>
                  <Text style={[s.feeValue, row.label === "Total" && { color: side === "buy" ? "#1A5AFF" : "#FF3B30" }]}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Execute Button */}
            <TouchableOpacity
              onPress={handleOrder}
              activeOpacity={0.85}
              disabled={processing}
              style={[s.orderBtn, side === "sell" && s.orderBtnSell, { opacity: processing ? 0.65 : 1 }]}
            >
              {processing
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.orderBtnTxt}>{side === "buy" ? `Buy ${selectedSymbol}` : `Sell ${selectedSymbol}`}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: { paddingBottom: 120 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  liveChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#30D15815", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#30D158" },
  liveTxt: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#30D158", letterSpacing: 0.5 },

  assetRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  assetChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  assetChipActive: { backgroundColor: "#1A5AFF" },
  assetChipInfo: { gap: 2 },
  assetChipSym: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  assetChipSymActive: { color: "#FFFFFF" },
  assetChipChange: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  section: { paddingHorizontal: 16, marginBottom: 10 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  spreadText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8E8E93" },

  card: {
    backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  priceHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  priceLeft: { flexDirection: "row", alignItems: "center" },
  assetName: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  assetSym: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93", marginTop: 1 },
  priceValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#1C1C1E", letterSpacing: -0.5 },
  changePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-end", marginTop: 4 },
  changeTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  chartWrap: { paddingHorizontal: 16, paddingBottom: 12 },

  obHeader: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  obHeaderTxt: { flex: 1, fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  obRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 9, position: "relative" },
  obDepthBar: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 0 },
  obPrice: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  obSize: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#1C1C1E" },
  obDepthTxt: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93", textAlign: "right" },
  obSpreadRow: { backgroundColor: "#F2F2F7", paddingVertical: 6, paddingHorizontal: 16 },
  obSpreadTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#8E8E93", textAlign: "center" },

  sideToggle: { flexDirection: "row", margin: 16, gap: 8 },
  sideBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: "center", backgroundColor: "#F2F2F7" },
  sideBtnBuy: { backgroundColor: "#30D15820" },
  sideBtnSell: { backgroundColor: "#FF3B3020" },
  sideBtnTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  sideBtnTxtActive: { color: "#1C1C1E" },

  inputSection: { paddingHorizontal: 16, marginBottom: 14 },
  inputLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8E8E93", marginBottom: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F2F2F7", borderRadius: 12, paddingHorizontal: 14 },
  inputPrefix: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#8E8E93" },
  amtInput: { flex: 1, fontSize: 26, fontFamily: "Inter_700Bold", color: "#1C1C1E", paddingVertical: 14, marginLeft: 6 },
  cryptoEquiv: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93", marginTop: 6, paddingLeft: 4 },

  quickRow: { paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  quickBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F2F2F7" },
  quickBtnActive: { backgroundColor: "#1A5AFF" },
  quickBtnTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  quickBtnTxtActive: { color: "#FFFFFF" },

  feeSection: { marginHorizontal: 16, backgroundColor: "#F2F2F7", borderRadius: 14, overflow: "hidden", marginBottom: 16 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 11 },
  feeRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  feeLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  feeValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },

  orderBtn: { margin: 16, marginTop: 0, backgroundColor: "#1A5AFF", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  orderBtnSell: { backgroundColor: "#FF3B30" },
  orderBtnTxt: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
