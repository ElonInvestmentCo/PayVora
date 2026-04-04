import React, { useState, useCallback } from "react";
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

interface BillTx {
  id: string;
  service: string;
  amount: string;
  date: string;
  status: "success" | "pending" | "error";
  icon: string;
}

const SERVICES: { id: ServiceId; label: string; icon: string; color: string }[] = [
  { id: "airtime",     label: "Airtime",     icon: "phone",    color: "#00E5FF" },
  { id: "data",        label: "Data",        icon: "wifi",     color: "#14B8A6" },
  { id: "electricity", label: "Electricity", icon: "zap",      color: "#F59E0B" },
  { id: "tv",          label: "TV Sub",      icon: "tv",       color: "#8B5CF6" },
  { id: "internet",    label: "Internet",    icon: "globe",    color: "#00FF88" },
];

const PROVIDERS: Record<ServiceId, string[]> = {
  airtime:     ["MTN", "Airtel", "Glo", "9mobile"],
  data:        ["MTN", "Airtel", "Glo", "9mobile"],
  electricity: ["IKEDC", "EKEDC", "AEDC", "PHEDC"],
  tv:          ["DSTV", "GOtv", "StarTimes", "ShowMax"],
  internet:    ["Spectranet", "Smile", "Swift", "ipNX"],
};

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

const ESIM_PLANS: ESimPlan[] = [
  { id: "1", region: "United States", flag: "🇺🇸", data: "5 GB",  validity: "7 days",  price: 8.99,  color: "#00E5FF" },
  { id: "2", region: "Europe",        flag: "🇪🇺", data: "10 GB", validity: "30 days", price: 15.99, color: "#14B8A6" },
  { id: "3", region: "United Kingdom",flag: "🇬🇧", data: "3 GB",  validity: "7 days",  price: 6.99,  color: "#8B5CF6" },
  { id: "4", region: "Global",        flag: "🌍", data: "1 GB",  validity: "15 days", price: 4.99,  color: "#F59E0B" },
  { id: "5", region: "Japan",         flag: "🇯🇵", data: "10 GB", validity: "30 days", price: 12.99, color: "#00FF88" },
  { id: "6", region: "Canada",        flag: "🇨🇦", data: "5 GB",  validity: "15 days", price: 9.99,  color: "#FF4444" },
];

const BILL_TRANSACTIONS: BillTx[] = [
  { id: "1", service: "MTN Airtime",    amount: "$10.00",  date: "Today, 2:15 PM",       status: "success", icon: "phone" },
  { id: "2", service: "DSTV Premium",   amount: "$35.00",  date: "Yesterday, 10:30 AM",  status: "success", icon: "tv" },
  { id: "3", service: "IKEDC Electric", amount: "$20.00",  date: "Apr 1, 6:45 PM",       status: "pending", icon: "zap" },
  { id: "4", service: "eSIM — Europe",  amount: "$15.99",  date: "Mar 30, 3:20 PM",      status: "success", icon: "globe" },
  { id: "5", service: "Airtel Data",    amount: "$5.00",   date: "Mar 29, 1:00 PM",      status: "error",   icon: "wifi" },
];

const STATUS_CFG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  success: { bg: "rgba(0,255,136,0.12)", border: "#00FF8830", text: "#00FF88", label: "Successful" },
  pending: { bg: "rgba(245,158,11,0.12)", border: "#F59E0B30", text: "#F59E0B", label: "Pending" },
  error:   { bg: "rgba(239,68,68,0.12)", border: "#EF444430", text: "#EF4444", label: "Failed" },
};

export default function BillsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { usdBalance, updateUsdBalance, addTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const [tab, setTab] = useState<ActiveTab>("bills");
  const [selectedService, setSelectedService] = useState<ServiceId>("airtime");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState("");
  const [providerOpen, setProviderOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<ESimPlan | null>(null);
  const [planModal, setPlanModal] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const isValidBill = phone.length >= 5 && provider && numAmount > 0;

  const handlePay = useCallback(async () => {
    if (!isValidBill) {
      Alert.alert("Error", "Please fill in all fields with valid values.");
      return;
    }
    if (numAmount > usdBalance) {
      Alert.alert("Insufficient Balance", "You don't have enough USD in your wallet.");
      return;
    }
    setPayLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPayLoading(false);
    updateUsdBalance(-numAmount);
    addTransaction({
      type: "bills",
      category: "Bills",
      title: `${provider} ${SERVICES.find(s => s.id === selectedService)?.label}`,
      amount: numAmount,
      currency: "USD",
      status: "success",
      date: "Just now",
      direction: "out",
    });
    addNotification({
      title: "Bill Paid",
      message: `$${numAmount.toFixed(2)} ${selectedService} payment to ${provider} completed.`,
      type: "success",
      time: "Just now",
    });
    Alert.alert("Payment Successful", `$${numAmount.toFixed(2)} ${selectedService} payment to ${provider} completed.`);
    setPhone(""); setAmount(""); setProvider("");
  }, [isValidBill, numAmount, selectedService, provider, usdBalance, updateUsdBalance, addTransaction, addNotification]);

  const handleBuyEsim = useCallback(async () => {
    if (!selectedPlan) return;
    if (selectedPlan.price > usdBalance) {
      Alert.alert("Insufficient Balance", "You don't have enough USD in your wallet.");
      return;
    }
    setBuyLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setBuyLoading(false);
    setPlanModal(false);
    updateUsdBalance(-selectedPlan.price);
    addTransaction({
      type: "bills",
      category: "Bills",
      title: `eSIM — ${selectedPlan.region}`,
      amount: selectedPlan.price,
      currency: "USD",
      status: "success",
      date: "Just now",
      direction: "out",
    });
    addNotification({
      title: "eSIM Purchased",
      message: `${selectedPlan.region} ${selectedPlan.data} plan activated. Check your email for the QR code.`,
      type: "success",
      time: "Just now",
    });
    Alert.alert("eSIM Purchased!", `${selectedPlan.region} ${selectedPlan.data} plan activated. Check your email for the QR code.`);
  }, [selectedPlan, usdBalance, updateUsdBalance, addTransaction, addNotification]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8} testID="back-button">
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Bills & eSIMs</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="clock" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Tab switcher */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {(["bills", "esims"] as ActiveTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            testID={`tab-${t}`}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
            style={[styles.tabBtn, { backgroundColor: tab === t ? "rgba(0,229,255,0.15)" : "transparent", borderColor: tab === t ? colors.primary : "transparent" }]}
          >
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
              {t === "bills" ? "Bills" : "eSIMs"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        {tab === "bills" ? (
          <>
            {/* Service categories */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Select Service</Text>
              <View style={styles.serviceGrid}>
                {SERVICES.map((svc) => {
                  const active = svc.id === selectedService;
                  return (
                    <TouchableOpacity
                      key={svc.id}
                      testID={`svc-${svc.id}`}
                      onPress={() => { setSelectedService(svc.id); setProvider(""); }}
                      activeOpacity={0.8}
                      style={[styles.serviceCard, { backgroundColor: active ? "rgba(0,229,255,0.1)" : colors.card, borderColor: active ? colors.primary : colors.border }]}
                    >
                      <View style={[styles.serviceIcon, { backgroundColor: `${svc.color}20` }]}>
                        <Feather name={svc.icon as any} size={20} color={svc.color} />
                      </View>
                      <Text style={[styles.serviceLabel, { color: active ? colors.primary : colors.foreground }]}>{svc.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Provider */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Provider</Text>
              <TouchableOpacity testID="provider-selector" onPress={() => setProviderOpen(!providerOpen)} activeOpacity={0.8} style={[styles.selectRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.selectText, { color: provider ? colors.foreground : colors.mutedForeground }]}>{provider || "Select provider"}</Text>
                <Feather name={providerOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
              {providerOpen && (
                <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {PROVIDERS[selectedService].map((p) => (
                    <TouchableOpacity key={p} onPress={() => { setProvider(p); setProviderOpen(false); }} style={[styles.dropdownItem, p === provider && { backgroundColor: "rgba(0,229,255,0.08)" }]}>
                      <Text style={[styles.dropdownText, { color: p === provider ? colors.primary : colors.foreground }]}>{p}</Text>
                      {p === provider && <Feather name="check" size={14} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Phone / Meter number */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                {selectedService === "electricity" ? "Meter Number" : "Phone Number"}
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name={selectedService === "electricity" ? "hash" : "phone"} size={16} color={colors.mutedForeground} />
                <TextInput
                  testID="phone-input"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={selectedService === "electricity" ? "Enter meter number" : "Enter phone number"}
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  style={[styles.textInput, { color: colors.foreground }]}
                />
              </View>
            </View>

            {/* Amount */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Amount (USD)</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: numAmount > 0 ? colors.primary : colors.border }]}>
                <Text style={[styles.prefix, { color: colors.primary }]}>$</Text>
                <TextInput
                  testID="amount-input"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  style={[styles.textInput, styles.amountInput, { color: colors.foreground }]}
                />
              </View>
              <View style={styles.quickRow}>
                {QUICK_AMOUNTS.map((v) => (
                  <TouchableOpacity key={v} testID={`quick-${v}`} onPress={() => setAmount(String(v))} activeOpacity={0.8} style={[styles.quickBtn, { backgroundColor: numAmount === v ? "rgba(0,229,255,0.12)" : colors.card, borderColor: numAmount === v ? colors.primary : colors.border }]}>
                    <Text style={[styles.quickText, { color: numAmount === v ? colors.primary : colors.mutedForeground }]}>${v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Summary */}
            {isValidBill && (
              <View style={[styles.summaryCard, { backgroundColor: "rgba(0,255,136,0.06)", borderColor: "#00FF8830" }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>Service</Text>
                  <Text style={[styles.summaryVal, { color: colors.foreground }]}>{SERVICES.find(s => s.id === selectedService)?.label}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>Provider</Text>
                  <Text style={[styles.summaryVal, { color: colors.foreground }]}>{provider}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>Amount</Text>
                  <Text style={[styles.summaryVal, { color: "#00FF88" }]}>${numAmount.toFixed(2)}</Text>
                </View>
              </View>
            )}

            <GlowButton testID="pay-now" title={`Pay Now · $${numAmount > 0 ? numAmount.toFixed(2) : "0.00"}`} onPress={handlePay} loading={payLoading} disabled={!isValidBill} />
          </>
        ) : (
          <>
            {/* eSIM plans */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Available eSIM Plans</Text>
              {ESIM_PLANS.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  testID={`esim-${plan.id}`}
                  onPress={() => { setSelectedPlan(plan); setPlanModal(true); }}
                  activeOpacity={0.8}
                  style={[styles.esimCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.esimLeft}>
                    <Text style={styles.esimFlag}>{plan.flag}</Text>
                    <View style={styles.esimInfo}>
                      <Text style={[styles.esimRegion, { color: colors.foreground }]}>{plan.region}</Text>
                      <Text style={[styles.esimMeta, { color: colors.mutedForeground }]}>{plan.data} · {plan.validity}</Text>
                    </View>
                  </View>
                  <View style={styles.esimRight}>
                    <Text style={[styles.esimPrice, { color: colors.primary }]}>${plan.price.toFixed(2)}</Text>
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Transaction History */}
        <View style={styles.txHeaderRow}>
          <Text style={[styles.txTitle, { color: colors.foreground }]}>Recent Transactions</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {BILL_TRANSACTIONS.map((tx) => {
          const st = STATUS_CFG[tx.status];
          return (
            <View key={tx.id} style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.txIcon, { backgroundColor: `${st.text}15` }]}>
                <Feather name={tx.icon as any} size={16} color={st.text} />
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txService, { color: colors.foreground }]}>{tx.service}</Text>
                <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{tx.date}</Text>
              </View>
              <View style={styles.txRightCol}>
                <Text style={[styles.txAmount, { color: colors.foreground }]}>{tx.amount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                  <View style={[styles.statusDot, { backgroundColor: st.text }]} />
                  <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* eSIM Plan Modal */}
      <Modal transparent visible={planModal} animationType="fade" onRequestClose={() => setPlanModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setPlanModal(false)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => {}}>
            {selectedPlan && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>eSIM Plan Details</Text>
                  <TouchableOpacity onPress={() => setPlanModal(false)} activeOpacity={0.8}>
                    <Feather name="x" size={22} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.planHighlight, { backgroundColor: `${selectedPlan.color}12`, borderColor: `${selectedPlan.color}30` }]}>
                  <Text style={styles.planFlag}>{selectedPlan.flag}</Text>
                  <View>
                    <Text style={[styles.planRegion, { color: colors.foreground }]}>{selectedPlan.region}</Text>
                    <Text style={[styles.planMeta, { color: colors.mutedForeground }]}>Mobile Data eSIM</Text>
                  </View>
                </View>

                {[
                  { label: "Data",     value: selectedPlan.data },
                  { label: "Validity", value: selectedPlan.validity },
                  { label: "Coverage", value: selectedPlan.region },
                  { label: "Price",    value: `$${selectedPlan.price.toFixed(2)}`, highlight: true },
                ].map((row) => (
                  <View key={row.label} style={[styles.modalRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.modalLbl, { color: colors.mutedForeground }]}>{row.label}</Text>
                    <Text style={[styles.modalVal, { color: row.highlight ? "#00FF88" : colors.foreground }]}>{row.value}</Text>
                  </View>
                ))}

                <View style={[styles.qrPlaceholder, { backgroundColor: "rgba(0,229,255,0.06)", borderColor: "rgba(0,229,255,0.15)" }]}>
                  <Feather name="smartphone" size={24} color={colors.primary} />
                  <Text style={[styles.qrText, { color: colors.mutedForeground }]}>QR code will be displayed after purchase</Text>
                </View>

                <GlowButton testID="buy-esim" title={`Buy eSIM · $${selectedPlan.price.toFixed(2)}`} onPress={handleBuyEsim} loading={buyLoading} />
              </>
            )}
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
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  tabRow: { flexDirection: "row", marginHorizontal: 20, marginTop: 16, borderRadius: 12, borderWidth: 1, padding: 4, gap: 4 },
  tabBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1 },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  content: { padding: 20, gap: 4 },

  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },

  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  serviceCard: {
    width: "30.5%", borderRadius: 14, borderWidth: 1,
    paddingVertical: 16, alignItems: "center", gap: 8,
  },
  serviceIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  serviceLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  selectRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, height: 52,
  },
  selectText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  dropdown: { marginTop: 4, borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  dropdownItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  dropdownText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16, height: 56,
  },
  prefix: { fontSize: 20, fontFamily: "Inter_700Bold" },
  textInput: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium" },
  amountInput: { fontSize: 24, fontFamily: "Inter_700Bold" },

  quickRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  quickBtn: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 8, alignItems: "center" },
  quickText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  summaryCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 10, marginBottom: 20 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLbl: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  esimCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10,
  },
  esimLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  esimFlag: { fontSize: 28 },
  esimInfo: { gap: 2 },
  esimRegion: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  esimMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  esimRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  esimPrice: { fontSize: 16, fontFamily: "Inter_700Bold" },

  txHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, marginTop: 8 },
  txTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  txRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1, gap: 2 },
  txService: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  txDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  txRightCol: { alignItems: "flex-end", gap: 4 },
  txAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },

  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end", padding: 16 },
  modal: { borderRadius: 20, padding: 20, borderWidth: 1, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  planHighlight: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 16,
  },
  planFlag: { fontSize: 36 },
  planRegion: { fontSize: 16, fontFamily: "Inter_700Bold" },
  planMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  modalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  modalLbl: { fontSize: 13, fontFamily: "Inter_400Regular" },
  modalVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  qrPlaceholder: {
    borderRadius: 14, padding: 20, borderWidth: 1,
    alignItems: "center", gap: 8, marginVertical: 16,
  },
  qrText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
