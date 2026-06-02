import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hapticSuccess, hapticError, hapticLight } from "@/utils/haptics";
import { GlowButton } from "@/components/GlowButton";
import { BrandLogo } from "@/components/BrandLogo";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import Svg, { Path } from "react-native-svg";

type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AUD";
type PaymentMethod = "wallet" | "card" | "crypto";

const GIFT_CARDS = [
  { id: "amazon",  name: "Amazon",      color: "#FF9900" },
  { id: "apple",   name: "Apple",       color: "#A2AAAD" },
  { id: "google",  name: "Google Play", color: "#34A853" },
  { id: "steam",   name: "Steam",       color: "#4A90D9" },
  { id: "netflix", name: "Netflix",     color: "#E50914" },
  { id: "xbox",    name: "Xbox",        color: "#107C10" },
];

const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD" as Currency, flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", currency: "GBP" as Currency, flag: "🇬🇧" },
  { code: "EU", name: "Europe",         currency: "EUR" as Currency, flag: "🇪🇺" },
  { code: "CA", name: "Canada",         currency: "CAD" as Currency, flag: "🇨🇦" },
  { code: "AU", name: "Australia",      currency: "AUD" as Currency, flag: "🇦🇺" },
];

const CURRENCY_RATES: Record<Currency, number> = {
  USD: 750, GBP: 945, EUR: 820, CAD: 555, AUD: 490,
};

const PRESET_AMOUNTS = [10, 25, 50, 100, 200];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; detail: string; icon: string }[] = [
  { id: "wallet", label: "Wallet Balance", detail: "NGN Wallet", icon: "💳" },
  { id: "card",   label: "Debit / Credit Card", detail: "Visa ending 4242", icon: "💳" },
  { id: "crypto", label: "Crypto",         detail: "USDT / BTC", icon: "⚡" },
];

function BackIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 5l-7 7 7 7" stroke="#1C1C1E" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} stroke="#8E8E93" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function BuyScreen() {
  const insets = useSafeAreaInsets();
  const { ngnBalance, updateNgnBalance, addTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedCard, setSelectedCard] = useState("amazon");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState<PaymentMethod>("wallet");
  const [loading, setLoading] = useState(false);

  const card = GIFT_CARDS.find((c) => c.id === selectedCard)!;
  const rate = CURRENCY_RATES[selectedCountry.currency];
  const numAmt = parseFloat(amount) || 0;
  const totalUSD = numAmt * quantity;
  const totalNGN = totalUSD * rate;
  const isValid = numAmt > 0;

  const handlePreset = useCallback((v: number) => { setAmount(String(v)); }, []);

  const handleBuy = useCallback(async () => {
    if (!isValid) { Alert.alert("Invalid Amount", "Please enter a valid gift card amount."); return; }
    if (payment === "wallet" && totalNGN > ngnBalance) {
      hapticError();
      Alert.alert("Insufficient Balance", "You don't have enough NGN in your wallet.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    if (payment === "wallet") updateNgnBalance(-totalNGN);
    addTransaction({ type: "gift_card", category: "Gift Cards", title: `${card.name} Gift Card Bought`, amount: totalNGN, currency: "NGN", status: "success", date: "Just now", direction: "out" });
    addNotification({ title: "Gift Card Purchased", message: `${card.name} gift card (${selectedCountry.currency} ${totalUSD}) purchased for ₦${totalNGN.toLocaleString()}.`, type: "success", time: "Just now" });
    hapticSuccess();
    Alert.alert("Order Placed!", `Your ${card.name} gift card (${selectedCountry.currency} ${totalUSD}) has been purchased. Check your email for delivery.`, [{ text: "Done", onPress: () => router.back() }]);
  }, [isValid, card, selectedCountry, totalUSD, totalNGN, ngnBalance, payment, updateNgnBalance, addTransaction, addNotification]);

  const summaryRows = useMemo(() => [
    { label: "Gift Card",     value: card.name },
    { label: "Region",        value: `${selectedCountry.flag} ${selectedCountry.name}` },
    { label: "Card Value",    value: numAmt > 0 ? `${selectedCountry.currency} ${numAmt}` : "—" },
    { label: "Quantity",      value: `×${quantity}` },
    { label: "Exchange Rate", value: `₦${rate}/${selectedCountry.currency}`, highlight: true },
    { label: "You Pay (NGN)", value: totalUSD > 0 ? `₦${totalNGN.toLocaleString()}` : "—", large: true },
    { label: "Processing Fee",value: "Free" },
    { label: "Delivery",      value: "Instant · Email" },
  ], [card, selectedCountry, numAmt, quantity, rate, totalUSD, totalNGN]);

  return (
    <View style={[s.root, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Buy Gift Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.scroll, { paddingBottom: botPad + 80 }]} keyboardShouldPersistTaps="handled">

        {/* Balance pill */}
        <View style={s.section}>
          <View style={s.balancePill}>
            <View style={s.balanceDot} />
            <Text style={s.balanceLbl}>Wallet Balance</Text>
            <Text style={s.balanceAmt}>₦{ngnBalance.toLocaleString()}</Text>
          </View>
        </View>

        {/* Rate widget */}
        <View style={s.section}>
          <View style={s.rateCard}>
            <View>
              <Text style={s.rateLbl}>Live Rate</Text>
              <Text style={s.rateVal}>{selectedCountry.currency} 1 = ₦{rate}</Text>
              <View style={s.rateBadge}>
                <Text style={s.rateBadgeTxt}>↑ +2.3% today</Text>
              </View>
            </View>
            <View style={s.rateBars}>
              {[0.6, 0.75, 0.55, 0.8, 0.65, 0.9, 0.7, 0.85, 0.75, 1.0].map((h, i) => (
                <View key={i} style={[s.rateBar, { height: h * 28, opacity: 0.3 + h * 0.7 }]} />
              ))}
            </View>
          </View>
        </View>

        {/* Card Selector */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Select Gift Card</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cardRow}>
            {GIFT_CARDS.map((gc) => {
              const active = gc.id === selectedCard;
              return (
                <TouchableOpacity
                  key={gc.id}
                  onPress={() => { hapticLight(); setSelectedCard(gc.id); }}
                  activeOpacity={0.8}
                  style={[s.cardChip, active && { borderColor: gc.color, backgroundColor: gc.color + "10" }]}
                >
                  <BrandLogo id={gc.id} name={gc.name} color={gc.color} size={36} borderRadius={10} />
                  <Text style={[s.cardName, active && { color: gc.color }]}>{gc.name}</Text>
                  {active && <Text style={[s.cardCheck, { color: gc.color }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Country Selector */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Country / Region</Text>
          <TouchableOpacity
            onPress={() => setCountryOpen(!countryOpen)}
            activeOpacity={0.8}
            style={s.selectRow}
          >
            <Text style={s.flag}>{selectedCountry.flag}</Text>
            <Text style={s.selectTxt}>{selectedCountry.name}</Text>
            <Text style={s.currencyTag}>{selectedCountry.currency}</Text>
            <ChevronDown open={countryOpen} />
          </TouchableOpacity>
          {countryOpen && (
            <View style={s.dropdown}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => { setSelectedCountry(c); setCountryOpen(false); }}
                  activeOpacity={0.8}
                  style={[s.dropItem, c.code === selectedCountry.code && { backgroundColor: "#E8F1FD" }]}
                >
                  <Text style={s.flag}>{c.flag}</Text>
                  <Text style={[s.dropItemTxt, c.code === selectedCountry.code && { color: "#1072EA" }]}>{c.name}</Text>
                  <Text style={s.currencyTag}>{c.currency}</Text>
                  {c.code === selectedCountry.code && <Text style={{ color: "#1072EA", fontSize: 12 }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Amount */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Card Amount ({selectedCountry.currency})</Text>
          <View style={s.amountCard}>
            <View style={s.amtInputRow}>
              <Text style={s.amtPrefix}>{selectedCountry.currency}</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#8E8E93"
                keyboardType="decimal-pad"
                style={s.amtInput}
              />
            </View>
            <View style={s.presetsRow}>
              {PRESET_AMOUNTS.map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => handlePreset(v)}
                  activeOpacity={0.8}
                  style={[s.presetBtn, numAmt === v && s.presetBtnActive]}
                >
                  <Text style={[s.presetTxt, numAmt === v && s.presetTxtActive]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Quantity */}
            <View style={s.qtyRow}>
              <Text style={s.qtyLabel}>Quantity</Text>
              <View style={s.qtyStepper}>
                <TouchableOpacity onPress={() => setQuantity((q) => Math.max(1, q - 1))} activeOpacity={0.8} style={s.qtyBtn}>
                  <Text style={s.qtyBtnTxt}>−</Text>
                </TouchableOpacity>
                <Text style={s.qtyVal}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity((q) => Math.min(10, q + 1))} activeOpacity={0.8} style={s.qtyBtn}>
                  <Text style={s.qtyBtnTxt}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Payment Method</Text>
          <View style={s.card}>
            {PAYMENT_METHODS.map((pm, i) => (
              <TouchableOpacity
                key={pm.id}
                onPress={() => { hapticLight(); setPayment(pm.id); }}
                activeOpacity={0.8}
                style={[s.payRow, i < PAYMENT_METHODS.length - 1 && s.payRowBorder]}
              >
                <View style={s.payIconWrap}><Text style={s.payIcon}>{pm.icon}</Text></View>
                <View style={s.payInfo}>
                  <Text style={s.payLabel}>{pm.label}</Text>
                  <Text style={s.payDetail}>{pm.detail}</Text>
                </View>
                <View style={[s.radio, payment === pm.id && s.radioActive]}>
                  {payment === pm.id && <View style={s.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        {numAmt > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Order Summary</Text>
            <View style={s.card}>
              {summaryRows.map((row, i, arr) => (
                <View key={row.label} style={[s.sumRow, i < arr.length - 1 && s.sumRowBorder]}>
                  <Text style={s.sumLabel}>{row.label}</Text>
                  <Text style={[
                    s.sumVal,
                    (row as any).highlight && { color: "#1072EA" },
                    (row as any).large && { fontSize: 17, fontFamily: "Inter_700Bold", color: "#118D45" },
                  ]}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Buy Button */}
        <View style={s.section}>
          <GlowButton title={loading ? "Processing..." : "Buy Gift Card"} onPress={handleBuy} disabled={loading || !isValid} />
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F9FC" },
  scroll: {},
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1C1C1E", letterSpacing: -0.3 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },

  section: { paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },

  balancePill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  balanceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#118D45" },
  balanceLbl: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#8E8E93", flex: 1 },
  balanceAmt: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1C1C1E" },

  rateCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  rateLbl: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#8E8E93", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  rateVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1072EA", marginBottom: 4 },
  rateBadge: { backgroundColor: "#E8F7EE", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  rateBadgeTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#118D45" },
  rateBars: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  rateBar: { width: 6, backgroundColor: "#1072EA", borderRadius: 3 },

  cardRow: { gap: 10, paddingBottom: 4 },
  cardChip: { alignItems: "center", gap: 6, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 12, borderWidth: 1.5, borderColor: "transparent", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardName: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  cardCheck: { fontSize: 12, fontFamily: "Inter_700Bold" },

  selectRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  flag: { fontSize: 20 },
  selectTxt: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: "#1C1C1E" },
  currencyTag: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#8E8E93", backgroundColor: "#F7F9FC", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dropdown: { backgroundColor: "#FFFFFF", borderRadius: 16, marginTop: 4, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  dropItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  dropItemTxt: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", color: "#1C1C1E" },

  amountCard: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  amtInputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 8 },
  amtPrefix: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#8E8E93" },
  amtInput: { flex: 1, fontSize: 28, fontFamily: "Inter_700Bold", color: "#1C1C1E", paddingVertical: 8 },
  presetsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 14 },
  presetBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: "#F7F9FC", alignItems: "center" },
  presetBtnActive: { backgroundColor: "#1072EA" },
  presetTxt: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  presetTxtActive: { color: "#FFFFFF" },
  qtyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  qtyLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  qtyStepper: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "#F7F9FC", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  qtyBtnTxt: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  qtyVal: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1C1C1E", minWidth: 24, textAlign: "center" },

  payRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  payRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  payIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F7F9FC", alignItems: "center", justifyContent: "center" },
  payIcon: { fontSize: 18 },
  payInfo: { flex: 1 },
  payLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 2 },
  payDetail: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#C7C7CC", alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: "#1072EA" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#1072EA" },

  sumRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  sumRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  sumLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  sumVal: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
});
