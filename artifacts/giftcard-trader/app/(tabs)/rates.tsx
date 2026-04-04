import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { hapticLight, hapticSuccess, hapticError, hapticSelection } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

type TradeAsset = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  icon: string;
  color: string;
};

const TRADE_ASSETS: TradeAsset[] = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", price: 44950.0, change24h: 2.45, icon: "B", color: "#F7931A" },
  { id: "eth", name: "Ethereum", symbol: "ETH", price: 3201.8, change24h: -1.2, icon: "E", color: "#627EEA" },
  { id: "sol", name: "Solana", symbol: "SOL", price: 70.12, change24h: 5.8, icon: "S", color: "#00FFA3" },
  { id: "bnb", name: "BNB", symbol: "BNB", price: 312.45, change24h: 0.9, icon: "B", color: "#F3BA2F" },
  { id: "ada", name: "Cardano", symbol: "ADA", price: 0.58, change24h: -2.1, icon: "A", color: "#0033AD" },
  { id: "xrp", name: "XRP", symbol: "XRP", price: 0.62, change24h: 3.4, icon: "X", color: "#00AAE4" },
];

type OrderSide = "buy" | "sell";

type OrderBookEntry = { price: number; amount: number; total: number };

function generateOrderBook(basePrice: number): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  for (let i = 0; i < 8; i++) {
    const bidPrice = basePrice * (1 - (i + 1) * 0.001 - Math.random() * 0.0005);
    const askPrice = basePrice * (1 + (i + 1) * 0.001 + Math.random() * 0.0005);
    const bidAmt = parseFloat((Math.random() * 2 + 0.01).toFixed(4));
    const askAmt = parseFloat((Math.random() * 2 + 0.01).toFixed(4));
    bids.push({ price: parseFloat(bidPrice.toFixed(2)), amount: bidAmt, total: parseFloat((bidPrice * bidAmt).toFixed(2)) });
    asks.push({ price: parseFloat(askPrice.toFixed(2)), amount: askAmt, total: parseFloat((askPrice * askAmt).toFixed(2)) });
  }
  return { bids, asks: asks.reverse() };
}

function generateChartData(basePrice: number): number[] {
  const points: number[] = [];
  let p = basePrice * 0.96;
  for (let i = 0; i < 48; i++) {
    p += (Math.random() - 0.48) * basePrice * 0.008;
    p = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, p));
    points.push(p);
  }
  return points;
}

function MiniChart({ data, color, height = 100 }: { data: number[]; color: string; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return (
    <View style={[miniStyles.wrap, { height }]}>
      {data.map((v, i) => {
        const pct = (v - min) / range;
        const barH = 4 + pct * (height - 8);
        const isLast = i === data.length - 1;
        return (
          <View key={i} style={miniStyles.col}>
            <View
              style={{
                height: barH,
                borderRadius: 1.5,
                backgroundColor: isLast ? color : `${color}${Math.round(30 + pct * 60).toString(16).padStart(2, "0")}`,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

const miniStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 1 },
  col: { flex: 1, justifyContent: "flex-end" },
});

export default function TradeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const { usdBalance, assets, updateUsdBalance, updateAsset, addTransaction } = useWallet();
  const { addNotification } = useNotifications();

  const [selectedAsset, setSelectedAsset] = useState<TradeAsset>(TRADE_ASSETS[0]);
  const [side, setSide] = useState<OrderSide>("buy");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  const chartData = useMemo(() => generateChartData(selectedAsset.price), [selectedAsset.id]);
  const orderBook = useMemo(() => generateOrderBook(selectedAsset.price), [selectedAsset.id]);

  const numAmount = parseFloat(amount) || 0;
  const totalCost = numAmount * selectedAsset.price;
  const fee = totalCost * 0.001;
  const grandTotal = side === "buy" ? totalCost + fee : totalCost - fee;

  const maxBids = Math.max(...orderBook.bids.map((b) => b.amount));
  const maxAsks = Math.max(...orderBook.asks.map((a) => a.amount));

  const handleTrade = useCallback(async () => {
    if (numAmount <= 0) {
      hapticError();
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (side === "buy" && grandTotal > usdBalance) {
      hapticError();
      Alert.alert("Insufficient Balance", `You need $${grandTotal.toFixed(2)} but only have $${usdBalance.toFixed(2)}.`);
      return;
    }
    const ownedAsset = assets.find((a) => a.id === selectedAsset.id);
    if (side === "sell") {
      const ownedQty = ownedAsset?.balance ?? 0;
      if (numAmount > ownedQty) {
        hapticError();
        Alert.alert("Insufficient Holdings", `You only have ${ownedQty} ${selectedAsset.symbol} available to sell.`);
        return;
      }
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);

    if (side === "buy") {
      updateUsdBalance(-grandTotal);
      if (ownedAsset) {
        updateAsset(selectedAsset.id, { balance: ownedAsset.balance + numAmount, value: ownedAsset.value + totalCost });
      }
    } else {
      updateUsdBalance(grandTotal);
      if (ownedAsset) {
        updateAsset(selectedAsset.id, { balance: Math.max(0, ownedAsset.balance - numAmount), value: Math.max(0, ownedAsset.value - totalCost) });
      }
    }

    addTransaction({
      type: "crypto",
      category: "Crypto",
      title: `${side === "buy" ? "Bought" : "Sold"} ${selectedAsset.symbol}`,
      amount: grandTotal,
      currency: "USD",
      status: "success",
      date: "Just now",
      direction: side === "buy" ? "out" : "in",
    });
    addNotification({
      title: `${side === "buy" ? "Buy" : "Sell"} Order Filled`,
      message: `${side === "buy" ? "Bought" : "Sold"} ${numAmount} ${selectedAsset.symbol} at $${selectedAsset.price.toLocaleString()}`,
      type: "success",
      time: "Just now",
    });
    hapticSuccess();
    Alert.alert(
      "Order Filled!",
      `${side === "buy" ? "Bought" : "Sold"} ${numAmount} ${selectedAsset.symbol} for $${grandTotal.toFixed(2)}`,
      [{ text: "Done", onPress: () => setAmount("") }]
    );
  }, [numAmount, side, selectedAsset, grandTotal, totalCost, usdBalance, assets, updateUsdBalance, updateAsset, addTransaction, addNotification]);

  const quickAmounts = side === "buy" ? [50, 100, 250, 500] : [0.01, 0.05, 0.1, 0.5];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 12, paddingBottom: bottomPad + 100 }]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Trade</Text>
          <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>
            Available: <Text style={{ color: colors.success, fontFamily: "Inter_700Bold" }}>${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => { hapticLight(); setShowAssetPicker(!showAssetPicker); }}
          style={[styles.assetSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.assetIcon, { backgroundColor: `${selectedAsset.color}22` }]}>
            <Text style={[styles.assetIconText, { color: selectedAsset.color }]}>{selectedAsset.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.assetName, { color: colors.foreground }]}>{selectedAsset.name}</Text>
            <Text style={[styles.assetSymbol, { color: colors.mutedForeground }]}>{selectedAsset.symbol}/USD</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.assetPrice, { color: colors.foreground }]}>${selectedAsset.price.toLocaleString()}</Text>
            <Text style={[styles.assetChange, { color: selectedAsset.change24h >= 0 ? "#00FF88" : "#FF4444" }]}>
              {selectedAsset.change24h >= 0 ? "+" : ""}{selectedAsset.change24h}%
            </Text>
          </View>
          <Feather name={showAssetPicker ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        {showAssetPicker && (
          <View style={[styles.assetList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {TRADE_ASSETS.filter((a) => a.id !== selectedAsset.id).map((asset) => (
              <TouchableOpacity
                key={asset.id}
                activeOpacity={0.8}
                onPress={() => { hapticSelection(); setSelectedAsset(asset); setShowAssetPicker(false); setAmount(""); }}
                style={[styles.assetListItem, { borderBottomColor: colors.border }]}
              >
                <View style={[styles.assetIconSm, { backgroundColor: `${asset.color}22` }]}>
                  <Text style={{ fontSize: 12, fontFamily: "Inter_700Bold", color: asset.color }}>{asset.icon}</Text>
                </View>
                <Text style={[styles.assetListName, { color: colors.foreground }]}>{asset.symbol}</Text>
                <Text style={[styles.assetListPrice, { color: colors.mutedForeground }]}>${asset.price.toLocaleString()}</Text>
                <Text style={[styles.assetListChange, { color: asset.change24h >= 0 ? "#00FF88" : "#FF4444" }]}>
                  {asset.change24h >= 0 ? "+" : ""}{asset.change24h}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>{selectedAsset.symbol} Price (24h)</Text>
            <View style={[styles.liveDot, { backgroundColor: "#00FF8840" }]}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#00FF88" }} />
              <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#00FF88" }}>LIVE</Text>
            </View>
          </View>
          <MiniChart data={chartData} color={selectedAsset.change24h >= 0 ? "#00FF88" : "#FF4444"} height={120} />
          <View style={styles.chartLabels}>
            <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>24h ago</Text>
            <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>12h ago</Text>
            <Text style={[styles.chartLabel, { color: colors.mutedForeground }]}>Now</Text>
          </View>
        </View>

        <View style={[styles.orderBookCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Order Book</Text>
          <View style={styles.obHeader}>
            <Text style={[styles.obHeaderText, { color: colors.mutedForeground }]}>Price (USD)</Text>
            <Text style={[styles.obHeaderText, { color: colors.mutedForeground }]}>Amount ({selectedAsset.symbol})</Text>
            <Text style={[styles.obHeaderText, { color: colors.mutedForeground, textAlign: "right" }]}>Total</Text>
          </View>
          {orderBook.asks.map((ask, i) => (
            <View key={`ask-${i}`} style={styles.obRow}>
              <View style={[styles.obBar, { right: 0, width: `${(ask.amount / maxAsks) * 100}%`, backgroundColor: "rgba(255,68,68,0.08)" }]} />
              <Text style={[styles.obPrice, { color: "#FF4444" }]}>{ask.price.toLocaleString()}</Text>
              <Text style={[styles.obAmount, { color: colors.foreground }]}>{ask.amount}</Text>
              <Text style={[styles.obTotal, { color: colors.mutedForeground }]}>${ask.total.toLocaleString()}</Text>
            </View>
          ))}
          <View style={[styles.obSpread, { borderColor: colors.border }]}>
            <Text style={[styles.obSpreadText, { color: colors.primary }]}>${selectedAsset.price.toLocaleString()}</Text>
            <Text style={[styles.obSpreadLabel, { color: colors.mutedForeground }]}>Spread</Text>
          </View>
          {orderBook.bids.map((bid, i) => (
            <View key={`bid-${i}`} style={styles.obRow}>
              <View style={[styles.obBar, { right: 0, width: `${(bid.amount / maxBids) * 100}%`, backgroundColor: "rgba(0,255,136,0.08)" }]} />
              <Text style={[styles.obPrice, { color: "#00FF88" }]}>{bid.price.toLocaleString()}</Text>
              <Text style={[styles.obAmount, { color: colors.foreground }]}>{bid.amount}</Text>
              <Text style={[styles.obTotal, { color: colors.mutedForeground }]}>${bid.total.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.tradeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.sideToggle, { backgroundColor: colors.background }]}>
            {(["buy", "sell"] as OrderSide[]).map((s) => (
              <TouchableOpacity
                key={s}
                activeOpacity={0.8}
                onPress={() => { hapticSelection(); setSide(s); setAmount(""); }}
                style={[
                  styles.sideBtn,
                  side === s && {
                    backgroundColor: s === "buy" ? "rgba(0,255,136,0.15)" : "rgba(255,68,68,0.15)",
                  },
                ]}
              >
                <Text style={[
                  styles.sideBtnText,
                  { color: side === s ? (s === "buy" ? "#00FF88" : "#FF4444") : colors.mutedForeground },
                ]}>
                  {s === "buy" ? "Buy" : "Sell"} {selectedAsset.symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
            {side === "buy" ? `Amount (${selectedAsset.symbol})` : `Amount (${selectedAsset.symbol})`}
          </Text>
          <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
            />
            <Text style={[styles.inputSuffix, { color: colors.mutedForeground }]}>{selectedAsset.symbol}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {quickAmounts.map((q) => (
              <TouchableOpacity
                key={q}
                activeOpacity={0.8}
                onPress={() => {
                  hapticLight();
                  if (side === "buy") {
                    const qty = q / selectedAsset.price;
                    setAmount(qty.toFixed(6));
                  } else {
                    setAmount(String(q));
                  }
                }}
                style={[styles.quickBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <Text style={[styles.quickBtnText, { color: colors.primary }]}>
                  {side === "buy" ? `$${q}` : q}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {numAmount > 0 && (
            <View style={[styles.summaryBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Price</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>${selectedAsset.price.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>${totalCost.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Fee (0.1%)</Text>
                <Text style={[styles.summaryValue, { color: colors.mutedForeground }]}>${fee.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryDivider, { borderColor: colors.border }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {side === "buy" ? "Total Cost" : "You Receive"}
                </Text>
                <Text style={[styles.summaryValue, { color: side === "buy" ? "#FF4444" : "#00FF88", fontFamily: "Inter_700Bold" }]}>
                  ${grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={loading || numAmount <= 0}
            onPress={handleTrade}
            style={[
              styles.tradeBtn,
              {
                backgroundColor: side === "buy" ? "#00FF88" : "#FF4444",
                opacity: loading || numAmount <= 0 ? 0.5 : 1,
              },
            ]}
          >
            <Text style={[styles.tradeBtnText, { color: side === "buy" ? "#0A1428" : "#FFFFFF" }]}>
              {loading ? "Processing..." : `${side === "buy" ? "Buy" : "Sell"} ${selectedAsset.symbol}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  balanceLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },

  assetSelector: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  assetIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  assetIconText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  assetName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  assetSymbol: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  assetPrice: { fontSize: 15, fontFamily: "Inter_700Bold" },
  assetChange: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 2 },

  assetList: { borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: "hidden" },
  assetListItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  assetIconSm: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  assetListName: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  assetListPrice: { fontSize: 13, fontFamily: "Inter_500Medium" },
  assetListChange: { fontSize: 12, fontFamily: "Inter_600SemiBold", width: 50, textAlign: "right" },

  chartCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  chartTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  liveDot: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  chartLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  chartLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },

  orderBookCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  obHeader: { flexDirection: "row", paddingBottom: 8 },
  obHeaderText: { flex: 1, fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  obRow: { flexDirection: "row", paddingVertical: 4, position: "relative" },
  obBar: { position: "absolute", top: 0, bottom: 0, borderRadius: 2 },
  obPrice: { flex: 1, fontSize: 12, fontFamily: "Inter_600SemiBold" },
  obAmount: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  obTotal: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "right" },
  obSpread: { borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 8, marginVertical: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  obSpreadText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  obSpreadLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },

  tradeCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  sideToggle: { flexDirection: "row", borderRadius: 10, padding: 4, gap: 4, marginBottom: 16 },
  sideBtn: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  sideBtnText: { fontSize: 14, fontFamily: "Inter_700Bold" },

  inputLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold", paddingVertical: 14 },
  inputSuffix: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  quickRow: { gap: 8, paddingVertical: 12 },
  quickBtn: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 },
  quickBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  summaryBox: { borderRadius: 10, borderWidth: 1, padding: 14, gap: 8, marginBottom: 14 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  summaryDivider: { borderTopWidth: 1, marginVertical: 4 },

  tradeBtn: { borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  tradeBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
