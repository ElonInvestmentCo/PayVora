import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, Platform, ActivityIndicator,
} from "react-native";
import { FocusedModal } from "@/components/FocusedModal";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hapticSuccess, hapticError, hapticLight } from "@/utils/haptics";
import { GlowButton } from "@/components/GlowButton";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

type ActiveTab = "bills" | "esims";
type ServiceId = "airtime" | "data" | "electricity" | "tv" | "internet";

interface ESimPlan {
  id: string;
  region: string;
  flag: string;
  data: string;
  validity: string;
  price: number;
  color: string;
}

const SERVICES: { id: ServiceId; label: string; emoji: string; color: string }[] = [
  { id: "airtime",     label: "Airtime",     emoji: "📞", color: "#1072EA" },
  { id: "data",        label: "Data",        emoji: "📡", color: "#118D45" },
  { id: "electricity", label: "Electricity", emoji: "⚡", color: "#FF9F0A" },
  { id: "tv",          label: "TV Sub",      emoji: "📺", color: "#BF5AF2" },
  { id: "internet",    label: "Internet",    emoji: "🌐", color: "#32ADE6" },
];

const PROVIDERS: Record<ServiceId, string[]> = {
  airtime:     ["MTN", "Airtel", "Glo", "9mobile"],
  data:        ["MTN Data", "Airtel Data", "Glo Data", "9mobile Data"],
  electricity: ["IKEDC", "AEDC", "EKEDC", "PHCN"],
  tv:          ["DSTV", "GOtv", "Startimes", "ShowMax"],
  internet:    ["Spectranet", "Smile", "Ipnx", "Swift"],
};

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const ESIM_PLANS: ESimPlan[] = [
  { id: "1", region: "Nigeria",       flag: "🇳🇬", data: "5GB",  validity: "30 days",  price: 15,  color: "#118D45" },
  { id: "2", region: "United States", flag: "🇺🇸", data: "10GB", validity: "30 days",  price: 25,  color: "#1072EA" },
  { id: "3", region: "Europe",        flag: "🇪🇺", data: "8GB",  validity: "14 days",  price: 20,  color: "#32ADE6" },
  { id: "4", region: "Asia Pacific",  flag: "🌏", data: "15GB", validity: "30 days",  price: 30,  color: "#BF5AF2" },
  { id: "5", region: "Global",        flag: "🌍", data: "20GB", validity: "60 days",  price: 50,  color: "#FF9F0A" },
  { id: "6", region: "UK",            flag: "🇬🇧", data: "12GB", validity: "28 days",  price: 28,  color: "#E02E5B" },
];

const BILL_TRANSACTIONS = [
  { id: "1", service: "MTN Airtime",    amount: "₦500",  date: "Jun 1, 2026",   status: "success" as const, emoji: "📞" },
  { id: "2", service: "DSTV Premium",   amount: "₦24,500", date: "May 30, 2026", status: "success" as const, emoji: "📺" },
  { id: "3", service: "IKEDC Prepaid",  amount: "₦3,000", date: "May 28, 2026", status: "pending" as const, emoji: "⚡" },
  { id: "4", service: "Spectranet",     amount: "₦6,000", date: "May 25, 2026", status: "success" as const, emoji: "🌐" },
];

export default function BillsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { usdBalance, updateUsdBalance, addTransaction } = useWallet();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<ActiveTab>("bills");
  const [selectedService, setSelectedService] = useState<ServiceId>("airtime");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState(PROVIDERS.airtime[0]);
  const [amount, setAmount] = useState("");
  const [planModal, setPlanModal] = useState<ESimPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const service = SERVICES.find((s) => s.id === selectedService)!;

  const handlePay = useCallback(async () => {
    if (!phone.trim()) { hapticError(); Alert.alert("Error", "Please enter a phone/account number."); return; }
    if (numAmount <= 0)  { hapticError(); Alert.alert("Error", "Please enter a valid amount."); return; }
    if (numAmount > usdBalance * 800) { hapticError(); Alert.alert("Insufficient Balance", "You don't have enough funds."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    updateUsdBalance(-numAmount / 800);
    addTransaction({ type: "bills", category: "Bills", title: `${provider} ${service.label}`, amount: numAmount, currency: "NGN", status: "success", date: "Just now", direction: "out" });
    addNotification({ title: "Bill Paid", message: `${provider} ${service.label} – ₦${numAmount.toLocaleString()} paid successfully.`, type: "success", time: "Just now" });
    hapticSuccess();
    Alert.alert("Payment Successful!", `Your ${provider} ${service.label} payment of ₦${numAmount.toLocaleString()} was successful.`, [{ text: "Done" }]);
    setPhone("");
    setAmount("");
  }, [phone, numAmount, provider, service, usdBalance, updateUsdBalance, addTransaction, addNotification]);

  const handleBuyEsim = useCallback(async (plan: ESimPlan) => {
    if (plan.price > usdBalance) { hapticError(); Alert.alert("Insufficient Balance", "You don't have enough USD."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setPlanModal(null);
    updateUsdBalance(-plan.price);
    addTransaction({ type: "bills", category: "Bills", title: `eSIM – ${plan.region} ${plan.data}`, amount: plan.price, currency: "USD", status: "success", date: "Just now", direction: "out" });
    addNotification({ title: "eSIM Purchased", message: `Your ${plan.data} ${plan.region} eSIM plan is active.`, type: "success", time: "Just now" });
    hapticSuccess();
    Alert.alert("eSIM Activated!", `Your ${plan.data} ${plan.region} plan for ${plan.validity} is now active. Check your email for the QR code.`, [{ text: "Great!" }]);
  }, [usdBalance, updateUsdBalance, addTransaction, addNotification]);

  const providers = PROVIDERS[selectedService];

  return (
    <View style={[s.root, { paddingTop: topPad }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Bills & eSIMs</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Tab Toggle */}
      <View style={s.tabToggle}>
        {(["bills", "esims"] as ActiveTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => { hapticLight(); setActiveTab(tab); }}
            activeOpacity={0.8}
            style={[s.toggleBtn, activeTab === tab && s.toggleBtnActive]}
          >
            <Text style={[s.toggleBtnTxt, activeTab === tab && s.toggleBtnTxtActive]}>
              {tab === "bills" ? "🧾 Bill Payments" : "📱 eSIM Plans"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: botPad + 80 }]} keyboardShouldPersistTaps="handled">

        {/* ── Bills Tab ── */}
        {activeTab === "bills" && (
          <>
            {/* Balance */}
            <View style={s.section}>
              <View style={s.balancePill}>
                <View style={s.balanceDot} />
                <Text style={s.balanceLbl}>USD Wallet</Text>
                <Text style={s.balanceAmt}>${usdBalance.toFixed(2)}</Text>
              </View>
            </View>

            {/* Service Selector */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Service</Text>
              <View style={s.serviceGrid}>
                {SERVICES.map((svc) => {
                  const active = svc.id === selectedService;
                  return (
                    <TouchableOpacity
                      key={svc.id}
                      onPress={() => { hapticLight(); setSelectedService(svc.id); setProvider(PROVIDERS[svc.id][0]); setAmount(""); }}
                      activeOpacity={0.8}
                      style={[s.serviceCard, active && { borderColor: svc.color, backgroundColor: svc.color + "10" }]}
                    >
                      <Text style={s.serviceEmoji}>{svc.emoji}</Text>
                      <Text style={[s.serviceLabel, active && { color: svc.color }]}>{svc.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Provider */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Provider</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.providerRow}>
                {providers.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => { hapticLight(); setProvider(p); }}
                    activeOpacity={0.8}
                    style={[s.providerBtn, provider === p && s.providerBtnActive]}
                  >
                    <Text style={[s.providerTxt, provider === p && s.providerTxtActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Phone / Account */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Phone / Account Number</Text>
              <View style={s.card}>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={selectedService === "electricity" ? "Meter number" : "Phone number"}
                  placeholderTextColor="#8E8E93"
                  keyboardType="phone-pad"
                  style={s.phoneInput}
                />
              </View>
            </View>

            {/* Amount */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Amount (₦)</Text>
              <View style={s.card}>
                <View style={s.amtRow}>
                  <Text style={s.amtPrefix}>₦</Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0"
                    placeholderTextColor="#8E8E93"
                    keyboardType="numeric"
                    style={s.amtInput}
                  />
                </View>
                <View style={s.quickAmtRow}>
                  {QUICK_AMOUNTS.map((v) => (
                    <TouchableOpacity
                      key={v}
                      onPress={() => setAmount(String(v))}
                      activeOpacity={0.8}
                      style={[s.qaBtn, numAmount === v && s.qaBtnActive]}
                    >
                      <Text style={[s.qaTxt, numAmount === v && s.qaTxtActive]}>₦{v >= 1000 ? `${v / 1000}K` : v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Pay Button */}
            <View style={s.section}>
              <GlowButton title={loading ? "Processing…" : `Pay ₦${numAmount > 0 ? numAmount.toLocaleString() : "0"}`} onPress={handlePay} disabled={loading || numAmount <= 0 || !phone.trim()} />
            </View>

            {/* Recent Transactions */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>Recent Payments</Text>
              <View style={s.card}>
                {BILL_TRANSACTIONS.map((tx, i) => (
                  <View key={tx.id} style={[s.txRow, i < BILL_TRANSACTIONS.length - 1 && s.txRowBorder]}>
                    <View style={s.txIconWrap}><Text style={s.txEmoji}>{tx.emoji}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.txService}>{tx.service}</Text>
                      <Text style={s.txDate}>{tx.date}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={s.txAmount}>{tx.amount}</Text>
                      <View style={[s.txStatus, { backgroundColor: tx.status === "success" ? "#E8F7EE" : "#FFF9EC" }]}>
                        <Text style={[s.txStatusTxt, { color: tx.status === "success" ? "#118D45" : "#FF9F0A" }]}>{tx.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* ── eSIMs Tab ── */}
        {activeTab === "esims" && (
          <>
            <View style={s.section}>
              <Text style={s.sectionTitle}>Available Plans</Text>
              <View style={s.esimGrid}>
                {ESIM_PLANS.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    onPress={() => { hapticLight(); setPlanModal(plan); }}
                    activeOpacity={0.8}
                    style={[s.esimCard, { borderTopColor: plan.color, borderTopWidth: 3 }]}
                  >
                    <Text style={s.esimFlag}>{plan.flag}</Text>
                    <Text style={s.esimRegion}>{plan.region}</Text>
                    <Text style={[s.esimData, { color: plan.color }]}>{plan.data}</Text>
                    <Text style={s.esimValidity}>{plan.validity}</Text>
                    <View style={[s.esimPrice, { backgroundColor: plan.color }]}>
                      <Text style={s.esimPriceTxt}>${plan.price}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* eSIM Plan Modal */}
      <FocusedModal visible={!!planModal} onRequestClose={() => setPlanModal(null)} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            {planModal && (
              <>
                <Text style={s.modalTitle}>eSIM Plan</Text>
                <View style={s.modalPlanCard}>
                  <Text style={s.modalFlag}>{planModal.flag}</Text>
                  <Text style={s.modalRegion}>{planModal.region}</Text>
                  <Text style={[s.modalData, { color: planModal.color }]}>{planModal.data}</Text>
                </View>
                <View style={s.modalDetailsCard}>
                  {[
                    { label: "Data",     value: planModal.data },
                    { label: "Validity", value: planModal.validity },
                    { label: "Price",    value: `$${planModal.price}`, accent: true },
                    { label: "Delivery", value: "QR Code via Email" },
                  ].map((row, i, arr) => (
                    <View key={row.label} style={[s.modalRow, i < arr.length - 1 && s.modalRowBorder]}>
                      <Text style={s.modalRowLabel}>{row.label}</Text>
                      <Text style={[s.modalRowValue, (row as any).accent && { color: "#1072EA", fontFamily: "Inter_700Bold" }]}>{row.value}</Text>
                    </View>
                  ))}
                </View>
                <View style={s.modalQrPlaceholder}>
                  <Text style={s.modalQrTxt}>📱 QR code will appear here after purchase</Text>
                </View>
                <View style={s.modalActions}>
                  <TouchableOpacity onPress={() => setPlanModal(null)} activeOpacity={0.8} style={s.modalCancelBtn}>
                    <Text style={s.modalCancelTxt}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleBuyEsim(planModal)}
                    activeOpacity={0.85}
                    disabled={loading}
                    style={[s.modalBuyBtn, loading && { opacity: 0.65 }]}
                  >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.modalBuyTxt}>Buy ${planModal.price}</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  tabToggle: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 4, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  toggleBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: "center" },
  toggleBtnActive: { backgroundColor: "#1072EA" },
  toggleBtnTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  toggleBtnTxtActive: { color: "#FFFFFF" },
  section: { paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  balancePill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  balanceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#118D45" },
  balanceLbl: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: "#8E8E93" },
  balanceAmt: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  serviceCard: { width: "18%", minWidth: 60, flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, alignItems: "center", gap: 5, borderWidth: 1.5, borderColor: "transparent", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  serviceEmoji: { fontSize: 24 },
  serviceLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", textAlign: "center" },
  providerRow: { gap: 8, paddingBottom: 4 },
  providerBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  providerBtnActive: { backgroundColor: "#1072EA" },
  providerTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  providerTxtActive: { color: "#FFFFFF" },
  phoneInput: { fontSize: 16, fontFamily: "Inter_400Regular", color: "#1C1C1E", paddingHorizontal: 16, paddingVertical: 15 },
  amtRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 14 },
  amtPrefix: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#8E8E93", marginRight: 6 },
  amtInput: { flex: 1, fontSize: 28, fontFamily: "Inter_700Bold", color: "#1C1C1E", paddingVertical: 10 },
  quickAmtRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  qaBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F7F9FC" },
  qaBtnActive: { backgroundColor: "#1072EA" },
  qaTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  qaTxtActive: { color: "#FFFFFF" },
  txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  txRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  txIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F7F9FC", alignItems: "center", justifyContent: "center" },
  txEmoji: { fontSize: 18 },
  txService: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 2 },
  txDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  txAmount: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#1C1C1E", marginBottom: 3 },
  txStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  txStatusTxt: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  esimGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  esimCard: { width: "47%", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, alignItems: "center", gap: 6, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 3, borderWidth: 1, borderColor: "transparent" },
  esimFlag: { fontSize: 30 },
  esimRegion: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#1C1C1E", textAlign: "center" },
  esimData: { fontSize: 20, fontFamily: "Inter_700Bold" },
  esimValidity: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  esimPrice: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 4 },
  esimPriceTxt: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1C1C1E", textAlign: "center", marginBottom: 20, letterSpacing: -0.3 },
  modalPlanCard: { backgroundColor: "#F7F9FC", borderRadius: 16, padding: 20, alignItems: "center", gap: 6, marginBottom: 16 },
  modalFlag: { fontSize: 40 },
  modalRegion: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  modalData: { fontSize: 28, fontFamily: "Inter_700Bold" },
  modalDetailsCard: { backgroundColor: "#F7F9FC", borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  modalRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  modalRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  modalRowLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  modalRowValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  modalQrPlaceholder: { backgroundColor: "#F7F9FC", borderRadius: 14, padding: 20, alignItems: "center", marginBottom: 20, borderWidth: 2, borderColor: "#E5E5EA", borderStyle: "dashed" },
  modalQrTxt: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93", textAlign: "center" },
  modalActions: { flexDirection: "row", gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, backgroundColor: "#F7F9FC", alignItems: "center" },
  modalCancelTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  modalBuyBtn: { flex: 2, paddingVertical: 15, borderRadius: 14, backgroundColor: "#1072EA", alignItems: "center" },
  modalBuyTxt: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
});
