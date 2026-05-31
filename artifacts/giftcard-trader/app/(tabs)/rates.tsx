import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import Svg, { Path, Polyline, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { useLivePrices } from "@/hooks/useLivePrices";

const { width: W } = Dimensions.get("window");
const CHART_H = 120;

type CryptoId = "BTC" | "ETH" | "SOL" | "BNB" | "ADA" | "XRP";
type Side = "buy" | "sell";

const ASSETS: { symbol: CryptoId; name: string; price: number; change: number; chart: number[] }[] = [
  { symbol: "BTC",  name: "Bitcoin",  price: 45200,    change: 2.41,  chart: [40,42,38,44,41,46,43,48,45,50,47,52,49,54,51,56,53,58,55,57] },
  { symbol: "ETH",  name: "Ethereum", price: 2860,     change: -1.22, chart: [55,53,57,51,55,49,53,47,51,45,49,43,47,41,45,39,43,41,44,42] },
  { symbol: "SOL",  name: "Solana",   price: 142,      change: 5.82,  chart: [30,33,31,36,34,38,36,41,39,44,42,46,44,48,46,50,48,52,50,53] },
  { symbol: "BNB",  name: "BNB",      price: 312,      change: 1.12,  chart: [44,46,43,47,45,48,46,49,47,50,48,51,49,52,50,53,51,54,52,54] },
  { symbol: "ADA",  name: "Cardano",  price: 0.46,     change: -2.1,  chart: [55,53,56,51,54,49,52,47,50,45,48,43,46,41,44,39,42,40,43,41] },
  { symbol: "XRP",  name: "Ripple",   price: 0.62,     change: -0.52, chart: [48,47,49,46,48,45,47,44,46,43,45,42,44,41,43,40,42,41,43,42] },
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

function CryptoIcon({ symbol, size = 32 }: { symbol: string; size?: number }) {
  const [err, setErr] = useState(false);
  const COLORS: Record<string, string> = { BTC: "#F7931A", ETH: "#627EEA", SOL: "#9945FF", BNB: "#F3BA2F", ADA: "#0033AD", XRP: "#23292F" };
  const c = COLORS[symbol] ?? "#888";
  if (err) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${c}33`, alignItems: "center", justifyContent: "center" }}>
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
  const cW = W - 40;
  const step = cW / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${CHART_H - ((v - min) / range) * CHART_H}`).join(" ");
  const color = positive ? "#00C48C" : "#FF3B30";
  return (
    <Svg width={cW} height={CHART_H + 8}>
      <Polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];

export default function TradeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 60 : insets.top;

  const { usdBalance, updateUsdBalance, updateAsset, assets, addTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const { prices, loading: pricesLoading, lastUpdated } = useLivePrices();

  const [selected, setSelected] = useState<CryptoId>("BTC");
  const [side, setSide] = useState<Side>("buy");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const liveAssets = useMemo(() =>
    ASSETS.map((a) => ({
      ...a,
      price: prices[a.symbol]?.price ?? a.price,
      change: prices[a.symbol]?.change ?? a.change,
    })),
    [prices]
  );

  const asset = liveAssets.find((a) => a.symbol === selected)!;
  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * 0.005;
  const networkFee = numAmount > 0 ? 1.5 : 0;
  const total = side === "buy" ? numAmount + fee + networkFee : numAmount - fee - networkFee;
  const cryptoQty = numAmount / asset.price;
  const isValid = numAmount >= 1;
  const positive = asset.change >= 0;

  const handleTrade = useCallback(async () => {
    if (!isValid) { hapticError(); return; }
    if (side === "buy" && total > usdBalance) {
      hapticError();
      Alert.alert("Insufficient Balance", "You don't have enough USD in your wallet.");
      return;
    }
    setLoading(true);
    hapticMedium();
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    if (side === "buy") {
      updateUsdBalance(-total);
      addTransaction({ type: "crypto", category: "Crypto", title: `${asset.name} Purchase`, amount: total, currency: "USD", status: "success", date: "Just now", direction: "out" });
      addNotification({ title: "Order Filled", message: `Bought ${cryptoQty.toFixed(6)} ${asset.symbol} for $${total.toFixed(2)}`, type: "success", time: "Just now" });
    } else {
      const walletAsset = assets.find((a) => a.symbol === asset.symbol);
      if (walletAsset) {
        const ppq = walletAsset.balance > 0 ? walletAsset.value / walletAsset.balance : 0;
        updateAsset(walletAsset.id, { balance: Math.max(0, walletAsset.balance - cryptoQty), value: Math.max(0, walletAsset.value - cryptoQty * ppq) });
      }
      updateUsdBalance(total);
      addTransaction({ type: "crypto", category: "Crypto", title: `${asset.name} Sale`, amount: total, currency: "USD", status: "success", date: "Just now", direction: "in" });
      addNotification({ title: "Order Filled", message: `Sold ${cryptoQty.toFixed(6)} ${asset.symbol} for $${total.toFixed(2)}`, type: "success", time: "Just now" });
    }
    hapticSuccess();
    setAmount("");
    Alert.alert("Order Complete", `${side === "buy" ? "Bought" : "Sold"} ${cryptoQty.toFixed(6)} ${asset.symbol} for $${total.toFixed(2)}`);
  }, [isValid, side, total, usdBalance, asset, cryptoQty, updateUsdBalance, updateAsset, assets, addTransaction, addNotification]);

  const orderBookForDisplay = useMemo(() => ({
    asks: ORDER_BOOK.asks.map((r) => ({ ...r, price: side === "buy" ? asset.price * (1 + r.depth * 0.002) : r.price })),
    bids: ORDER_BOOK.bids.map((r) => ({ ...r, price: side === "buy" ? asset.price * (1 - r.depth * 0.002) : r.price })),
  }), [asset.price, side]);

  const spread = orderBookForDisplay.asks[orderBookForDisplay.asks.length - 1].price - orderBookForDisplay.bids[0].price;

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#07070F", "#0C0C1E", "#070714"]} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>Trade</Text>
        <View style={[styles.liveChip]}>
          {pricesLoading ? (
            <ActivityIndicator size={8} color="#00C48C" style={{ marginRight: 2 }} />
          ) : (
            <View style={styles.liveDot} />
          )}
          <Text style={styles.liveTxt}>
            {lastUpdated
              ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "LIVE"}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assetChips}>
          {liveAssets.map((a) => {
            const active = a.symbol === selected;
            return (
              <TouchableOpacity
                key={a.symbol}
                onPress={() => { hapticLight(); setSelected(a.symbol as CryptoId); setAmount(""); }}
                activeOpacity={0.8}
                style={[styles.assetChip, active && styles.assetChipActive]}
              >
                <CryptoIcon symbol={a.symbol} size={22} />
                <View>
                  <Text style={[styles.chipSym, active && styles.chipSymActive]}>{a.symbol}</Text>
                  <Text style={[styles.chipChange, { color: a.change >= 0 ? "#00C48C" : "#FF3B30" }]}>
                    {a.change >= 0 ? "+" : ""}{a.change}%
                  </Text>
                </View>
                {active && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.priceBlock}>
          <View style={styles.priceLeft}>
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.priceVal}>${asset.price.toLocaleString()}</Text>
            <View style={[styles.changeBadge, { backgroundColor: positive ? "rgba(0,196,140,0.15)" : "rgba(255,59,48,0.15)" }]}>
              <Feather name={positive ? "trending-up" : "trending-down"} size={12} color={positive ? "#00C48C" : "#FF3B30"} />
              <Text style={[styles.changeText, { color: positive ? "#00C48C" : "#FF3B30" }]}>
                {positive ? "+" : ""}{asset.change}%
              </Text>
            </View>
          </View>
          <View style={styles.priceStats}>
            {[
              { label: "24h High", value: `$${(asset.price * 1.025).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
              { label: "24h Low",  value: `$${(asset.price * 0.975).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
              { label: "Volume",   value: "14.2K" },
            ].map(({ label, value }) => (
              <View key={label}>
                <Text style={styles.statLbl}>{label}</Text>
                <Text style={styles.statVal}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.chartWrap}>
          <PriceChart data={asset.chart} positive={positive} />
        </View>

        <View style={styles.buySellToggle}>
          {(["buy", "sell"] as Side[]).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => { hapticLight(); setSide(s); }}
              activeOpacity={0.8}
              style={[styles.sideBtn, side === s && (s === "buy" ? styles.sideBuyActive : styles.sideSellActive)]}
            >
              <Text style={[styles.sideBtnTxt, side === s && styles.sideBtnTxtActive]}>
                {s === "buy" ? "Buy" : "Sell"} {asset.symbol}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.balancePill}>
          <Feather name="credit-card" size={13} color="rgba(255,255,255,0.5)" />
          <Text style={styles.balanceTxt}>USD Wallet · ${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.amountWrap}>
          <Text style={styles.prefix}>$</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.2)"
            keyboardType="numeric"
            style={styles.amountInput}
          />
        </View>
        {numAmount > 0 && (
          <Text style={styles.cryptoEquiv}>≈ {cryptoQty.toFixed(6)} {asset.symbol}</Text>
        )}

        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => { hapticLight(); setAmount(String(v)); }}
              activeOpacity={0.8}
              style={[styles.quickBtn, numAmount === v && styles.quickBtnActive]}
            >
              <Text style={[styles.quickTxt, numAmount === v && styles.quickTxtActive]}>${v}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.feeCard}>
          {[
            { label: "Amount",      value: `$${numAmount.toFixed(2)}` },
            { label: "Service Fee", value: () => `-$${(numAmount * 0.005).toFixed(2)}`, warn: true },
            { label: "Network Fee", value: () => `-$${networkFee.toFixed(2)}`, warn: true },
            { label: `Total ${side === "buy" ? "Cost" : "Payout"}`, value: () => `$${total.toFixed(2)}`, highlight: true },
          ].map((row) => (
            <View key={row.label} style={styles.feeRow}>
              <Text style={styles.feeLbl}>{row.label}</Text>
              <Text style={[
                styles.feeVal,
                (row as any).highlight && styles.feeHighlight,
                (row as any).warn && styles.feeWarn,
              ]}>
                {typeof row.value === "function" ? row.value() : row.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.orderBook}>
          <Text style={styles.obTitle}>Order Book</Text>
          <View style={styles.obRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.obHeader}>ASK (Sell)</Text>
              {orderBookForDisplay.asks.map((r, i) => (
                <View key={i} style={styles.obLine}>
                  <View style={[styles.obDepth, { width: `${r.depth * 100}%` as any, backgroundColor: "rgba(255,59,48,0.15)" }]} />
                  <Text style={[styles.obPrice, { color: "#FF3B30" }]}>${r.price.toFixed(0)}</Text>
                  <Text style={styles.obSize}>{r.size.toFixed(4)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.obSpread}>
              <Text style={styles.obSpreadTxt}>${spread.toFixed(0)}</Text>
              <Text style={styles.obSpreadLbl}>SPREAD</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.obHeader, { textAlign: "right" }]}>BID (Buy)</Text>
              {orderBookForDisplay.bids.map((r, i) => (
                <View key={i} style={[styles.obLine, { justifyContent: "flex-end" }]}>
                  <Text style={styles.obSize}>{r.size.toFixed(4)}</Text>
                  <Text style={[styles.obPrice, { color: "#00C48C" }]}>${r.price.toFixed(0)}</Text>
                  <View style={[styles.obDepth, { width: `${r.depth * 100}%` as any, backgroundColor: "rgba(0,196,140,0.15)", left: undefined, right: 0 }]} />
                </View>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleTrade}
          disabled={!isValid || loading}
          activeOpacity={0.82}
          style={[styles.ctaBtn, side === "buy" ? styles.ctaBuy : styles.ctaSell, (!isValid || loading) && styles.ctaDisabled]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.ctaTxt}>{side === "buy" ? `Buy ${asset.symbol}` : `Sell ${asset.symbol}`}{isValid ? ` · $${total.toFixed(2)}` : ""}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>Prices are indicative. Service fees apply. 0.5% fee on all trades.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#07070F" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14,
  },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  liveChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(0,196,140,0.15)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00C48C" },
  liveTxt: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#00C48C", letterSpacing: 0.5 },
  content: { paddingBottom: 100 },
  assetChips: { paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  assetChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  assetChipActive: { backgroundColor: "rgba(26,90,255,0.2)", borderColor: "#1A5AFF" },
  chipSym: { fontSize: 13, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.5)" },
  chipSymActive: { color: "#FFFFFF" },
  chipChange: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  activeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#1A5AFF", position: "absolute", bottom: 6, right: 10 },
  priceBlock: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 20, marginBottom: 16, gap: 20 },
  priceLeft: { gap: 6 },
  assetName: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.5)" },
  priceVal: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  changeBadge: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  changeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  priceStats: { flex: 1, gap: 10, paddingTop: 4 },
  statLbl: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" },
  statVal: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#FFFFFF", marginTop: 1 },
  chartWrap: { paddingHorizontal: 20, marginBottom: 20 },
  buySellToggle: {
    flexDirection: "row", marginHorizontal: 20, backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14, padding: 4, marginBottom: 14,
  },
  sideBtn: { flex: 1, paddingVertical: 12, borderRadius: 11, alignItems: "center" },
  sideBuyActive: { backgroundColor: "#00C48C" },
  sideSellActive: { backgroundColor: "#FF3B30" },
  sideBtnTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.4)" },
  sideBtnTxtActive: { color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  balancePill: {
    flexDirection: "row", alignItems: "center", gap: 7,
    marginHorizontal: 20, backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, marginBottom: 12,
  },
  balanceTxt: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.5)" },
  amountWrap: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 20, backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14, paddingHorizontal: 18, height: 68, marginBottom: 6,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  prefix: { fontSize: 28, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.4)", marginRight: 6 },
  amountInput: { flex: 1, fontSize: 32, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  cryptoEquiv: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)", paddingHorizontal: 20, marginBottom: 14 },
  quickAmounts: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 20 },
  quickBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", backgroundColor: "rgba(255,255,255,0.07)" },
  quickBtnActive: { backgroundColor: "rgba(26,90,255,0.3)", borderWidth: 1, borderColor: "#1A5AFF" },
  quickTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.45)" },
  quickTxtActive: { color: "#FFFFFF" },
  feeCard: { marginHorizontal: 20, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, gap: 2, marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  feeRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.06)" },
  feeLbl: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)" },
  feeVal: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  feeHighlight: { color: "#1A5AFF", fontFamily: "Inter_700Bold" },
  feeWarn: { color: "rgba(255,149,0,0.9)" },
  orderBook: { marginHorizontal: 20, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  obTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.7)", marginBottom: 12 },
  obRow: { flexDirection: "row", gap: 8 },
  obHeader: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.35)", marginBottom: 8, textTransform: "uppercase" },
  obLine: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 5, position: "relative", overflow: "hidden" },
  obDepth: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 2 },
  obPrice: { fontSize: 12, fontFamily: "Inter_600SemiBold", zIndex: 1 },
  obSize: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)", zIndex: 1 },
  obSpread: { width: 52, alignItems: "center", justifyContent: "center" },
  obSpreadTxt: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#1A5AFF" },
  obSpreadLbl: { fontSize: 8, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.3)", letterSpacing: 0.5 },
  ctaBtn: { marginHorizontal: 20, height: 58, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  ctaBuy: { backgroundColor: "#00C48C" },
  ctaSell: { backgroundColor: "#FF3B30" },
  ctaDisabled: { opacity: 0.35 },
  ctaTxt: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.25)", textAlign: "center", paddingHorizontal: 20 },
});
