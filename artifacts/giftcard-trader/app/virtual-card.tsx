import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
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
  gradient: [string, string, string];
  accent: string;
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
const CARD_CONFIGS: CardConfig[] = [
  {
    tier: "regular",
    label: "Regular",
    gradient: ["#1a3a6e", "#1e5096", "#1565C0"],
    accent: "#90CAF9",
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
    gradient: ["#7c4a00", "#c47a00", "#d4a017"],
    accent: "#FFD54F",
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
  { id: "1", merchant: "Netflix", amount: "-$15.99", date: "Today, 4:12 PM", status: "success", icon: "tv" },
  { id: "2", merchant: "Amazon", amount: "-$42.50", date: "Today, 1:30 PM", status: "success", icon: "shopping-bag" },
  { id: "3", merchant: "Spotify", amount: "-$9.99", date: "Yesterday, 8:00 AM", status: "pending", icon: "music" },
  { id: "4", merchant: "Adobe Creative", amount: "-$54.99", date: "Apr 1, 2:15 PM", status: "success", icon: "pen-tool" },
  { id: "5", merchant: "Google Cloud", amount: "-$120.00", date: "Mar 31, 11:00 AM", status: "error", icon: "cloud" },
];

const SPENDING_DATA = [25, 40, 35, 55, 45, 60, 50, 70, 65, 80, 72, 90, 85, 78, 92, 88];

const STATUS_CFG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  success: { bg: "rgba(0,255,136,0.12)", border: "#00FF8830", text: "#00FF88", label: "Successful" },
  pending: { bg: "rgba(245,158,11,0.12)", border: "#F59E0B30", text: "#F59E0B", label: "Pending" },
  error: { bg: "rgba(239,68,68,0.12)", border: "#EF444430", text: "#EF4444", label: "Failed" },
};

/* ─── Sub-components ─────────────────────────────────── */

/** Overlapping-circles logo (like Mastercard) */
function CardLogo({ accent }: { accent: string }) {
  return (
    <View style={{ flexDirection: "row", width: 36, height: 24 }}>
      <View style={[cardStyles.logoCircle, { backgroundColor: "rgba(255,255,255,0.9)" }]} />
      <View style={[cardStyles.logoCircle, { backgroundColor: accent, opacity: 0.75, marginLeft: -10 }]} />
    </View>
  );
}

/** EMV chip */
function ChipIcon() {
  return (
    <View style={cardStyles.chip}>
      <View style={cardStyles.chipH} />
      <View style={cardStyles.chipV} />
      <View style={[cardStyles.chipH, { top: "auto", bottom: 4 }]} />
    </View>
  );
}

/** The rotated card visual */
function VirtualCardVisual({ config, showDetails }: { config: CardConfig; showDetails: boolean }) {
  const [c1, c2, c3] = config.gradient;
  return (
    <View style={cardStyles.outerWrap}>
      {/* card is 280×170, rotated 90deg CW → appears as 170w × 280h */}
      <View style={[cardStyles.card, { backgroundColor: c2 }]}>
        {/* gradient layers */}
        <View style={[cardStyles.gLayer1, { backgroundColor: c1 }]} />
        <View style={[cardStyles.gWave, { backgroundColor: c3 }]} />

        {/* top row: logo + expiry */}
        <View style={cardStyles.cardRow}>
          <CardLogo accent={config.accent} />
          <View style={cardStyles.expiryBlock}>
            <Text style={cardStyles.expiryLabel}>Expiry Date</Text>
            <Text style={cardStyles.expiryValue}>{showDetails ? "02/30" : "••/••"}</Text>
          </View>
        </View>

        {/* card number */}
        <Text style={cardStyles.cardNumber}>
          {showDetails ? "**** **** **** 2345" : "**** **** **** 2345"}
        </Text>

        {/* bottom row: brand + chip + holder */}
        <View style={cardStyles.cardRow}>
          <Text style={cardStyles.brandName}>PayVora</Text>
          <View style={cardStyles.bottomCenter}>
            <ChipIcon />
          </View>
          <View style={cardStyles.holderBlock}>
            <Text style={cardStyles.holderLabel}>Card Holder Name</Text>
            <Text style={cardStyles.holderValue}>Alex Johnson</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

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

  /* selection stage vs management stage */
  const [stage, setStage] = useState<"select" | "manage">("select");
  const [selectedTier, setSelectedTier] = useState<CardTier>("regular");
  const [showDetails, setShowDetails] = useState(false);
  const [onlineTx, setOnlineTx] = useState(true);

  const activeConfig = CARD_CONFIGS.find((c) => c.tier === selectedTier)!;

  const handleContinue = useCallback(() => {
    hapticLight();
    setStage("manage");
  }, []);

  const handleFund = useCallback(async () => {
    const amt = 100;
    if (usdBalance < amt) {
      hapticWarning();
      Alert.alert("Insufficient Balance", "You don't have enough USD in your wallet.");
      return;
    }
    fundVirtualCard(amt);
    hapticSuccess();
    addTransaction({ type: "card", category: "Card", title: "Virtual Card Funding", amount: amt, currency: "USD", status: "success", date: "Just now", direction: "out" });
    addNotification({ title: "Card Funded", message: `$${amt} added to your virtual card.`, type: "success", time: "Just now" });
    Alert.alert("Card Funded", `Successfully added $${amt} to your virtual card.`);
  }, [usdBalance, fundVirtualCard, addTransaction, addNotification]);

  const handleWithdraw = useCallback(() => {
    const amt = 50;
    if (virtualCardBalance < amt) {
      hapticWarning();
      Alert.alert("Insufficient Card Balance", "Not enough funds on card to withdraw.");
      return;
    }
    withdrawVirtualCard(amt);
    addTransaction({ type: "card", category: "Card", title: "Virtual Card Withdrawal", amount: amt, currency: "USD", status: "success", date: "Just now", direction: "in" });
    addNotification({ title: "Card Withdrawal", message: `$${amt} withdrawn from virtual card.`, type: "info", time: "Just now" });
    Alert.alert("Withdraw", `Withdrawal of $${amt} initiated from your virtual card.`);
  }, [virtualCardBalance, withdrawVirtualCard, addTransaction, addNotification]);

  /* ── Selection Screen ── */
  if (stage === "select") {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Virtual Dollar Card</Text>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
            <Feather name="mail" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.selectContent, { paddingBottom: botPad + 32 }]}>
          {/* Title */}
          <Text style={[styles.selectTitle, { color: colors.foreground }]}>Select Card Option</Text>
          <Text style={[styles.selectSubtitle, { color: colors.mutedForeground }]}>
            Read the description and select the card that you prefer
          </Text>

          {/* Tier toggle */}
          <View style={[styles.tierWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {CARD_CONFIGS.map((cfg) => {
              const active = selectedTier === cfg.tier;
              return (
                <TouchableOpacity
                  key={cfg.tier}
                  style={[styles.tierBtn, active && styles.tierBtnActive]}
                  onPress={() => { hapticLight(); setSelectedTier(cfg.tier); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tierBtnText, { color: active ? "#FFFFFF" : colors.mutedForeground }]}>
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Card Visual */}
          <VirtualCardVisual config={activeConfig} showDetails={false} />

          {/* Creation fee */}
          <View style={[styles.feeRow, { backgroundColor: `${activeConfig.accent}18`, borderColor: `${activeConfig.accent}40` }]}>
            <Text style={[styles.feeText, { color: activeConfig.accent }]}>
              Creation Fee: {activeConfig.creationFeeUSD} / {activeConfig.creationFeeNGN}
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Feather name="info" size={16} color={activeConfig.accent} />
            </TouchableOpacity>
          </View>

          {/* Feature list */}
          <View style={styles.featureList}>
            {activeConfig.features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.checkCircle, { borderColor: activeConfig.accent }]}>
                  <Feather name="check" size={11} color={activeConfig.accent} />
                </View>
                <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Continue button */}
        <View style={[styles.btnWrap, { paddingBottom: botPad + 20, backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: "#0F2A5C" }]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ── Management Screen ── */
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => setStage("select")}
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {activeConfig.label} Dollar Card
        </Text>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <Feather name="settings" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.manageContent, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        {/* Card */}
        <VirtualCardVisual config={activeConfig} showDetails={showDetails} />

        {/* Balance badge */}
        <View style={[styles.balanceBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.balanceLabel, { color: colors.mutedForeground }]}>Card Balance</Text>
          <Text style={[styles.balanceValue, { color: colors.foreground }]}>
            ${virtualCardBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          {virtualCardFrozen && (
            <View style={[styles.frozenBadge, { backgroundColor: "rgba(239,68,68,0.12)", borderColor: "#EF444430" }]}>
              <Feather name="lock" size={11} color="#EF4444" />
              <Text style={{ color: "#EF4444", fontSize: 11, fontFamily: "Inter_600SemiBold" }}>Frozen</Text>
            </View>
          )}
        </View>

        {/* Show/Hide */}
        <TouchableOpacity onPress={() => setShowDetails(!showDetails)} activeOpacity={0.8} style={styles.toggleRow}>
          <Feather name={showDetails ? "eye-off" : "eye"} size={16} color={colors.primary} />
          <Text style={[styles.toggleText, { color: colors.primary }]}>{showDetails ? "Hide" : "Show"} Card Details</Text>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actionRow}>
          {[
            { label: "Fund Card",  icon: "plus",          color: colors.primary, bg: "rgba(0,229,255,0.12)", bgIcon: "rgba(0,229,255,0.2)", onPress: handleFund },
            { label: "Withdraw",   icon: "arrow-up-right", color: "#14B8A6",      bg: "rgba(20,184,166,0.12)", bgIcon: "rgba(20,184,166,0.2)", onPress: handleWithdraw },
            {
              label: virtualCardFrozen ? "Unfreeze" : "Freeze",
              icon: virtualCardFrozen ? "unlock" : "lock",
              color: virtualCardFrozen ? "#EF4444" : "#F59E0B",
              bg: virtualCardFrozen ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
              bgIcon: virtualCardFrozen ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)",
              onPress: toggleFreezeCard,
            },
          ].map((a) => (
            <TouchableOpacity key={a.label} onPress={a.onPress} activeOpacity={0.8} style={[styles.actionBtn, { backgroundColor: a.bg }]}>
              <View style={[styles.actionIcon, { backgroundColor: a.bgIcon }]}>
                <Feather name={a.icon as any} size={18} color={a.color} />
              </View>
              <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spending chart */}
        <View style={[styles.spendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={[styles.spendTitle, { color: colors.foreground }]}>Monthly Spending</Text>
            <Text style={[styles.spendTitle, { color: colors.primary }]}>$255.47</Text>
          </View>
          <SpendingChart />
        </View>

        {/* Card settings */}
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.settingsTitle, { color: colors.foreground }]}>Card Settings</Text>
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Feather name="globe" size={16} color={colors.mutedForeground} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Online Transactions</Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>Allow online purchases</Text>
              </View>
            </View>
            <Switch value={onlineTx} onValueChange={setOnlineTx} trackColor={{ false: colors.border, true: "rgba(0,229,255,0.4)" }} thumbColor={onlineTx ? colors.primary : colors.mutedForeground} />
          </View>
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Feather name="shield" size={16} color={colors.mutedForeground} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Spending Limit</Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>$500.00 / day</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="bell" size={16} color={colors.mutedForeground} />
              <View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>Transaction Alerts</Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>Push notifications</Text>
              </View>
            </View>
            <Switch value={true} trackColor={{ false: colors.border, true: "rgba(0,255,136,0.4)" }} thumbColor="#00FF88" />
          </View>
        </View>

        {/* Transactions */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={[styles.settingsTitle, { color: colors.foreground }]}>Card Transactions</Text>
          <TouchableOpacity activeOpacity={0.8}>
            <Text style={{ color: colors.primary, fontSize: 13, fontFamily: "Inter_500Medium" }}>See all</Text>
          </TouchableOpacity>
        </View>

        {CARD_TRANSACTIONS.map((tx) => {
          const st = STATUS_CFG[tx.status];
          return (
            <View key={tx.id} style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.txIcon, { backgroundColor: `${st.text}15` }]}>
                <Feather name={tx.icon as any} size={16} color={st.text} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.txMerchant, { color: colors.foreground }]}>{tx.merchant}</Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{tx.date}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text style={[styles.txMerchant, { color: colors.foreground }]}>{tx.amount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                  <View style={[styles.statusDot, { backgroundColor: st.text }]} />
                  <Text style={[{ fontSize: 10, fontFamily: "Inter_600SemiBold" }, { color: st.text }]}>{st.label}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ─── Card sub-styles ────────────────────────────────── */
const cardStyles = StyleSheet.create({
  outerWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
  card: {
    width: 300,
    height: 185,
    borderRadius: 18,
    padding: 22,
    justifyContent: "space-between",
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  gLayer1: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    opacity: 0.6,
  },
  gWave: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.25,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  expiryBlock: { alignItems: "flex-end" },
  expiryLabel: { fontSize: 8, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", letterSpacing: 0.5 },
  expiryValue: { fontSize: 13, color: "#FFFFFF", fontFamily: "Inter_700Bold", marginTop: 1 },
  cardNumber: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2.5,
    textAlign: "center",
    marginVertical: 2,
  },
  brandName: { fontSize: 13, color: "rgba(255,255,255,0.9)", fontFamily: "Inter_700Bold", letterSpacing: 1 },
  bottomCenter: { alignItems: "center" },
  holderBlock: { alignItems: "flex-end" },
  holderLabel: { fontSize: 8, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", letterSpacing: 0.5 },
  holderValue: { fontSize: 11, color: "#FFFFFF", fontFamily: "Inter_600SemiBold", marginTop: 1 },
  chip: {
    width: 30,
    height: 22,
    backgroundColor: "#D4A017",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,200,50,0.6)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  chipH: {
    position: "absolute",
    top: 7,
    left: 2,
    right: 2,
    height: 1,
    backgroundColor: "rgba(100,60,0,0.4)",
  },
  chipV: {
    position: "absolute",
    top: 2,
    bottom: 2,
    left: 13,
    width: 1,
    backgroundColor: "rgba(100,60,0,0.4)",
  },
});

/* ─── Screen styles ──────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  /* Selection */
  selectContent: { paddingHorizontal: 20, paddingTop: 28 },
  selectTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 8 },
  selectSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 24 },

  tierWrap: {
    flexDirection: "row",
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    marginBottom: 8,
  },
  tierBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: "center",
  },
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
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, alignItems: "center", justifyContent: "center",
  },
  featureText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },

  btnWrap: { paddingHorizontal: 20, borderTopWidth: 0 },
  continueBtn: {
    borderRadius: 14, paddingVertical: 17,
    alignItems: "center", justifyContent: "center",
  },
  continueBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },

  /* Management */
  manageContent: { paddingHorizontal: 20, paddingTop: 8 },

  balanceBadge: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 4,
  },
  balanceLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  balanceValue: { fontSize: 22, fontFamily: "Inter_700Bold", flex: 1 },
  frozenBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },

  toggleRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    justifyContent: "center", paddingVertical: 12, marginBottom: 4,
  },
  toggleText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  actionRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", gap: 8 },
  actionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  spendCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20 },
  spendTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },

  settingsCard: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 20 },
  settingsTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 12 },
  settingRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1,
  },
  settingInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  settingDesc: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },

  txRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txMerchant: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
});
