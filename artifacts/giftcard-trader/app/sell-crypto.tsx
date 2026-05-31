import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Image,
} from "react-native";
import { FocusedModal } from "@/components/FocusedModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { hapticSuccess, hapticError, hapticSelection } from "@/utils/haptics";
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

interface Crypto {
  id: CryptoId;
  name: string;
  symbol: string;
  price: number;
  change: number;
  balance: number;
  color: string;
}

const CRYPTOS: Crypto[] = [
  { id: "btc",  name: "Bitcoin",  symbol: "BTC",  price: 42500.50, change: -2.45, balance: 0.5,   color: "#F7931A" },
  { id: "eth",  name: "Ethereum", symbol: "ETH",  price: 2850,     change: 3.12,  balance: 4.125, color: "#627EEA" },
  { id: "usdt", name: "Tether",   symbol: "USDT", price: 1.0,      change: 0.01,  balance: 2500,  color: "#26A17B" },
  { id: "sol",  name: "Solana",   symbol: "SOL",  price: 142,      change: 5.8,   balance: 18.5,  color: "#9945FF" },
  { id: "xrp",  name: "Ripple",   symbol: "XRP",  price: 0.62,     change: -0.5,  balance: 3200,  color: "#23292F" },
  { id: "bnb",  name: "BNB",      symbol: "BNB",  price: 312,      change: 1.1,   balance: 2.8,   color: "#F3BA2F" },
];

const FEE_RATE = 0.001;

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

export default function SellCryptoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const { updateUsdBalance, updateAsset, assets, addTransaction } = useWallet();
  const { addNotification } = useNotifications();

  const [selectedCrypto, setSelectedCrypto] = useState<CryptoId>("btc");
  const [amount, setAmount] = useState("");
  const [fiatValue, setFiatValue] = useState("0.00");
  const [isMarket, setIsMarket] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txStatus, setTxStatus] = useState<"pending" | "success" | "failed">("pending");

  const crypto = CRYPTOS.find((c) => c.id === selectedCrypto)!;

  const handleAmountChange = useCallback((text: string) => {
    setAmount(text);
    const num = parseFloat(text) || 0;
    setFiatValue((num * crypto.price).toFixed(2));
  }, [crypto.price]);

  const getFee = useCallback(() => {
    return (parseFloat(fiatValue) * FEE_RATE).toFixed(2);
  }, [fiatValue]);

  const getTotalPayout = useCallback(() => {
    const val = parseFloat(fiatValue);
    const fee = parseFloat(getFee());
    return (val - fee).toFixed(2);
  }, [fiatValue, getFee]);

  const handleSell = useCallback(() => {
    const numAmount = parseFloat(amount) || 0;
    if (!amount || numAmount <= 0) {
      hapticError();
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (numAmount > crypto.balance) {
      hapticError();
      Alert.alert("Insufficient Balance", `You only have ${crypto.balance} ${crypto.symbol} available.`);
      return;
    }
    setShowModal(true);
    setIsProcessing(true);
    setTxStatus("pending");

    setTimeout(() => {
      const payout = parseFloat(getTotalPayout());
      updateUsdBalance(payout);

      const walletAsset = assets.find((a) => a.symbol === crypto.symbol);
      if (walletAsset) {
        const pricePerUnit = walletAsset.balance > 0 ? walletAsset.value / walletAsset.balance : 0;
        updateAsset(walletAsset.id, {
          balance: Math.max(0, walletAsset.balance - numAmount),
          value: Math.max(0, walletAsset.value - numAmount * pricePerUnit),
        });
      }

      addTransaction({
        type: "crypto", category: "Crypto",
        title: `${crypto.name} Sold`,
        amount: payout, currency: "USD",
        status: "success", date: "Just now", direction: "in",
      });
      addNotification({
        title: "Crypto Sold",
        message: `Sold ${numAmount} ${crypto.symbol} for $${payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
        type: "success", time: "Just now",
      });

      hapticSuccess();
      setTxStatus("success");
      setIsProcessing(false);
    }, 2000);
  }, [amount, crypto, getTotalPayout, updateUsdBalance, updateAsset, assets, addTransaction, addNotification]);

  const handlePercentage = useCallback((pct: number) => {
    const val = (crypto.balance * pct).toFixed(pct === 1 ? 4 : 6);
    setAmount(val);
    setFiatValue((parseFloat(val) * crypto.price).toFixed(2));
  }, [crypto.balance, crypto.price]);

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: C.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: C.surface }]}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color={C.fg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sell Crypto</Text>
        <View style={[styles.iconBtn, { backgroundColor: C.surface }]}>
          <Feather name="trending-down" size={18} color={C.muted} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        <View style={[styles.balanceCard, { backgroundColor: C.surface }]}>
          <View style={styles.balanceTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.balanceLbl, { color: C.muted }]}>Available Balance</Text>
              <View style={styles.balanceAmtRow}>
                <CryptoIcon symbol={crypto.symbol} size={28} />
                <Text style={[styles.balanceAmt, { color: C.fg }]}>{crypto.balance} {crypto.symbol}</Text>
              </View>
              <Text style={[styles.balanceFiat, { color: C.muted }]}>
                ≈ ${(crypto.balance * crypto.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handlePercentage(1)}
              style={[styles.maxBtn, { backgroundColor: C.bg, borderColor: C.border }]}
            >
              <Text style={[styles.maxBtnText, { color: C.accent }]}>MAX</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.muted }]}>Asset</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {CRYPTOS.map((c) => {
              const active = c.id === selectedCrypto;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    hapticSelection();
                    setSelectedCrypto(c.id);
                    setAmount("");
                    setFiatValue("0.00");
                  }}
                  activeOpacity={0.8}
                  style={[styles.chip, {
                    backgroundColor: active ? "#EBF0FF" : C.surface,
                    borderColor: active ? C.accent : "transparent",
                    borderWidth: active ? 1.5 : 0,
                  }]}
                >
                  <CryptoIcon symbol={c.symbol} size={26} />
                  <View>
                    <Text style={[styles.chipSymbol, { color: active ? C.accent : C.fg }]}>{c.symbol}</Text>
                    <Text style={[styles.chipBalance, { color: C.muted }]}>{c.balance}</Text>
                  </View>
                  {active && <Feather name="check" size={12} color={C.accent} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.sectionLabel, { color: C.muted }]}>Current Price</Text>
              <Text style={[styles.priceVal, { color: C.fg }]}>${crypto.price.toLocaleString()}</Text>
            </View>
            <View style={[styles.changeBadge, { backgroundColor: crypto.change >= 0 ? "#EBF9F3" : "#FFF2F0" }]}>
              <Feather name={crypto.change >= 0 ? "trending-up" : "trending-down"} size={14} color={crypto.change >= 0 ? C.success : C.error} />
              <Text style={[styles.changeText, { color: crypto.change >= 0 ? C.success : C.error }]}>
                {crypto.change > 0 ? "+" : ""}{crypto.change}%
              </Text>
            </View>
          </View>

          <View style={[styles.sparklineWrap, { backgroundColor: C.surface }]}>
            <View style={styles.sparklineInner}>
              {[60, 45, 70, 55, 80, 65, 90, 75, 85, 70, 95, 80, 100].map((h, i) => (
                <View key={i} style={[styles.sparkBar, { height: h * 0.5, backgroundColor: i === 12 ? C.success : `rgba(0,196,140,${0.15 + (h / 100) * 0.5})` }]} />
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.orderTypePill, { backgroundColor: C.surface }]}>
          {[{ label: "Market", val: true }, { label: "Limit", val: false }].map(({ label, val }) => (
            <TouchableOpacity
              key={label}
              onPress={() => { hapticSelection(); setIsMarket(val); }}
              activeOpacity={0.8}
              style={[styles.orderTypeBtn, isMarket === val && { backgroundColor: C.bg }]}
            >
              <Text style={[styles.orderTypeTxt, { color: isMarket === val ? C.fg : C.muted, fontFamily: isMarket === val ? "Inter_700Bold" : "Inter_400Regular" }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.swapBlock}>
          <View>
            <Text style={[styles.sectionLabel, { color: C.muted }]}>You Sell</Text>
            <View style={[styles.amountRow, { backgroundColor: C.surface }]}>
              <TextInput
                style={[styles.amountInput, { color: C.fg }]}
                placeholder="0.00"
                placeholderTextColor={C.muted}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
              />
              <View style={[styles.assetTag, { backgroundColor: C.bg }]}>
                <CryptoIcon symbol={crypto.symbol} size={18} />
                <Text style={[styles.assetTagTxt, { color: C.fg }]}>{crypto.symbol}</Text>
              </View>
            </View>
          </View>

          <View style={styles.pctRow}>
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <TouchableOpacity
                key={pct}
                onPress={() => handlePercentage(pct)}
                activeOpacity={0.8}
                style={[styles.pctBtn, { backgroundColor: C.surface }]}
              >
                <Text style={[styles.pctBtnTxt, { color: C.muted }]}>
                  {pct === 1 ? "Max" : `${pct * 100}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.arrowWrap}>
            <View style={[styles.arrowCircle, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Feather name="arrow-down" size={16} color={C.muted} />
            </View>
          </View>

          <View>
            <Text style={[styles.sectionLabel, { color: C.muted }]}>You Receive</Text>
            <View style={[styles.amountRow, { backgroundColor: C.surface }]}>
              <TextInput
                style={[styles.amountInput, { color: C.fg }]}
                placeholder="0.00"
                placeholderTextColor={C.muted}
                value={fiatValue}
                editable={false}
              />
              <View style={[styles.assetTag, { backgroundColor: C.bg }]}>
                <Text style={[styles.assetTagTxt, { color: C.fg }]}>USD</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: C.surface }]}>
          {[
            { label: "Rate",        value: `1 ${crypto.symbol} ≈ $${crypto.price.toLocaleString()}` },
            { label: "Fee (0.1%)",  value: `$${getFee()}` },
          ].map(({ label, value }) => (
            <View key={label} style={styles.summaryRow}>
              <Text style={[styles.summaryLbl, { color: C.muted }]}>{label}</Text>
              <Text style={[styles.summaryVal, { color: C.fg }]}>{value}</Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: C.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLbl, { color: C.fg, fontFamily: "Inter_700Bold" }]}>Total Payout</Text>
            <Text style={[styles.payoutVal, { color: C.success }]}>${getTotalPayout()}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSell}
          activeOpacity={0.82}
          style={styles.sellBtn}
        >
          <Text style={styles.sellBtnTxt}>Sell Now</Text>
        </TouchableOpacity>
      </ScrollView>

      <FocusedModal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: C.bg, borderTopColor: C.border }]}>
            <View style={[styles.modalHandle, { backgroundColor: C.border }]} />
            <Text style={[styles.modalTitle, { color: C.fg }]}>Transaction Summary</Text>

            {isProcessing ? (
              <View style={styles.processingWrap}>
                <ActivityIndicator size="large" color={C.accent} />
                <Text style={[styles.processingTxt, { color: C.muted }]}>Processing transaction...</Text>
              </View>
            ) : (
              <>
                {txStatus === "success" && (
                  <View style={styles.successWrap}>
                    <View style={[styles.successIcon, { backgroundColor: "#EBF9F3" }]}>
                      <Feather name="check-circle" size={32} color={C.success} />
                    </View>
                    <Text style={[styles.successTxt, { color: C.success }]}>Order Completed</Text>
                  </View>
                )}

                <View style={styles.txDetails}>
                  {[
                    { label: "Sold",   value: `${amount} ${crypto.symbol}` },
                    { label: "Rate",   value: `$${crypto.price.toLocaleString()}` },
                    { label: "Fees",   value: `$${getFee()}` },
                  ].map(({ label, value }) => (
                    <View key={label} style={styles.txRow}>
                      <Text style={[styles.txLbl, { color: C.muted }]}>{label}</Text>
                      <Text style={[styles.txVal, { color: C.fg }]}>{value}</Text>
                    </View>
                  ))}
                  <View style={[styles.divider, { backgroundColor: C.border }]} />
                  <View style={styles.txRow}>
                    <Text style={[styles.txLbl, { color: C.fg, fontFamily: "Inter_700Bold" }]}>Total</Text>
                    <Text style={[styles.txPayoutVal, { color: C.success }]}>${getTotalPayout()}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    setAmount("");
                    setFiatValue("0.00");
                  }}
                  activeOpacity={0.82}
                  style={styles.doneBtn}
                >
                  <Text style={styles.doneBtnTxt}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
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
  content: { padding: 20, gap: 20 },
  balanceCard: { borderRadius: 16, padding: 18 },
  balanceTop: { flexDirection: "row", alignItems: "flex-start" },
  balanceLbl: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  balanceAmtRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  balanceAmt: { fontSize: 22, fontFamily: "Inter_700Bold" },
  balanceFiat: { fontSize: 13, fontFamily: "Inter_400Regular" },
  maxBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  maxBtnText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  section: { gap: 10 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8 },
  chipRow: { gap: 8, paddingRight: 4 },
  chip: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  chipSymbol: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  chipBalance: { fontSize: 10, fontFamily: "Inter_400Regular" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  priceVal: { fontSize: 24, fontFamily: "Inter_700Bold", marginTop: 4 },
  changeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  changeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sparklineWrap: { height: 72, borderRadius: 12, overflow: "hidden" },
  sparklineInner: { flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 3, paddingHorizontal: 12, paddingBottom: 10 },
  sparkBar: { flex: 1, borderRadius: 3, minWidth: 6 },
  orderTypePill: { flexDirection: "row", borderRadius: 12, padding: 4 },
  orderTypeBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center" },
  orderTypeTxt: { fontSize: 14 },
  swapBlock: { gap: 12 },
  amountRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 16, height: 64 },
  amountInput: { flex: 1, fontSize: 24, fontFamily: "Inter_600SemiBold" },
  assetTag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  assetTagTxt: { fontSize: 14, fontFamily: "Inter_700Bold" },
  pctRow: { flexDirection: "row", gap: 8 },
  pctBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: "center" },
  pctBtnTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  arrowWrap: { alignItems: "center" },
  arrowCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  summaryCard: { borderRadius: 16, padding: 18, gap: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLbl: { fontSize: 14, fontFamily: "Inter_400Regular" },
  summaryVal: { fontSize: 14, fontFamily: "Inter_500Medium" },
  payoutVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  divider: { height: 1 },
  sellBtn: { height: 56, borderRadius: 16, backgroundColor: "#1C1C1E", alignItems: "center", justifyContent: "center" },
  sellBtnTxt: { color: "#FFFFFF", fontSize: 17, fontFamily: "Inter_700Bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, borderTopWidth: StyleSheet.hairlineWidth, minHeight: 380 },
  modalHandle: { width: 44, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 24 },
  processingWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 48, gap: 16 },
  processingTxt: { fontSize: 14, fontFamily: "Inter_400Regular" },
  successWrap: { alignItems: "center", gap: 10, marginBottom: 24 },
  successIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  successTxt: { fontSize: 18, fontFamily: "Inter_700Bold" },
  txDetails: { gap: 14, marginBottom: 28 },
  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  txLbl: { fontSize: 14, fontFamily: "Inter_400Regular" },
  txVal: { fontSize: 14, fontFamily: "Inter_500Medium" },
  txPayoutVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  doneBtn: { height: 54, borderRadius: 14, backgroundColor: "#1C1C1E", alignItems: "center", justifyContent: "center" },
  doneBtnTxt: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_700Bold" },
});
