import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, Platform, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FocusedModal } from "@/components/FocusedModal";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hapticLight, hapticSuccess, hapticWarning } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

type CardTier = "regular" | "platinum";
type Modal = "fund" | "withdraw" | "freeze" | null;

const CARD_CONFIGS = {
  regular: {
    label: "Regular",
    cardTitle: "PayVora Classic",
    gradient: ["#1072EA", "#0A3ECC", "#072EA8"] as const,
    accent: "#7AA8FF",
    features: ["$5,000/month limit", "Standard rewards", "24/7 Support", "3D Secure"],
  },
  platinum: {
    label: "Platinum",
    cardTitle: "PayVora Platinum",
    gradient: ["#D4AF37", "#C5932B", "#A87320"] as const,
    accent: "#FFE08A",
    features: ["$50,000/month limit", "Premium rewards (3%)", "Priority Support", "Travel Insurance"],
  },
};

const CARD_TRANSACTIONS = [
  { id: "1", merchant: "Netflix",     amount: "-$15.99",  date: "Jun 1, 2026",   category: "🎬", isDebit: true  },
  { id: "2", merchant: "Spotify",     amount: "-$9.99",   date: "May 30, 2026",  category: "🎵", isDebit: true  },
  { id: "3", merchant: "Amazon",      amount: "-$89.00",  date: "May 28, 2026",  category: "📦", isDebit: true  },
  { id: "4", merchant: "Top-up",      amount: "+$200.00", date: "May 25, 2026",  category: "💳", isDebit: false },
  { id: "5", merchant: "Uber Eats",   amount: "-$32.50",  date: "May 24, 2026",  category: "🍕", isDebit: true  },
  { id: "6", merchant: "Apple Store", amount: "-$1.29",   date: "May 22, 2026",  category: "🍎", isDebit: true  },
];

const SPENDING_DATA = [0.4, 0.6, 0.35, 0.8, 0.55, 0.7, 0.45, 0.9, 0.65, 0.75, 0.5, 0.85];

function MastercardLogo() {
  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#EB001B", opacity: 0.9 }} />
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#F79E1B", opacity: 0.9, marginLeft: -10 }} />
    </View>
  );
}

function ChipIcon() {
  return (
    <View style={{ width: 36, height: 26, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.25)", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" }}>
      <View style={{ position: "absolute", left: 12, top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.4)" }} />
      <View style={{ position: "absolute", right: 12, top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.4)" }} />
      <View style={{ position: "absolute", top: 9, left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.4)" }} />
    </View>
  );
}

export default function VirtualCardScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { virtualCardBalance, virtualCardFrozen, fundVirtualCard, withdrawVirtualCard, toggleFreezeCard, addTransaction } = useWallet() as any;
  const { addNotification } = useNotifications();

  const [selectedTier, setSelectedTier] = useState<CardTier>("regular");
  const [showDetails, setShowDetails] = useState(false);
  const [activeModal, setActiveModal] = useState<Modal>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const config = CARD_CONFIGS[selectedTier];
  const cardBalance = typeof virtualCardBalance === "number" ? virtualCardBalance : 248.5;
  const isFrozen = typeof virtualCardFrozen === "boolean" ? virtualCardFrozen : false;

  const cardNumber = showDetails ? "4242 4242 4242 4242" : "•••• •••• •••• 4242";
  const cvv        = showDetails ? "345" : "•••";
  const expiry     = "12/28";
  const holderName = "PAYVORA USER";

  const handleFund = useCallback(async () => {
    const num = parseFloat(fundAmount) || 0;
    if (num <= 0) { hapticWarning(); Alert.alert("Invalid Amount", "Please enter a valid amount."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    if (typeof fundVirtualCard === "function") fundVirtualCard(num);
    addTransaction({ type: "card", category: "Card", title: "Virtual Card Top-up", amount: num, currency: "USD", status: "success", date: "Just now", direction: "in" });
    addNotification({ title: "Card Funded", message: `$${num.toFixed(2)} added to your virtual card.`, type: "success", time: "Just now" });
    hapticSuccess();
    setFundAmount("");
    setActiveModal(null);
    Alert.alert("Card Funded!", `$${num.toFixed(2)} has been added to your virtual card.`);
  }, [fundAmount, fundVirtualCard, addTransaction, addNotification]);

  const handleWithdraw = useCallback(async () => {
    const num = parseFloat(withdrawAmount) || 0;
    if (num <= 0) { hapticWarning(); Alert.alert("Invalid Amount", "Please enter a valid amount."); return; }
    if (num > cardBalance) { hapticWarning(); Alert.alert("Insufficient Funds", "Your card balance is too low."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    if (typeof withdrawVirtualCard === "function") withdrawVirtualCard(num);
    addTransaction({ type: "card", category: "Card", title: "Virtual Card Withdrawal", amount: num, currency: "USD", status: "success", date: "Just now", direction: "out" });
    addNotification({ title: "Withdrawal Successful", message: `$${num.toFixed(2)} withdrawn from your virtual card.`, type: "success", time: "Just now" });
    hapticSuccess();
    setWithdrawAmount("");
    setActiveModal(null);
    Alert.alert("Withdrawn!", `$${num.toFixed(2)} has been moved to your USD wallet.`);
  }, [withdrawAmount, cardBalance, withdrawVirtualCard, addTransaction, addNotification]);

  const handleFreeze = useCallback(() => {
    hapticWarning();
    Alert.alert(
      isFrozen ? "Unfreeze Card?" : "Freeze Card?",
      isFrozen ? "Your card will be reactivated immediately." : "No transactions will be allowed while frozen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isFrozen ? "Unfreeze" : "Freeze",
          onPress: () => {
            if (typeof toggleFreezeCard === "function") toggleFreezeCard();
            addNotification({
              title: isFrozen ? "Card Unfrozen" : "Card Frozen",
              message: isFrozen ? "Your virtual card is now active." : "Your virtual card has been frozen.",
              type: isFrozen ? "success" : "warning",
              time: "Just now",
            });
            hapticSuccess();
          },
        },
      ]
    );
    setActiveModal(null);
  }, [isFrozen, toggleFreezeCard, addNotification]);

  return (
    <View style={[s.root, { paddingTop: topPad }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Virtual Card</Text>
        <TouchableOpacity activeOpacity={0.8} style={s.headerBtn}>
          <Text style={s.headerBtnTxt}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: botPad + 60 }]}>

        {/* Tier Selector */}
        <View style={s.tierSection}>
          {(["regular", "platinum"] as CardTier[]).map((tier) => (
            <TouchableOpacity
              key={tier}
              onPress={() => { hapticLight(); setSelectedTier(tier); }}
              activeOpacity={0.8}
              style={[s.tierBtn, selectedTier === tier && s.tierBtnActive]}
            >
              <Text style={[s.tierBtnTxt, selectedTier === tier && s.tierBtnTxtActive]}>
                {tier === "platinum" ? "⭐ Platinum" : "🔵 Regular"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Credit Card */}
        <View style={s.cardSection}>
          <LinearGradient colors={config.gradient} style={s.creditCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            {isFrozen && (
              <View style={s.frozenOverlay}>
                <Text style={s.frozenIcon}>🔒</Text>
                <Text style={s.frozenLabel}>CARD FROZEN</Text>
              </View>
            )}
            {/* Card top row */}
            <View style={s.cardTop}>
              <Text style={s.cardTitle}>{config.cardTitle}</Text>
              <MastercardLogo />
            </View>
            {/* Chip */}
            <ChipIcon />
            {/* Card number */}
            <Text style={s.cardNumber}>{cardNumber}</Text>
            {/* Card bottom */}
            <View style={s.cardBottom}>
              <View>
                <Text style={s.cardFieldLabel}>CARD HOLDER</Text>
                <Text style={s.cardFieldValue}>{holderName}</Text>
              </View>
              <View>
                <Text style={s.cardFieldLabel}>EXPIRES</Text>
                <Text style={s.cardFieldValue}>{expiry}</Text>
              </View>
              <View>
                <Text style={s.cardFieldLabel}>CVV</Text>
                <Text style={s.cardFieldValue}>{cvv}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Show/hide + balance */}
          <View style={s.cardMeta}>
            <TouchableOpacity onPress={() => { hapticLight(); setShowDetails(!showDetails); }} activeOpacity={0.8} style={s.showDetailsBtn}>
              <Text style={s.showDetailsTxt}>{showDetails ? "🙈 Hide Details" : "👁 Show Details"}</Text>
            </TouchableOpacity>
            <View style={s.balanceTag}>
              <Text style={s.balanceLbl}>Balance</Text>
              <Text style={s.balanceAmt}>${cardBalance.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={s.actionsSection}>
          {[
            { label: "Fund",     emoji: "💰", modal: "fund"     as Modal, color: "#118D45" },
            { label: "Withdraw", emoji: "💸", modal: "withdraw" as Modal, color: "#FF9F0A" },
            { label: isFrozen ? "Unfreeze" : "Freeze", emoji: isFrozen ? "🔓" : "🔒", modal: "freeze" as Modal, color: isFrozen ? "#1072EA" : "#E02E5B" },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => {
                hapticLight();
                if (action.modal === "freeze") { handleFreeze(); } else { setActiveModal(action.modal); }
              }}
              activeOpacity={0.8}
              style={s.actionBtn}
            >
              <View style={[s.actionIcon, { backgroundColor: action.color + "18" }]}>
                <Text style={s.actionEmoji}>{action.emoji}</Text>
              </View>
              <Text style={[s.actionLabel, { color: action.color }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Card Features */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Plan Features</Text>
          <View style={s.card}>
            {config.features.map((feat, i) => (
              <View key={feat} style={[s.featRow, i < config.features.length - 1 && s.featRowBorder]}>
                <Text style={s.featCheck}>✓</Text>
                <Text style={s.featTxt}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Spending Chart */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Monthly Spending</Text>
          <View style={s.card}>
            <View style={s.spendHeader}>
              <Text style={s.spendTotal}>${(cardBalance * 1.8).toFixed(0)}</Text>
              <Text style={s.spendSub}>Total spent this month</Text>
            </View>
            <View style={s.chartArea}>
              {SPENDING_DATA.map((h, i) => {
                const isLast = i === SPENDING_DATA.length - 1;
                return (
                  <View key={i} style={{ flex: 1, justifyContent: "flex-end" }}>
                    <View style={{ height: h * 52, backgroundColor: isLast ? "#1072EA" : `rgba(16,114,234,${0.2 + h * 0.5})`, borderRadius: 3 }} />
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Transactions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Card Transactions</Text>
          <View style={s.card}>
            {CARD_TRANSACTIONS.map((tx, i) => (
              <View key={tx.id} style={[s.txRow, i < CARD_TRANSACTIONS.length - 1 && s.txRowBorder]}>
                <View style={s.txIcon}><Text style={s.txEmoji}>{tx.category}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.txMerchant}>{tx.merchant}</Text>
                  <Text style={s.txDate}>{tx.date}</Text>
                </View>
                <Text style={[s.txAmount, { color: tx.isDebit ? "#E02E5B" : "#118D45" }]}>{tx.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fund Modal */}
      <FocusedModal visible={activeModal === "fund"} onRequestClose={() => setActiveModal(null)} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Fund Card</Text>
            <Text style={s.modalSub}>Transfer from your USD wallet to your virtual card.</Text>
            <View style={s.modalInputWrap}>
              <Text style={s.modalPrefix}>$</Text>
              <TextInput
                value={fundAmount}
                onChangeText={setFundAmount}
                placeholder="0.00"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                style={s.modalInput}
                autoFocus
              />
            </View>
            <View style={s.presetRow}>
              {[50, 100, 200, 500].map((v) => (
                <TouchableOpacity key={v} onPress={() => setFundAmount(String(v))} activeOpacity={0.8} style={s.presetBtn}>
                  <Text style={s.presetTxt}>${v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setActiveModal(null)} activeOpacity={0.8} style={s.cancelBtn}>
                <Text style={s.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFund} activeOpacity={0.85} disabled={loading} style={[s.confirmBtn, loading && { opacity: 0.65 }]}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmTxt}>Fund Card</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </FocusedModal>

      {/* Withdraw Modal */}
      <FocusedModal visible={activeModal === "withdraw"} onRequestClose={() => setActiveModal(null)} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Withdraw</Text>
            <Text style={s.modalSub}>Move funds from your card back to your USD wallet.</Text>
            <View style={s.balancePillModal}>
              <Text style={s.balancePillLbl}>Card Balance</Text>
              <Text style={s.balancePillAmt}>${cardBalance.toFixed(2)}</Text>
            </View>
            <View style={s.modalInputWrap}>
              <Text style={s.modalPrefix}>$</Text>
              <TextInput
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="0.00"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                style={s.modalInput}
                autoFocus
              />
            </View>
            <View style={s.modalActions}>
              <TouchableOpacity onPress={() => setActiveModal(null)} activeOpacity={0.8} style={s.cancelBtn}>
                <Text style={s.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleWithdraw} activeOpacity={0.85} disabled={loading} style={[s.confirmBtn, { backgroundColor: "#FF9F0A" }, loading && { opacity: 0.65 }]}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmTxt}>Withdraw</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </FocusedModal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F9FC" },
  scroll: {},
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1C1C1E", letterSpacing: -0.3 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  backArrow: { fontSize: 20, color: "#1C1C1E" },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  headerBtnTxt: { fontSize: 20, color: "#1C1C1E", fontWeight: "700" },
  tierSection: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  tierBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: "center" },
  tierBtnActive: { backgroundColor: "#1072EA" },
  tierBtnTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  tierBtnTxtActive: { color: "#FFFFFF" },
  cardSection: { paddingHorizontal: 16, marginBottom: 16 },
  creditCard: { borderRadius: 20, padding: 20, height: 200, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  frozenOverlay: { ...StyleSheet.absoluteFillObject as any, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", gap: 8, zIndex: 10, borderRadius: 20 },
  frozenIcon: { fontSize: 36 },
  frozenLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 3 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  cardTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.7)", letterSpacing: 1 },
  cardNumber: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 2, marginVertical: 16 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between" },
  cardFieldLabel: { fontSize: 9, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)", letterSpacing: 1, marginBottom: 3 },
  cardFieldValue: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: 1 },
  cardMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  showDetailsBtn: { backgroundColor: "#FFFFFF", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  showDetailsTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  balanceTag: { backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  balanceLbl: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#8E8E93", marginBottom: 1 },
  balanceAmt: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  actionsSection: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1, alignItems: "center", gap: 8 },
  actionIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  actionEmoji: { fontSize: 24 },
  actionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  featRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  featRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  featCheck: { fontSize: 14, color: "#118D45", fontWeight: "700" },
  featTxt: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#1C1C1E" },
  spendHeader: { padding: 16, paddingBottom: 8 },
  spendTotal: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#1C1C1E", letterSpacing: -0.5, marginBottom: 2 },
  spendSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  chartArea: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 60, paddingHorizontal: 16, paddingBottom: 16 },
  txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  txRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  txIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F7F9FC", alignItems: "center", justifyContent: "center" },
  txEmoji: { fontSize: 18 },
  txMerchant: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 2 },
  txDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  txAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1C1C1E", textAlign: "center", marginBottom: 8, letterSpacing: -0.3 },
  modalSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#8E8E93", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  balancePillModal: { backgroundColor: "#F7F9FC", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  balancePillLbl: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8E8E93" },
  balancePillAmt: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  modalInputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#F7F9FC", borderRadius: 16, paddingHorizontal: 16, marginBottom: 16 },
  modalPrefix: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#8E8E93", marginRight: 6 },
  modalInput: { flex: 1, fontSize: 28, fontFamily: "Inter_700Bold", color: "#1C1C1E", paddingVertical: 14 },
  presetRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  presetBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: "#F7F9FC", alignItems: "center" },
  presetTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, backgroundColor: "#F7F9FC", alignItems: "center" },
  cancelTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  confirmBtn: { flex: 2, paddingVertical: 15, borderRadius: 14, backgroundColor: "#1072EA", alignItems: "center" },
  confirmTxt: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
});
