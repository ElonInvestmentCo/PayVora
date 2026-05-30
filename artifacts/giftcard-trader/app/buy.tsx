import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { hapticSuccess, hapticError } from "@/utils/haptics";
import { GlowButton } from "@/components/GlowButton";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { BrandLogo } from "@/components/BrandLogo";

// ─── Types ────────────────────────────────────────────────────────────────────

type Currency = "USD" | "GBP" | "EUR" | "CAD" | "AUD";
type PaymentMethod = "wallet" | "card" | "crypto";

// ─── Data ─────────────────────────────────────────────────────────────────────

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

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; detail: string }[] = [
  { id: "wallet", label: "Wallet Balance", icon: "credit-card", detail: "NGN Wallet" },
  { id: "card",   label: "Debit / Credit Card", icon: "credit-card", detail: "Visa ending 4242" },
  { id: "crypto", label: "Crypto",         icon: "zap",         detail: "USDT / BTC" },
];

// ─── Mini rate trend (sparkline-style bar) ────────────────────────────────────

const TREND_BARS = [0.6, 0.75, 0.55, 0.8, 0.65, 0.9, 0.7, 0.85, 0.75, 1.0];

function RateTrend({ color }: { color: string }) {
  return (
    <View style={trendStyles.wrap}>
      {TREND_BARS.map((h, i) => (
        <View
          key={i}
          style={[
            trendStyles.bar,
            {
              height: h * 28,
              backgroundColor: color,
              opacity: 0.3 + h * 0.7,
            },
          ]}
        />
      ))}
    </View>
  );
}

const trendStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  bar:  { width: 6, borderRadius: 3 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BuyScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { ngnBalance, updateNgnBalance, addTransaction } = useWallet();
  const { addNotification } = useNotifications();
  const isWeb   = Platform.OS === "web";
  const topPad  = isWeb ? 67 : insets.top;
  const botPad  = isWeb ? 34 : insets.bottom;

  const [selectedCard,    setSelectedCard]    = useState("amazon");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [countryOpen,     setCountryOpen]     = useState(false);
  const [amount,          setAmount]          = useState("");
  const [quantity,        setQuantity]        = useState(1);
  const [payment,         setPayment]         = useState<PaymentMethod>("wallet");
  const [loading,         setLoading]         = useState(false);
  const [showSummary,     setShowSummary]     = useState(false);

  const card     = GIFT_CARDS.find((c) => c.id === selectedCard)!;
  const rate     = CURRENCY_RATES[selectedCountry.currency];
  const numAmt   = parseFloat(amount) || 0;
  const totalUSD = numAmt * quantity;
  const totalNGN = totalUSD * rate;

  const isValid = numAmt > 0;

  const handlePreset = useCallback((v: number) => {
    setAmount(String(v));
    setShowSummary(false);
  }, []);

  const handleBuy = useCallback(async () => {
    if (!isValid) {
      Alert.alert("Invalid Amount", "Please enter a valid gift card amount.");
      return;
    }
    if (payment === "wallet" && totalNGN > ngnBalance) {
      hapticError();
      Alert.alert("Insufficient Balance", "You don't have enough NGN in your wallet.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    if (payment === "wallet") updateNgnBalance(-totalNGN);
    addTransaction({
      type: "gift_card",
      category: "Gift Cards",
      title: `${card.name} Gift Card Bought`,
      amount: totalNGN,
      currency: "NGN",
      status: "success",
      date: "Just now",
      direction: "out",
    });
    addNotification({
      title: "Gift Card Purchased",
      message: `${card.name} gift card (${selectedCountry.currency} ${totalUSD}) purchased for ₦${totalNGN.toLocaleString()}.`,
      type: "success",
      time: "Just now",
    });
    hapticSuccess();
    Alert.alert(
      "Order Placed!",
      `Your ${card.name} gift card (${selectedCountry.currency} ${totalUSD}) has been purchased successfully. Check your email for delivery.`,
      [{ text: "Done", onPress: () => router.back() }]
    );
  }, [isValid, card, selectedCountry, totalUSD, totalNGN, ngnBalance, payment, updateNgnBalance, addTransaction, addNotification]);

  const summaryRows = useMemo(() => [
    { label: "Gift Card",      value: card.name },
    { label: "Region",         value: `${selectedCountry.flag} ${selectedCountry.name}` },
    { label: "Card Value",     value: `${selectedCountry.currency} ${numAmt > 0 ? numAmt : "-"}` },
    { label: "Quantity",       value: `×${quantity}` },
    { label: "Exchange Rate",  value: `₦${rate}/${selectedCountry.currency}`, cyan: true },
    { label: "Total (local)",  value: totalUSD > 0 ? `${selectedCountry.currency} ${totalUSD.toFixed(2)}` : "-" },
    { label: "You Pay (NGN)",  value: totalUSD > 0 ? `₦${totalNGN.toLocaleString()}` : "-", highlight: true },
    { label: "Processing Fee", value: "Free" },
    { label: "Delivery",       value: "Instant · Email" },
  ], [card, selectedCountry, numAmt, quantity, rate, totalUSD, totalNGN]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
          testID="back-button"
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Buy Gift Card</Text>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <Feather name="bell" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Wallet balance pill ── */}
        <View style={[styles.balancePill, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.balanceDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>Wallet Balance</Text>
          <Text style={[styles.balanceAmount, { color: colors.foreground }]}>₦{ngnBalance.toLocaleString()}</Text>
        </View>

        {/* ── Rate trend widget ── */}
        <View style={[styles.rateWidget, { backgroundColor: "rgba(0,229,255,0.06)", borderColor: "rgba(0,229,255,0.18)" }]}>
          <View style={styles.rateLeft}>
            <Text style={[styles.rateLabel, { color: colors.mutedForeground }]}>Live Rate</Text>
            <Text style={[styles.rateValue, { color: colors.primary }]}>
              {selectedCountry.currency}1 = ₦{rate}
            </Text>
            <View style={styles.rateBadge}>
              <Feather name="trending-up" size={11} color="#00FF88" />
              <Text style={[styles.rateBadgeText, { color: "#00FF88" }]}>+2.3% today</Text>
            </View>
          </View>
          <RateTrend color={colors.primary} />
        </View>

        {/* ── Gift card selector ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Select Gift Card</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
            {GIFT_CARDS.map((gc) => {
              const active = gc.id === selectedCard;
              return (
                <TouchableOpacity
                  key={gc.id}
                  testID={`card-${gc.id}`}
                  onPress={() => { setSelectedCard(gc.id); setShowSummary(false); }}
                  activeOpacity={0.8}
                  style={[
                    styles.cardChip,
                    {
                      backgroundColor: active ? "rgba(0,229,255,0.1)" : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <BrandLogo
                    id={gc.id}
                    name={gc.name}
                    color={gc.color}
                    size={36}
                    borderRadius={10}
                  />
                  <Text style={[styles.cardName, { color: active ? colors.primary : colors.foreground }]}>
                    {gc.name}
                  </Text>
                  {active && <Feather name="check-circle" size={14} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Country / Region selector ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Country / Region</Text>
          <TouchableOpacity
            testID="country-selector"
            onPress={() => setCountryOpen(!countryOpen)}
            activeOpacity={0.8}
            style={[styles.selectRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={styles.flag}>{selectedCountry.flag}</Text>
            <Text style={[styles.selectText, { color: colors.foreground }]}>{selectedCountry.name}</Text>
            <Text style={[styles.currencyTag, { color: colors.mutedForeground }]}>{selectedCountry.currency}</Text>
            <Feather name={countryOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          {countryOpen && (
            <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => { setSelectedCountry(c); setCountryOpen(false); setShowSummary(false); }}
                  style={[
                    styles.dropdownItem,
                    c.code === selectedCountry.code && { backgroundColor: "rgba(0,229,255,0.08)" },
                  ]}
                >
                  <Text style={styles.flag}>{c.flag}</Text>
                  <Text style={[styles.dropdownText, { color: c.code === selectedCountry.code ? colors.primary : colors.foreground }]}>
                    {c.name}
                  </Text>
                  <Text style={[styles.currencyTag, { color: colors.mutedForeground }]}>{c.currency}</Text>
                  {c.code === selectedCountry.code && <Feather name="check" size={14} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Amount ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Amount ({selectedCountry.currency})</Text>
          <View style={[styles.amountRow, { backgroundColor: colors.card, borderColor: isValid ? colors.primary : colors.border }]}>
            <Text style={[styles.currencySymbol, { color: colors.primary }]}>{selectedCountry.currency}</Text>
            <TextInput
              testID="amount-input"
              value={amount}
              onChangeText={(v) => { setAmount(v); setShowSummary(false); }}
              placeholder="0.00"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              style={[styles.amountInput, { color: colors.foreground }]}
            />
          </View>
          {/* Preset amounts */}
          <View style={styles.presets}>
            {PRESET_AMOUNTS.map((v) => (
              <TouchableOpacity
                key={v}
                testID={`preset-${v}`}
                onPress={() => handlePreset(v)}
                activeOpacity={0.8}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: numAmt === v ? "rgba(0,229,255,0.12)" : colors.card,
                    borderColor: numAmt === v ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.presetText, { color: numAmt === v ? colors.primary : colors.mutedForeground }]}>
                  ${v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Quantity ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Quantity</Text>
          <View style={[styles.quantityRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              testID="qty-minus"
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              activeOpacity={0.8}
              style={[styles.qtyBtn, { backgroundColor: quantity === 1 ? colors.border : "rgba(0,229,255,0.12)" }]}
            >
              <Feather name="minus" size={18} color={quantity === 1 ? colors.mutedForeground : colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.qtyValue, { color: colors.foreground }]}>{quantity}</Text>
            <TouchableOpacity
              testID="qty-plus"
              onPress={() => setQuantity((q) => Math.min(10, q + 1))}
              activeOpacity={0.8}
              style={[styles.qtyBtn, { backgroundColor: "rgba(0,229,255,0.12)" }]}
            >
              <Feather name="plus" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Live price calculation ── */}
        {isValid && (
          <View style={[styles.priceCard, { backgroundColor: "rgba(0,255,136,0.06)", borderColor: "#00FF8830" }]}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>You Pay</Text>
              <View style={styles.priceConversion}>
                <Text style={[styles.priceFrom, { color: colors.foreground }]}>
                  {selectedCountry.currency} {totalUSD.toFixed(2)}
                </Text>
                <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
                <Text style={[styles.priceTo, { color: "#00FF88" }]}>₦{totalNGN.toLocaleString()}</Text>
              </View>
            </View>
            {quantity > 1 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Per Card</Text>
                <Text style={[styles.priceDetail, { color: colors.primary }]}>
                  {selectedCountry.currency} {numAmt} × {quantity} cards
                </Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Rate</Text>
              <Text style={[styles.priceDetail, { color: colors.primary }]}>
                {selectedCountry.currency}1 = ₦{rate}
              </Text>
            </View>
          </View>
        )}

        {/* ── Payment method ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Payment Method</Text>
          {PAYMENT_METHODS.map((pm) => {
            const active = pm.id === payment;
            return (
              <TouchableOpacity
                key={pm.id}
                testID={`payment-${pm.id}`}
                onPress={() => setPayment(pm.id)}
                activeOpacity={0.8}
                style={[
                  styles.paymentItem,
                  {
                    backgroundColor: active ? "rgba(0,229,255,0.07)" : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={[styles.paymentIcon, { backgroundColor: active ? "rgba(0,229,255,0.15)" : `${colors.border}80` }]}>
                  <Feather name={pm.icon as any} size={18} color={active ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentLabel, { color: active ? colors.primary : colors.foreground }]}>{pm.label}</Text>
                  <Text style={[styles.paymentDetail, { color: colors.mutedForeground }]}>{pm.detail}</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    { borderColor: active ? colors.primary : colors.border },
                  ]}
                >
                  {active && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Order Summary ── */}
        {isValid && (
          <>
            <TouchableOpacity
              onPress={() => setShowSummary((s) => !s)}
              activeOpacity={0.8}
              style={styles.summaryToggle}
            >
              <Text style={[styles.summaryToggleText, { color: colors.primary }]}>
                {showSummary ? "Hide" : "View"} Order Summary
              </Text>
              <Feather name={showSummary ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
            </TouchableOpacity>

            {showSummary && (
              <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Order Summary</Text>
                {summaryRows.map((row) => (
                  <View key={row.label} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color: row.highlight
                            ? "#00FF88"
                            : row.cyan
                            ? colors.primary
                            : colors.foreground,
                        },
                      ]}
                    >
                      {row.value}
                    </Text>
                  </View>
                ))}

                {/* Status badges */}
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: "rgba(0,255,136,0.12)", borderColor: "#00FF8830" }]}>
                    <View style={[styles.badgeDot, { backgroundColor: "#00FF88" }]} />
                    <Text style={[styles.badgeText, { color: "#00FF88" }]}>Completed</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: "rgba(245,158,11,0.12)", borderColor: "#F59E0B30" }]}>
                    <View style={[styles.badgeDot, { backgroundColor: "#F59E0B" }]} />
                    <Text style={[styles.badgeText, { color: "#F59E0B" }]}>Pending</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: "rgba(239,68,68,0.12)", borderColor: "#EF444430" }]}>
                    <View style={[styles.badgeDot, { backgroundColor: "#EF4444" }]} />
                    <Text style={[styles.badgeText, { color: "#EF4444" }]}>Failed</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* ── Buy Now CTA ── */}
        <GlowButton
          testID="buy-now-button"
          title={`Buy Now · ₦${isValid ? totalNGN.toLocaleString() : "0"}`}
          onPress={handleBuy}
          loading={loading}
          disabled={!isValid}
        />

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          By continuing you agree to our Terms of Service. Gift cards are delivered instantly to your registered email.
        </Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:    { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  content: { padding: 20, gap: 4 },

  // Balance pill
  balancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  balanceDot:    { width: 8, height: 8, borderRadius: 4 },
  balanceLabel:  { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  balanceAmount: { fontSize: 15, fontFamily: "Inter_700Bold" },

  // Rate widget
  rateWidget: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  rateLeft:       { gap: 4 },
  rateLabel:      { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.8 },
  rateValue:      { fontSize: 20, fontFamily: "Inter_700Bold" },
  rateBadge:      { flexDirection: "row", alignItems: "center", gap: 4 },
  rateBadgeText:  { fontSize: 12, fontFamily: "Inter_500Medium" },

  // Sections
  section:      { marginBottom: 20 },
  sectionLabel: {
    fontSize: 12, fontFamily: "Inter_500Medium",
    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10,
  },

  // Gift card chips
  cardRow: { gap: 10, paddingRight: 4 },
  cardChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1,
  },
  cardIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cardName:     { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Country selector
  selectRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, height: 52,
  },
  flag:       { fontSize: 20 },
  selectText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  currencyTag:{ fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dropdown: {
    marginTop: 4, borderRadius: 12, borderWidth: 1, overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },

  // Amount
  amountRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16, height: 60,
  },
  currencySymbol: { fontSize: 18, fontFamily: "Inter_700Bold", marginRight: 6 },
  amountInput:    { flex: 1, fontSize: 26, fontFamily: "Inter_700Bold" },

  // Presets
  presets:   { flexDirection: "row", gap: 8, marginTop: 10 },
  presetBtn: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 8, alignItems: "center" },
  presetText:{ fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Quantity
  quantityRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, height: 56,
  },
  qtyBtn:   { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  qtyValue: { fontSize: 22, fontFamily: "Inter_700Bold" },

  // Price calculation card
  priceCard: { borderRadius: 14, padding: 16, borderWidth: 1, gap: 12, marginBottom: 20 },
  priceRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceLabel:{ fontSize: 13, fontFamily: "Inter_400Regular" },
  priceConversion: { flexDirection: "row", alignItems: "center", gap: 6 },
  priceFrom: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  priceTo:   { fontSize: 16, fontFamily: "Inter_700Bold" },
  priceDetail:{ fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // Payment methods
  paymentItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10,
  },
  paymentIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  paymentInfo: { flex: 1, gap: 2 },
  paymentLabel:{ fontSize: 14, fontFamily: "Inter_600SemiBold" },
  paymentDetail:{ fontSize: 12, fontFamily: "Inter_400Regular" },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner: { width: 10, height: 10, borderRadius: 5 },

  // Summary toggle
  summaryToggle: {
    flexDirection: "row", alignItems: "center", gap: 6,
    justifyContent: "center", paddingVertical: 10, marginBottom: 8,
  },
  summaryToggleText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // Summary card
  summaryCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20 },
  summaryTitle:{ fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 14 },
  summaryRow:  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 11, borderBottomWidth: 1 },
  summaryLabel:{ fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryValue:{ fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Status badges
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" },
  badge:    { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText:{ fontSize: 11, fontFamily: "Inter_600SemiBold" },

  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16, marginTop: 6 },
});
