import React, { useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Pressable,
  ViewStyle,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { hapticLight } from "@/utils/haptics";
import { WalletCard } from "@/components/WalletCard";
import { RateCard } from "@/components/RateCard";
import { TransactionItem, Transaction } from "@/components/TransactionItem";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { XStack, YStack } from "@/components/Stacks";
import { SizableText, Strong } from "@/components/Typography";

/* ─── Premium Action Button ─────────────────────────── */
interface PremiumActionBtnProps {
  label: string;
  icon: string;
  color: string;
  glowColor: string;
  onPress: () => void;
  testID?: string;
}

function PremiumActionBtn({ label, icon, color, glowColor, onPress, testID }: PremiumActionBtnProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 6,
      tension: 200,
      useNativeDriver: false,
    }).start();
  }, [scaleAnim]);

  const pressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: false,
    }).start();
  }, [scaleAnim]);

  const glowStyle: ViewStyle = Platform.OS !== "web"
    ? {
        shadowColor:   glowColor,
        shadowOffset:  { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius:  12,
        elevation:     10,
      }
    : {};

  return (
    <Pressable
      testID={testID}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={() => { hapticLight(); onPress(); }}
      style={{ flex: 1 }}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            pb.btn,
            glowStyle,
            {
              backgroundColor: pressed ? "#131a2a" : "#0e0e1a",
              transform: [{ scale: scaleAnim }],
              ...(Platform.OS === "web" && {
                boxShadow: `0 0 16px ${glowColor}70, 0 0 32px ${glowColor}30, 0 4px 12px rgba(0,0,0,0.6)`,
              } as any),
            },
          ]}
        >
          {/* icon ring */}
          <View style={[pb.iconRing, { borderColor: `${color}40`, backgroundColor: `${color}12` }]}>
            <View style={[pb.iconCore, { backgroundColor: `${color}20` }]}>
              <Feather name={icon as any} size={22} color={color} />
            </View>
          </View>

          {/* label */}
          <SizableText
            size="$1"
            fontWeight="600"
            color="rgba(220,230,255,0.85)"
            style={pb.label}
          >
            {label}
          </SizableText>

          {/* bottom accent bar */}
          <View style={[pb.accentBar, { backgroundColor: color }]} />
        </Animated.View>
      )}
    </Pressable>
  );
}

const pb = StyleSheet.create({
  btn: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
  },
  iconRing: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCore: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
    letterSpacing: 0.2,
  },
  accentBar: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 2,
    borderRadius: 2,
    opacity: 0.6,
  },
});

/* ─── Home Screen ────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: "Buy Card",    icon: "shopping-bag", color: "#00FF88", glowColor: "#00FF88", route: "/buy" },
  { label: "Sell Card",   icon: "dollar-sign",  color: "#00E5FF", glowColor: "#00E5FF", route: "/sell" },
  { label: "Dollar Card", icon: "credit-card",  color: "#8B5CF6", glowColor: "#8B5CF6", route: "/virtual-card" },
  { label: "Bills",       icon: "smartphone",   color: "#F59E0B", glowColor: "#F59E0B", route: "/bills" },
] as const;

export default function HomeScreen() {
  const colors     = useColors();
  const insets     = useSafeAreaInsets();
  const isWeb      = Platform.OS === "web";
  const { ngnBalance, transactions } = useWallet();
  const { unreadCount, togglePanel } = useNotifications();

  const topPad    = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const recentTxs: Transaction[] = transactions.slice(0, 4).map((t) => ({
    id:       t.id,
    cardType: t.title,
    amount:   t.amount,
    payout:   t.currency === "NGN" ? t.amount : t.amount * 750,
    status:   t.status,
    date:     t.date,
  }));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 120 },
        ]}
      >
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" style={styles.header}>
          <YStack>
            <SizableText size="$3" color={colors.mutedForeground} marginBottom={2}>Good morning</SizableText>
            <SizableText size="$8" fontWeight="bold" color={colors.foreground}>Alex Johnson</SizableText>
          </YStack>
          <XStack gap={8}>
            <TouchableOpacity
              style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={() => router.push("/settings")}
              testID="settings-button"
            >
              <Feather name="settings" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
              testID="notifications-button"
              onPress={togglePanel}
            >
              <Feather name="bell" size={20} color={colors.mutedForeground} />
              {unreadCount > 0 && <View style={[styles.notifDot, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          </XStack>
        </XStack>

        {/* Wallet Card */}
        <WalletCard balance={ngnBalance} onWithdraw={() => {}} onDeposit={() => {}} />

        {/* Live Rate */}
        <RateCard rate={750} fromCurrency="$" toCurrency="₦" change={2.3} />

        {/* Quick Actions label */}
        <SizableText
          size="$4"
          fontWeight="700"
          color={colors.foreground}
          style={{ marginBottom: 12, letterSpacing: 0.3 }}
        >
          Quick Actions
        </SizableText>

        {/* Premium buttons */}
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <PremiumActionBtn
              key={action.label}
              label={action.label}
              icon={action.icon}
              color={action.color}
              glowColor={action.glowColor}
              onPress={() => router.push(action.route as any)}
              testID={`quick-action-${action.label.toLowerCase().replace(" ", "-")}`}
            />
          ))}
        </View>

        {/* Transactions */}
        <XStack justifyContent="space-between" alignItems="center" style={styles.sectionHeader}>
          <SizableText size="$6" fontWeight="bold" color={colors.foreground}>Recent Transactions</SizableText>
          <TouchableOpacity onPress={() => router.push("/transactions")}>
            <SizableText size="$3" fontWeight="500" color={colors.primary}>See all</SizableText>
          </TouchableOpacity>
        </XStack>
        {recentTxs.map((t) => (
          <TransactionItem key={t.id} item={t} />
        ))}
      </ScrollView>

      {/* Floating Sell Button */}
      <View
        style={[styles.fabWrap, { bottom: bottomPad + (isWeb ? 84 : 72) }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          testID="sell-fab"
          onPress={() => router.push("/sell")}
          activeOpacity={0.85}
          style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        >
          <Feather name="dollar-sign" size={22} color={colors.primaryForeground} />
          <Strong color={colors.primaryForeground} style={{ fontSize: 15 }}>Sell Card</Strong>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  content: { paddingHorizontal: 20 },

  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 24,
  },
  notifBtn: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  notifDot: {
    position: "absolute", top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
  },

  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },

  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14,
  },

  fabWrap: {
    position: "absolute", right: 20, alignItems: "flex-end",
  },
  fab: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 28, paddingHorizontal: 22, paddingVertical: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55, shadowRadius: 18, elevation: 10,
  },
});
