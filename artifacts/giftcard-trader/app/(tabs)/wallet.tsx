import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useWallet } from "@/contexts/WalletContext";
import { hapticLight, hapticSuccess } from "@/utils/haptics";

type ModalType = "deposit" | "withdraw" | null;

const ASSET_COLORS: Record<string, string> = {
  USD: "#30D158", NGN: "#1A5AFF", BTC: "#F7931A",
  ETH: "#627EEA", SOL: "#9945FF", BNB: "#F3BA2F",
};

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { usdBalance, ngnBalance, assets, transactions, updateUsdBalance, addTransaction } = useWallet();
  const [modal, setModal] = useState<ModalType>(null);
  const [amount, setAmount] = useState("");

  const totalUSD = usdBalance + (assets || []).reduce((s, a) => s + (a.balance || 0) * (a.price || 0), 0);
  const recentTxs = (transactions || []).slice(0, 5);

  const handleAction = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    hapticSuccess();
    if (modal === "deposit") {
      updateUsdBalance(amt);
      addTransaction({ id: Date.now().toString(), title: "Deposit", amount: amt, currency: "USD", direction: "in", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), type: "wallet" });
    } else {
      if (amt > usdBalance) return;
      updateUsdBalance(-amt);
      addTransaction({ id: Date.now().toString(), title: "Withdrawal", amount: amt, currency: "USD", direction: "out", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), type: "wallet" });
    }
    setAmount("");
    setModal(null);
  };

  return (
    <View style={s.root}>
      <View style={[s.headerWrap, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Wallet</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <LinearGradient colors={["#1A5AFF", "#0C38C0"]} style={s.balCard}>
          <Text style={s.balLabel}>Total Portfolio</Text>
          <Text style={s.balAmount}>${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          <Text style={s.balSub}>USD equivalent</Text>
          <View style={s.actionRow}>
            <TouchableOpacity style={s.actionBtn} onPress={() => { hapticLight(); setModal("deposit"); }} activeOpacity={0.8}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M12 5v14M5 12l7-7 7 7" stroke="#1A5AFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={s.actionBtnLabel}>Deposit</Text>
            </TouchableOpacity>
            <View style={s.actionDivider} />
            <TouchableOpacity style={s.actionBtn} onPress={() => { hapticLight(); setModal("withdraw"); }} activeOpacity={0.8}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M12 19V5M5 12l7 7 7-7" stroke="#1A5AFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={s.actionBtnLabel}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <Text style={s.sectionTitle}>Assets</Text>
        <View style={s.card}>
          {[
            { symbol: "USD", name: "US Dollar",      balance: usdBalance,  price: 1 },
            { symbol: "NGN", name: "Nigerian Naira", balance: ngnBalance / 1500, price: 1 },
            ...(assets || []),
          ].map((a, i, arr) => (
            <View key={a.symbol} style={[s.assetRow, i < arr.length - 1 && s.rowBorder]}>
              <View style={[s.assetBadge, { backgroundColor: (ASSET_COLORS[a.symbol] || "#8E8E93") + "22" }]}>
                <Text style={[s.assetSymbol, { color: ASSET_COLORS[a.symbol] || "#8E8E93" }]}>{a.symbol[0]}</Text>
              </View>
              <View style={s.assetInfo}>
                <Text style={s.assetName}>{a.name}</Text>
                <Text style={s.assetBalance}>{a.balance?.toFixed(a.symbol === "USD" || a.symbol === "NGN" ? 2 : 6)} {a.symbol}</Text>
              </View>
              <Text style={s.assetValue}>
                ${((a.balance || 0) * (a.price || 1)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Recent Activity</Text>
        <View style={s.card}>
          {recentTxs.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyTitle}>No transactions yet</Text></View>
          ) : recentTxs.map((tx, i) => (
            <View key={tx.id} style={[s.txRow, i < recentTxs.length - 1 && s.rowBorder]}>
              <View style={[s.txIcon, { backgroundColor: tx.direction === "in" ? "rgba(48,209,88,0.12)" : "rgba(255,59,48,0.08)" }]}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d={tx.direction === "in" ? "M12 19V5M5 12l7-7 7 7" : "M12 5v14M5 12l7 7 7-7"} stroke={tx.direction === "in" ? "#30D158" : "#FF3B30"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.txTitle}>{tx.title}</Text>
                <Text style={s.txDate}>{tx.date}</Text>
              </View>
              <Text style={[s.txAmount, { color: tx.direction === "in" ? "#30D158" : "#1C1C1E" }]}>
                {tx.direction === "in" ? "+" : "-"}${tx.amount.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!modal} transparent animationType="slide">
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>{modal === "deposit" ? "Deposit Funds" : "Withdraw Funds"}</Text>
            <Text style={s.modalSub}>Available: ${usdBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <View style={s.modalInputWrap}>
              <Text style={s.modalSign}>$</Text>
              <TextInput
                style={s.modalInput}
                placeholder="0.00"
                placeholderTextColor="#C7C7CC"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>
            <TouchableOpacity onPress={handleAction} activeOpacity={0.85}>
              <LinearGradient colors={["#1A5AFF", "#0C38C0"]} style={s.modalBtn}>
                <Text style={s.modalBtnLabel}>Confirm {modal === "deposit" ? "Deposit" : "Withdrawal"}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setModal(null); setAmount(""); }} style={s.cancelBtn}>
              <Text style={s.cancelLabel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  headerWrap: { backgroundColor: "#F2F2F7", zIndex: 10 },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },

  balCard: { borderRadius: 20, padding: 24, marginBottom: 20 },
  balLabel: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", marginBottom: 6 },
  balAmount: { fontSize: 36, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", letterSpacing: -1, marginBottom: 4 },
  balSub: { fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular", marginBottom: 20 },
  actionRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, overflow: "hidden" },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14, backgroundColor: "#FFFFFF" },
  actionBtnLabel: { fontSize: 14, fontWeight: "600", color: "#1A5AFF", fontFamily: "Inter_600SemiBold" },
  actionDivider: { width: 1, backgroundColor: "#E5E5EA" },

  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", letterSpacing: -0.3, marginBottom: 10 },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
    marginBottom: 20,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },

  assetRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  assetBadge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  assetSymbol: { fontSize: 16, fontWeight: "800", fontFamily: "Inter_700Bold" },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  assetBalance: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular", marginTop: 1 },
  assetValue: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },

  txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  txTitle: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  txDate: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular", marginTop: 1 },
  txAmount: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },

  empty: { padding: 28, alignItems: "center" },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#8E8E93", fontFamily: "Inter_600SemiBold" },

  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalSheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E5EA", alignSelf: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", marginBottom: 6 },
  modalSub: { fontSize: 14, color: "#8E8E93", fontFamily: "Inter_400Regular", marginBottom: 20 },
  modalInputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#F2F2F7", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 16 },
  modalSign: { fontSize: 24, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginRight: 4 },
  modalInput: { flex: 1, fontSize: 28, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  modalBtn: { borderRadius: 16, paddingVertical: 17, alignItems: "center", marginBottom: 12 },
  modalBtnLabel: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelLabel: { fontSize: 15, color: "#8E8E93", fontFamily: "Inter_600SemiBold" },
});
