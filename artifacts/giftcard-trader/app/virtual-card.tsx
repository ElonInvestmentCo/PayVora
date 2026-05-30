import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { hapticLight, hapticSuccess, hapticWarning } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

/* ─── Types ─────────────────────────────────────────── */
type CardTier = "regular" | "platinum";

interface CardConfig {
  tier: CardTier;
  label: string;
  cardBg: string;
  accentColor: string;
  creationFeeUSD: string;
  creationFeeNGN: string;
  features: string[];
}

interface CardTx {
  id: string;
  merchant: string;
  amount: string;
  date: string;
  status: "success" | "pending" | "error";
  icon: string;
}

/* ─── Constants ──────────────────────────────────────── */
const CARD_W = 320;
const CARD_H = 200;

const CARD_CONFIGS: CardConfig[] = [
  {
    tier: "regular",
    label: "Regular",
    cardBg: "#171717",
    accentColor: "#90CAF9",
    creationFeeUSD: "$1.50",
    creationFeeNGN: "₦2,088.00",
    features: [
      "Make payments & shop anywhere online",
      "Easily manage your cards and merchant",
    ],
  },
  {
    tier: "platinum",
    label: "Platinum",
    cardBg: "#1a1400",
    accentColor: "#FFD54F",
    creationFeeUSD: "$5.00",
    creationFeeNGN: "₦6,960.00",
    features: [
      "Contactless online or in-store payment",
      "Apple Pay & Google Pay Support",
      "NFC-enabled.",
    ],
  },
];

const CARD_TRANSACTIONS: CardTx[] = [
  { id: "1", merchant: "Netflix",        amount: "-$15.99",  date: "Today, 4:12 PM",     status: "success", icon: "tv" },
  { id: "2", merchant: "Amazon",         amount: "-$42.50",  date: "Today, 1:30 PM",     status: "success", icon: "shopping-bag" },
  { id: "3", merchant: "Spotify",        amount: "-$9.99",   date: "Yesterday, 8:00 AM", status: "pending", icon: "music" },
  { id: "4", merchant: "Adobe Creative", amount: "-$54.99",  date: "Apr 1, 2:15 PM",     status: "success", icon: "pen-tool" },
  { id: "5", merchant: "Google Cloud",   amount: "-$120.00", date: "Mar 31, 11:00 AM",   status: "error",   icon: "cloud" },
];

const SPENDING_DATA = [25, 40, 35, 55, 45, 60, 50, 70, 65, 80, 72, 90, 85, 78, 92, 88];

const STATUS_CFG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  success: { bg: "rgba(0,255,136,0.12)",  border: "#00FF8830", text: "#00FF88", label: "Successful" },
  pending: { bg: "rgba(245,158,11,0.12)", border: "#F59E0B30", text: "#F59E0B", label: "Pending" },
  error:   { bg: "rgba(239,68,68,0.12)",  border: "#EF444430", text: "#EF4444", label: "Failed" },
};

/* ─── Mastercard Logo ────────────────────────────────── */
function MastercardLogo() {
  return (
    <View style={fc.mcWrap}>
      <View style={[fc.mcCircle, { backgroundColor: "#d50000" }]} />
      <View style={[fc.mcCircle, { backgroundColor: "#ff9800", marginLeft: -10, opacity: 0.9 }]} />
    </View>
  );
}

/* ─── EMV Chip ───────────────────────────────────────── */
function ChipIcon() {
  return (
    <View style={fc.chipOuter}>
      <View style={fc.chipRow}>
        <View style={fc.chipCell} /><View style={fc.chipCell} /><View style={fc.chipCell} />
      </View>
      <View style={[fc.chipRow, { flex: 1 }]}>
        <View style={fc.chipCellTall} /><View style={[fc.chipCellTall, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#8a6800" }]} /><View style={fc.chipCellTall} />
      </View>
      <View style={fc.chipRow}>
        <View style={fc.chipCell} /><View style={fc.chipCell} /><View style={fc.chipCell} />
      </View>
    </View>
  );
}

/* ─── Contactless arcs ───────────────────────────────── */
function ContactlessIcon() {
  return (
    <View style={fc.clWrap}>
      {[12, 18, 24].map((s, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: s,
            height: s,
            borderRadius: s / 2,
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.7)",
            borderLeftColor: "transparent",
            borderBottomColor: "transparent",
            transform: [{ rotate: "45deg" }],
          }}
        />
      ))}
    </View>
  );
}

/* ─── Flip Card ──────────────────────────────────────── */
interface FlipCardProps {
  config: CardConfig;
  cardNumber: string;
  holderName: string;
  expiry: string;
  cvv: string;
  showDetails: boolean;
}

function FlipCard({ config, cardNumber, holderName, expiry, cvv, showDetails }: FlipCardProps) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const handleFlip = useCallback(() => {
    hapticLight();
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  }, [flipped, flipAnim]);

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  const maskedNumber = showDetails
    ? cardNumber
    : cardNumber.replace(/(\d{4} )(\d{4} )(\d{4} )/, "**** **** **** ");
  const maskedExpiry = showDetails ? expiry : "**/**";
  const maskedCvv    = showDetails ? cvv    : "***";

  return (
    <TouchableOpacity activeOpacity={1} onPress={handleFlip} style={fc.outerWrap}>
      {/* FRONT */}
      <Animated.View
        style={[
          fc.card,
          { backgroundColor: config.cardBg, opacity: frontOpacity, transform: [{ perspective: 1000 }, { rotateY: frontRotateY }] },
        ]}
      >
        {/* glow accent blob */}
        <View style={[fc.glow, { backgroundColor: config.accentColor }]} />

        {/* row 1: MASTERCARD label + logo */}
        <View style={fc.row}>
          <Text style={fc.brandLabel}>MASTERCARD</Text>
          <MastercardLogo />
        </View>

        {/* row 2: chip + contactless */}
        <View style={[fc.row, { marginTop: 2 }]}>
          <ChipIcon />
          <ContactlessIcon />
        </View>

        {/* card number */}
        <Text style={fc.cardNumber}>{maskedNumber}</Text>

        {/* bottom row */}
        <View style={fc.bottomRow}>
          <View>
            <Text style={fc.fieldLabel}>VALID THRU</Text>
            <Text style={fc.fieldValue}>{maskedExpiry}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={{ alignItems: "flex-end" }}>
            <Text style={fc.fieldLabel}>CARD HOLDER</Text>
            <Text style={fc.fieldValue}>{holderName}</Text>
          </View>
        </View>
      </Animated.View>

      {/* BACK */}
      <Animated.View
        style={[
          fc.card,
          fc.cardAbsolute,
          { backgroundColor: config.cardBg, opacity: backOpacity, transform: [{ perspective: 1000 }, { rotateY: backRotateY }] },
        ]}
      >
        {/* magnetic stripe */}
        <View style={fc.magStripe} />

        {/* signature + CVV row */}
        <View style={fc.backMid}>
          <View style={fc.sigStrip} />
          <View style={fc.cvvBox}>
            <Text style={fc.cvvText}>{maskedCvv}</Text>
          </View>
        </View>

        {/* Mastercard logo bottom-right */}
        <View style={[fc.row, { justifyContent: "flex-end", marginTop: "auto", paddingTop: 12 }]}>
          <MastercardLogo />
        </View>
      </Animated.View>

      {/* tap hint */}
      <View style={fc.tapHint}>
        <Feather name="refresh-cw" size={10} color="rgba(255,255,255,0.5)" />
        <Text style={fc.tapHintText}>tap to flip</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Spending Chart ─────────────────────────────────── */
function SpendingChart() {
  const max = Math.max(...SPENDING_DATA);
  const min = Math.min(...SPENDING_DATA);
  const range = max - min || 1;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: 54 }}>
      {SPENDING_DATA.map((v, i) => {
        const pct = (v - min) / range;
        const isLast = i === SPENDING_DATA.length - 1;
        return (
          <View key={i} style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={{ height: 6 + pct * 44, borderRadius: 3, backgroundColor: isLast ? "#8B5CF6" : `rgba(0,229,255,${0.2 + pct * 0.6})` }} />
          </View>
        );
      })}
    </View>
  );
}

/* ─── Main Screen ────────────────────────────────────── */
export default function VirtualCardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    virtualCardBalance, virtualCardFrozen,
    fundVirtualCard, withdrawVirtualCard, toggleFreezeCard,
    addTransaction, usdBalance,
  } = useWallet();
  const { addNotification } = useNotifications();

  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const [stage, setStage]               = useState<"select" | "manage">("select");
  const [selectedTier, setSelectedTier] = useState<CardTier>("regular");
  const [showDetails, setShowDetails]   = useState(false);
  const [onlineTx, setOnlineTx]         = useState(true);

  const activeConfig = CARD_CONFIGS.find((c) => c.tier === selectedTier)!;

  const handleContinue = useCallback(() => { hapticLight(); setStage("manage"); }, []);

  const handleFund = useCallback(async () => {
    const amt = 100;
    if (usdBalance < amt) { hapticWarning(); Alert.alert("Insufficient Balance", "You don't have enough USD in your wallet."); return; }
    fundVirtualCard(amt); hapticSuccess();
    addTransaction({ type: "card", category: "Card", title: "Virtual Card Funding",    amount: amt, currency: "USD", status: "success", date: "Just now", direction: "out" });
    addNotification({ title: "Card Funded",    message: `$${amt} added to your virtual card.`,        type: "success", time: "Just now" });
    Alert.alert("Card Funded", `Successfully added $${amt} to your virtual card.`);
  }, [usdBalance, fundVirtualCard, addTransaction, addNotification]);

  const handleWithdraw = useCallback(() => {
    const amt = 50;
    if (virtualCardBalance < amt) { hapticWarning(); Alert.alert("Insufficient Card Balance", "Not enough funds on card to withdraw."); return; }
    withdrawVirtualCard(amt);
    addTransaction({ type: "card", category: "Card", title: "Virtual Card Withdrawal", amount: amt, currency: "USD", status: "success", date: "Just now", direction: "in" });
    addNotification({ title: "Card Withdrawal", message: `$${amt} withdrawn from virtual card.`,       type: "info",    time: "Just now" });
    Alert.alert("Withdraw", `Withdrawal of $${amt} initiated from your virtual card.`);
  }, [virtualCardBalance, withdrawVirtualCard, addTransaction, addNotification]);

  /* shared card element */
  const cardElement = (
    <FlipCard
      config={activeConfig}
      cardNumber="9759 2484 5269 6576"
      holderName="ALEX JOHNSON"
      expiry="12/28"
      cvv="491"
      showDetails={showDetails}
    />
  );

  /* ── SELECTION SCREEN ────────────────────────────────── */
  if (stage === "select") {
    return (
      <View style={[s.root, { backgroundColor: colors.background }]}>
        <View style={[s.header, { paddingTop: topPad + 12, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={[s.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>Virtual Dollar Card</Text>
          <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
            <Feather name="mail" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.selectContent, { paddingBottom: botPad + 32 }]}>
          <Text style={[s.selectTitle,    { color: colors.foreground }]}>Select Card Option</Text>
          <Text style={[s.selectSubtitle, { color: colors.mutedForeground }]}>Read the description and select the card that you prefer</Text>

          {/* tier toggle */}
          <View style={[s.tierWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {CARD_CONFIGS.map((cfg) => {
              const active = selectedTier === cfg.tier;
              return (
                <TouchableOpacity
                  key={cfg.tier}
                  style={[s.tierBtn, active && s.tierBtnActive]}
                  onPress={() => { hapticLight(); setSelectedTier(cfg.tier); }}
                  activeOpacity={0.8}
                >
                  <Text style={[s.tierBtnText, { color: active ? "#FFFFFF" : colors.mutedForeground }]}>{cfg.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {cardElement}

          {/* creation fee */}
          <View style={[s.feeRow, { backgroundColor: `${activeConfig.accentColor}18`, borderColor: `${activeConfig.accentColor}40` }]}>
            <Text style={[s.feeText, { color: activeConfig.accentColor }]}>
              Creation Fee: {activeConfig.creationFeeUSD} / {activeConfig.creationFeeNGN}
            </Text>
            <Feather name="info" size={16} color={activeConfig.accentColor} />
          </View>

          {/* features */}
          <View style={s.featureList}>
            {activeConfig.features.map((f, i) => (
              <View key={i} style={s.featureRow}>
                <View style={[s.checkCircle, { borderColor: activeConfig.accentColor }]}>
                  <Feather name="check" size={11} color={activeConfig.accentColor} />
                </View>
                <Text style={[s.featureText, { color: colors.foreground }]}>{f}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={[s.btnWrap, { paddingBottom: botPad + 20, backgroundColor: colors.background }]}>
          <TouchableOpacity style={s.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={s.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── MANAGEMENT SCREEN ───────────────────────────────── */
  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: topPad + 12, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => setStage("select")} style={[s.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.foreground }]}>{activeConfig.label} Dollar Card</Text>
        <TouchableOpacity style={[s.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="settings" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.manageContent, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        {cardElement}

        {/* balance + frozen */}
        <View style={[s.balanceBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.balanceLabel, { color: colors.mutedForeground }]}>Card Balance</Text>
          <Text style={[s.balanceValue, { color: colors.foreground }]}>
            ${virtualCardBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          {virtualCardFrozen && (
            <View style={s.frozenBadge}>
              <Feather name="lock" size={11} color="#EF4444" />
              <Text style={{ color: "#EF4444", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>Frozen</Text>
            </View>
          )}
        </View>

        {/* show/hide */}
        <TouchableOpacity onPress={() => setShowDetails(!showDetails)} activeOpacity={0.8} style={s.toggleRow}>
          <Feather name={showDetails ? "eye-off" : "eye"} size={16} color={colors.primary} />
          <Text style={[s.toggleText, { color: colors.primary }]}>{showDetails ? "Hide" : "Show"} Card Details</Text>
        </TouchableOpacity>

        {/* actions */}
        <View style={s.actionRow}>
          {[
            { label: "Fund Card", icon: "plus",           color: colors.primary, bg: "rgba(0,229,255,0.12)", bgI: "rgba(0,229,255,0.2)",  onPress: handleFund },
            { label: "Withdraw",  icon: "arrow-up-right", color: "#14B8A6",      bg: "rgba(20,184,166,0.12)",bgI: "rgba(20,184,166,0.2)", onPress: handleWithdraw },
            {
              label: virtualCardFrozen ? "Unfreeze" : "Freeze",
              icon: virtualCardFrozen ? "unlock" : "lock",
              color: virtualCardFrozen ? "#EF4444" : "#F59E0B",
              bg:  virtualCardFrozen ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
              bgI: virtualCardFrozen ? "rgba(239,68,68,0.2)"  : "rgba(245,158,11,0.2)",
              onPress: toggleFreezeCard,
            },
          ].map((a) => (
            <TouchableOpacity key={a.label} onPress={a.onPress} activeOpacity={0.8} style={[s.actionBtn, { backgroundColor: a.bg }]}>
              <View style={[s.actionIcon, { backgroundColor: a.bgI }]}>
                <Feather name={a.icon as any} size={18} color={a.color} />
              </View>
              <Text style={[s.actionLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* spending chart */}
        <View style={[s.spendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={[s.sectionTitle, { color: colors.foreground }]}>Monthly Spending</Text>
            <Text style={[s.sectionTitle, { color: colors.primary }]}>$255.47</Text>
          </View>
          <SpendingChart />
        </View>

        {/* card settings */}
        <View style={[s.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>Card Settings</Text>
          {[
            {
              icon: "globe", label: "Online Transactions", desc: "Allow online purchases",
              right: <Switch value={onlineTx} onValueChange={setOnlineTx} trackColor={{ false: colors.border, true: "rgba(0,229,255,0.4)" }} thumbColor={onlineTx ? colors.primary : colors.mutedForeground} />,
            },
            {
              icon: "shield", label: "Spending Limit", desc: "$500.00 / day",
              right: <Feather name="chevron-right" size={18} color={colors.mutedForeground} />,
            },
            {
              icon: "bell", label: "Transaction Alerts", desc: "Push notifications",
              right: <Switch value={true} trackColor={{ false: colors.border, true: "rgba(0,255,136,0.4)" }} thumbColor="#00FF88" />,
            },
          ].map((row, idx, arr) => (
            <View key={row.label} style={[s.settingRow, { borderBottomColor: colors.border, borderBottomWidth: idx < arr.length - 1 ? 1 : 0 }]}>
              <View style={s.settingInfo}>
                <Feather name={row.icon as any} size={16} color={colors.mutedForeground} />
                <View>
                  <Text style={[s.settingLabel, { color: colors.foreground }]}>{row.label}</Text>
                  <Text style={[s.settingDesc,  { color: colors.mutedForeground }]}>{row.desc}</Text>
                </View>
              </View>
              {row.right}
            </View>
          ))}
        </View>

        {/* transactions */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Card Transactions</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={{ color: colors.primary, fontSize: 13, fontFamily: "Inter_500Medium" }}>See all</Text>
          </TouchableOpacity>
        </View>

        {CARD_TRANSACTIONS.map((tx) => {
          const st = STATUS_CFG[tx.status];
          return (
            <View key={tx.id} style={[s.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.txIcon, { backgroundColor: `${st.text}15` }]}>
                <Feather name={tx.icon as any} size={16} color={st.text} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.txMerchant, { color: colors.foreground }]}>{tx.merchant}</Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{tx.date}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text style={[s.txMerchant, { color: colors.foreground }]}>{tx.amount}</Text>
                <View style={[s.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                  <View style={[s.statusDot, { backgroundColor: st.text }]} />
                  <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: st.text }}>{st.label}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ─── Flip-card styles ───────────────────────────────── */
const fc = StyleSheet.create({
  outerWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
    height: CARD_H + 22,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 16,
    padding: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
    justifyContent: "space-between",
  },
  cardAbsolute: {
    position: "absolute",
    top: 0,
  },
  glow: {
    position: "absolute",
    bottom: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.07,
  },

  /* row helpers */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  /* brand label */
  brandLabel: {
    fontSize: 8,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_600SemiBold",
  },

  /* Mastercard */
  mcWrap: { flexDirection: "row", width: 36, height: 22, alignItems: "center" },
  mcCircle: { width: 22, height: 22, borderRadius: 11 },

  /* chip */
  chipOuter: {
    width: 36,
    height: 28,
    backgroundColor: "#D4A017",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#b8860b",
    justifyContent: "space-between",
  },
  chipRow: { flexDirection: "row", height: 7 },
  chipCell: { flex: 1, borderWidth: 0.5, borderColor: "#8a6800" },
  chipCellTall: { flex: 1 },

  /* contactless */
  clWrap: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },

  /* card text */
  cardNumber: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    letterSpacing: 2.5,
    textAlign: "center",
    marginVertical: 2,
  },
  fieldLabel: {
    fontSize: 8,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 12,
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },

  /* back face */
  magStripe: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    height: 42,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  backMid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 90,
    paddingHorizontal: 0,
  },
  sigStrip: {
    flex: 1,
    height: 32,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
  },
  cvvBox: {
    width: 54,
    height: 32,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  cvvText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#111",
    letterSpacing: 3,
  },

  /* tap hint */
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  tapHintText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    fontFamily: "Inter_400Regular",
  },
});

/* ─── Screen styles ──────────────────────────────────── */
const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  selectContent:  { paddingHorizontal: 20, paddingTop: 28 },
  selectTitle:    { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 8 },
  selectSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 24 },

  tierWrap: { flexDirection: "row", borderRadius: 30, padding: 4, borderWidth: 1, marginBottom: 0 },
  tierBtn: { flex: 1, paddingVertical: 10, borderRadius: 26, alignItems: "center" },
  tierBtnActive: { backgroundColor: "#0F2A5C" },
  tierBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  feeRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 10, paddingHorizontal: 18,
    borderRadius: 30, borderWidth: 1, marginBottom: 20, alignSelf: "center",
  },
  feeText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  featureList: { gap: 14, marginBottom: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  featureText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },

  btnWrap: { paddingHorizontal: 20 },
  continueBtn: { borderRadius: 14, paddingVertical: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#0F2A5C" },
  continueBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },

  manageContent: { paddingHorizontal: 20, paddingTop: 8 },

  balanceBadge: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 4 },
  balanceLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  balanceValue: { fontSize: 22, fontFamily: "Inter_700Bold", flex: 1 },
  frozenBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: "rgba(239,68,68,0.12)", borderWidth: 1, borderColor: "#EF444430" },

  toggleRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", paddingVertical: 12, marginBottom: 4 },
  toggleText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  actionRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", gap: 8 },
  actionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  spendCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20 },

  settingsCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  settingInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  settingDesc: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },

  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },

  txRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txMerchant: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
});
