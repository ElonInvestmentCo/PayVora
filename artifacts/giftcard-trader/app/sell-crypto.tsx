import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Platform, StyleSheet, Image,
} from "react-native";
import { FocusedModal } from "@/components/FocusedModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { hapticSuccess, hapticError, hapticLight } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import Svg, { Path } from "react-native-svg";

type CryptoId = "btc" | "eth" | "usdt" | "sol" | "xrp" | "bnb";

const CRYPTOS = [
  { id: "btc",  name: "Bitcoin",  symbol: "BTC",  price: 42500, change: -2.45, balance: 0.5,   color: "#F7931A" },
  { id: "eth",  name: "Ethereum", symbol: "ETH",  price: 2850,  change: 3.12,  balance: 4.125, color: "#627EEA" },
  { id: "usdt", name: "Tether",   symbol: "USDT", price: 1.0,   change: 0.01,  balance: 2500,  color: "#26A17B" },
  { id: "sol",  name: "Solana",   symbol: "SOL",  price: 142,   change: 5.8,   balance: 18.5,  color: "#9945FF" },
  { id: "xrp",  name: "Ripple",   symbol: "XRP",  price: 0.62,  change: -0.5,  balance: 3200,  color: "#23292F" },
  { id: "bnb",  name: "BNB",      symbol: "BNB",  price: 312,   change: 1.1,   balance: 2.8,   color: "#F3BA2F" },
];

const FEE_RATE = 0.001;

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

export default function SellCryptoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

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

  const getFee = useCallback(() => (parseFloat(fiatValue) * FEE_RATE).toFixed(2), [fiatValue]);
  const getTotalPayout = useCallback(() => {
    const val = parseFloat(fiatValue);
    return (val - parseFloat(getFee())).toFixed(2);
  }, [fiatValue, getFee]);

  const handlePercentage = useCallback((pct: number) => {
    const val = (crypto.balance * pct).toFixed(pct === 1 ? 4 : 6);
    setAmount(val);
    setFiatValue((parseFloat(val) * crypto.price).toFixed(2));
  }, [crypto.balance, crypto.price]);

  const handleSell = useCallback(() => {
    const numAmount = parseFloat(amount) || 0;
    if (!amount || numAmount <= 0) { hapticError(); Alert.alert("Invalid Amount", "Please enter a valid amount."); return; }
    if (numAmount > crypto.balance) { hapticError(); Alert.alert("Insufficient Balance", `You only have ${crypto.balance} ${crypto.symbol} available.`); return; }
    hapticLight();
    setShowModal(true);
    setIsProcessing(true);
    setTxStatus("pending");

    setTimeout(() => {
      const payout = parseFloat(getTotalPayout());
      updateUsdBalance(payout);
      const walletAsset = assets.find((a) => a.symbol === crypto.symbol);
      if (walletAsset) {
        const pricePerUnit = walletAsset.balance > 0 ? walletAsset.value / walletAsset.balance : 0;
        updateAsset(walletAsset.id, { balance: Math.max(0, walletAsset.balance - numAmount), value: Math.max(0, walletAsset.value - numAmount * pricePerUnit) });
      }
      addTransaction({ type: "crypto", category: "Crypto", title: `${crypto.name} Sold`, amount: payout, currency: "USD", status: "success", date: "Just now", direction: "in" });
      addNotification({ title: "Crypto Sold", message: `Sold ${numAmount} ${crypto.symbol} for $${payout.toFixed(2)}.`, type: "success", time: "Just now" });
      hapticSuccess();
      setTxStatus("success");
      setIsProcessing(false);
    }, 2000);
  }, [amount, crypto, getTotalPayout, updateUsdBalance, updateAsset, assets, addTransaction, addNotification]);

  const numAmount = parseFloat(amount) || 0;

  return (
    <View style={[s.root, { paddingTop: topPad }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.headerBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M12 5l-7 7 7 7" stroke="#1C1C1E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Sell Crypto</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: botPad + 80 }]} keyboardShouldPersistTaps="handled">

        {/* Balance Card */}
        <View style={s.section}>
          <View style={s.balanceCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.balanceLbl}>Available Balance</Text>
              <View style={s.balanceAmtRow}>
                <CryptoIcon symbol={crypto.symbol} size={28} />
                <Text style={s.balanceAmt}>{crypto.balance} {crypto.symbol}</Text>
              </View>
              <Text style={s.balanceFiat}>≈ ${(crypto.balance * crypto.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
            <TouchableOpacity onPress={() => handlePercentage(1)} activeOpacity={0.8} style={s.maxBtn}>
              <Text style={s.maxBtnTxt}>MAX</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Asset Selector */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Asset</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {CRYPTOS.map((c) => {
              const active = c.id === selectedCrypto;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => { hapticLight(); setSelectedCrypto(c.id as CryptoId); setAmount(""); setFiatValue("0.00"); }}
                  activeOpacity={0.8}
                  style={[s.chip, active && { backgroundColor: "#EEF3FF", borderColor: "#1A5AFF", borderWidth: 1.5 }]}
                >
                  <CryptoIcon symbol={c.symbol} size={24} />
                  <View>
                    <Text style={[s.chipSym, active && { color: "#1A5AFF" }]}>{c.symbol}</Text>
                    <Text style={s.chipBal}>{c.balance}</Text>
                  </View>
                  {active && <Text style={{ color: "#1A5AFF", fontSize: 10 }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Price Row */}
        <View style={s.section}>
          <View style={s.priceRow}>
            <View>
              <Text style={s.priceLabel}>Current Price</Text>
              <Text style={s.priceVal}>${crypto.price.toLocaleString()}</Text>
            </View>
            <View style={[s.changeBadge, { backgroundColor: crypto.change >= 0 ? "#F0FDF4" : "#FFF2F2" }]}>
              <Text style={[s.changeTxt, { color: crypto.change >= 0 ? "#30D158" : "#FF3B30" }]}>
                {crypto.change > 0 ? "+" : ""}{crypto.change}%
              </Text>
            </View>
          </View>

          {/* Sparkline */}
          <View style={s.sparkWrap}>
            {[60, 45, 70, 55, 80, 65, 90, 75, 85, 70, 95, 80, 100].map((h, i) => (
              <View key={i} style={{ flex: 1, justifyContent: "flex-end" }}>
                <View style={{ height: h * 0.38, backgroundColor: i === 12 ? "#30D158" : `rgba(48,209,88,${0.15 + (h / 100) * 0.5})`, borderRadius: 2 }} />
              </View>
            ))}
          </View>
        </View>

        {/* Order Type */}
        <View style={s.section}>
          <View style={s.orderTypePill}>
            {[{ label: "Market", val: true }, { label: "Limit", val: false }].map(({ label, val }) => (
              <TouchableOpacity
                key={label}
                onPress={() => { hapticLight(); setIsMarket(val); }}
                activeOpacity={0.8}
                style={[s.orderTypeBtn, isMarket === val && s.orderTypeBtnActive]}
              >
                <Text style={[s.orderTypeTxt, isMarket === val && s.orderTypeTxtActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sell Amount + Payout */}
        <View style={s.section}>
          <View style={s.card}>
            <View>
              <Text style={s.inputLabel}>You Sell</Text>
              <View style={s.amountRow}>
                <TextInput
                  style={s.amountInput}
                  placeholder="0.00"
                  placeholderTextColor="#8E8E93"
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                />
                <View style={s.assetTag}>
                  <CryptoIcon symbol={crypto.symbol} size={18} />
                  <Text style={s.assetTagTxt}>{crypto.symbol}</Text>
                </View>
              </View>
            </View>

            {/* % Buttons */}
            <View style={s.pctRow}>
              {[0.25, 0.5, 0.75, 1].map((pct) => (
                <TouchableOpacity key={pct} onPress={() => handlePercentage(pct)} activeOpacity={0.8} style={s.pctBtn}>
                  <Text style={s.pctBtnTxt}>{pct === 1 ? "Max" : `${pct * 100}%`}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Arrow divider */}
            <View style={s.arrowWrap}>
              <View style={s.arrowCircle}>
                <Text style={{ color: "#8E8E93", fontSize: 16 }}>↓</Text>
              </View>
            </View>

            {/* You Receive */}
            <View>
              <Text style={s.inputLabel}>You Receive</Text>
              <View style={[s.amountRow, { backgroundColor: "#F0FDF4" }]}>
                <Text style={s.fiatOutput}>${fiatValue}</Text>
                <View style={s.assetTag}>
                  <Text style={s.assetTagTxt}>USD</Text>
                </View>
              </View>
            </View>

            {/* Fee Breakdown */}
            <View style={s.feeBlock}>
              {[
                { label: "Gross Value", value: `$${parseFloat(fiatValue).toFixed(2)}` },
                { label: "Trading Fee (0.1%)", value: `-$${getFee()}`, warn: true },
                { label: "Net Payout", value: `$${getTotalPayout()}`, highlight: true },
              ].map((row, i, arr) => (
                <View key={row.label} style={[s.feeRow, i < arr.length - 1 && s.feeRowBorder]}>
                  <Text style={s.feeLbl}>{row.label}</Text>
                  <Text style={[s.feeVal, (row as any).highlight && { color: "#30D158", fontFamily: "Inter_700Bold" }, (row as any).warn && { color: "#FF9F0A" }]}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Sell Button */}
        <View style={s.section}>
          <TouchableOpacity
            onPress={handleSell}
            activeOpacity={0.85}
            disabled={numAmount <= 0}
            style={[s.sellBtn, numAmount <= 0 && { opacity: 0.4 }]}
          >
            <Text style={s.sellBtnTxt}>
              {numAmount > 0 ? `Sell ${numAmount} ${crypto.symbol} · $${getTotalPayout()}` : `Sell ${crypto.symbol}`}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Confirm Modal */}
      <FocusedModal visible={showModal} onRequestClose={() => { if (!isProcessing) { setShowModal(false); if (txStatus === "success") router.back(); } }} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            {isProcessing ? (
              <View style={{ alignItems: "center", padding: 24 }}>
                <ActivityIndicator size="large" color="#1A5AFF" style={{ marginBottom: 16 }} />
                <Text style={s.modalTitle}>Processing Sale…</Text>
                <Text style={s.modalSub}>Please wait while we process your order.</Text>
              </View>
            ) : txStatus === "success" ? (
              <View style={{ alignItems: "center", padding: 24 }}>
                <View style={s.successCircle}><Text style={{ fontSize: 36 }}>✓</Text></View>
                <Text style={s.modalTitle}>Sale Complete!</Text>
                <Text style={s.modalSub}>${getTotalPayout()} has been credited to your USD wallet.</Text>
                <TouchableOpacity onPress={() => { setShowModal(false); router.back(); }} activeOpacity={0.85} style={s.doneBtn}>
                  <Text style={s.doneBtnTxt}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: "center", padding: 24 }}>
                <View style={s.errorCircle}><Text style={{ fontSize: 36 }}>✕</Text></View>
                <Text style={s.modalTitle}>Sale Failed</Text>
                <Text style={s.modalSub}>Something went wrong. Please try again.</Text>
                <TouchableOpacity onPress={() => setShowModal(false)} activeOpacity={0.85} style={s.doneBtn}>
                  <Text style={s.doneBtnTxt}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
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
  balanceCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  balanceLbl: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#8E8E93", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  balanceAmtRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  balanceAmt: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#1C1C1E", letterSpacing: -0.5 },
  balanceFiat: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  maxBtn: { backgroundColor: "#EEF3FF", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  maxBtnTxt: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#1A5AFF" },
  chipRow: { gap: 8, paddingBottom: 4 },
  chip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "transparent", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  chipSym: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  chipBal: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  priceRow: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  priceLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#8E8E93", marginBottom: 2 },
  priceVal: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#1C1C1E", letterSpacing: -0.5 },
  changeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  changeTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sparkWrap: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 40, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 10, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  orderTypePill: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 14, padding: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  orderTypeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  orderTypeBtnActive: { backgroundColor: "#F2F2F7", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  orderTypeTxt: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#8E8E93" },
  orderTypeTxtActive: { fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  inputLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#8E8E93", paddingHorizontal: 16, paddingTop: 14, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  amountRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, borderRadius: 12, backgroundColor: "#F2F2F7", paddingHorizontal: 14, marginBottom: 12 },
  amountInput: { flex: 1, fontSize: 26, fontFamily: "Inter_700Bold", color: "#1C1C1E", paddingVertical: 12 },
  assetTag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, margin: 6 },
  assetTagTxt: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  fiatOutput: { flex: 1, fontSize: 26, fontFamily: "Inter_700Bold", color: "#30D158", paddingVertical: 12 },
  pctRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  pctBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: "#F2F2F7", alignItems: "center" },
  pctBtnTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  arrowWrap: { alignItems: "center", marginVertical: 4 },
  arrowCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F2F2F7", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E5E5EA" },
  feeBlock: { marginHorizontal: 16, marginBottom: 16, backgroundColor: "#F2F2F7", borderRadius: 14, overflow: "hidden" },
  feeRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 11 },
  feeRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  feeLbl: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  feeVal: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  sellBtn: { backgroundColor: "#FF3B30", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  sellBtnTxt: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1C1C1E", textAlign: "center", marginBottom: 8, letterSpacing: -0.3 },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#8E8E93", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  successCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  errorCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#FFF2F2", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  doneBtn: { backgroundColor: "#1A5AFF", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 48, alignItems: "center" },
  doneBtnTxt: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
});
