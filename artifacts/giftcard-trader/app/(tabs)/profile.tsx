import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { hapticLight, hapticSelection } from "@/utils/haptics";
import { router } from "expo-router";
import { useKyc } from "@/contexts/KycContext";
import { useWallet } from "@/contexts/WalletContext";
import Svg, { Path, Circle } from "react-native-svg";

const SECTIONS = [
  {
    title: "My Account",
    items: [
      { icon: "shield",       label: "KYC Verification",    sub: "Verify your identity",    route: "/kyc",          highlight: true },
      { icon: "credit-card",  label: "Virtual Dollar Card", sub: "Manage your Visa card",   route: "/virtual-card" },
      { icon: "list",         label: "Transactions",        sub: "Full transaction history", route: "/transactions" },
    ],
  },
  {
    title: "Trade & Earn",
    items: [
      { icon: "award",        label: "Leaderboard",         sub: "Top traders this week",    route: "/leaderboard" },
      { icon: "zap",          label: "Bills & eSIMs",       sub: "Pay bills anywhere",       route: "/bills" },
      { icon: "gift",         label: "Buy Gift Cards",      sub: "500+ brands available",    route: "/buy" },
      { icon: "tag",          label: "Sell Gift Cards",     sub: "Best rates guaranteed",    route: "/sell" },
    ],
  },
  {
    title: "Support & Settings",
    items: [
      { icon: "message-circle", label: "Support Chat",      sub: "Talk to an agent",         route: "/support" },
      { icon: "settings",       label: "Settings",          sub: "Security, preferences",    route: "/settings" },
    ],
  },
];

const STATS = [
  { label: "Trades",  value: "124" },
  { label: "Volume",  value: "$24.1K" },
  { label: "Rank",    value: "#42" },
];

function KycStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    verified:     { label: "Verified",      color: "#00C48C", bg: "rgba(0,196,140,0.15)" },
    pending:      { label: "Pending",       color: "#FF9500", bg: "rgba(255,149,0,0.15)" },
    not_verified: { label: "Unverified",    color: "#FF3B30", bg: "rgba(255,59,48,0.15)" },
    rejected:     { label: "Rejected",      color: "#FF3B30", bg: "rgba(255,59,48,0.15)" },
  };
  const c = cfg[status] ?? cfg.not_verified;
  return (
    <View style={[kycStyles.badge, { backgroundColor: c.bg }]}>
      <Feather name={status === "verified" ? "check-circle" : "alert-circle"} size={11} color={c.color} />
      <Text style={[kycStyles.badgeTxt, { color: c.color }]}>{c.label}</Text>
    </View>
  );
}
const kycStyles = StyleSheet.create({
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 60 : insets.top;
  const { kycStatus } = useKyc();
  const { usdBalance } = useWallet();
  const [notifs, setNotifs] = useState(true);

  const handleNav = (route: string) => {
    hapticLight();
    router.push(route as any);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={["#07070F", "#0C0C1E", "#070714"]} style={StyleSheet.absoluteFill} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: 100 }]}>

        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => handleNav("/settings")} style={styles.iconBtn} activeOpacity={0.8}>
            <Feather name="settings" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        <LinearGradient colors={["rgba(26,90,255,0.25)", "rgba(124,58,237,0.18)"]} style={styles.userCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.userCardInner}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarWrap}>
                <LinearGradient colors={["#1A5AFF", "#7C3AED"]} style={styles.avatar}>
                  <Text style={styles.avatarTxt}>JD</Text>
                </LinearGradient>
                <View style={styles.avatarOnline} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>John Doe</Text>
                <Text style={styles.userHandle}>@johndoe · PayVora</Text>
                <KycStatusBadge status={kycStatus} />
              </View>
            </View>

            <View style={styles.statsRow}>
              {STATS.map((s, i) => (
                <React.Fragment key={s.label}>
                  <View style={styles.statItem}>
                    <Text style={styles.statVal}>{s.value}</Text>
                    <Text style={styles.statLbl}>{s.label}</Text>
                  </View>
                  {i < STATS.length - 1 && <View style={styles.statDivider} />}
                </React.Fragment>
              ))}
            </View>

            <View style={styles.balanceStrip}>
              <View>
                <Text style={styles.balanceLbl}>USD Wallet</Text>
                <Text style={styles.balanceAmt}>${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleNav("/(tabs)/wallet")}
                activeOpacity={0.8}
                style={styles.walletBtn}
              >
                <Text style={styles.walletBtnTxt}>View Wallet</Text>
                <Feather name="arrow-right" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.quickActions}>
          {[
            { icon: "trending-up",   label: "Buy",    route: "/buy-crypto",   color: "#00C48C" },
            { icon: "trending-down", label: "Sell",   route: "/sell-crypto",  color: "#FF3B30" },
            { icon: "gift",          label: "Cards",  route: "/buy",          color: "#1A5AFF" },
            { icon: "zap",           label: "Bills",  route: "/bills",        color: "#A855F7" },
          ].map((a) => (
            <TouchableOpacity
              key={a.route}
              onPress={() => handleNav(a.route)}
              activeOpacity={0.8}
              style={styles.quickAction}
            >
              <View style={[styles.qaIcon, { backgroundColor: `${a.color}22` }]}>
                <Feather name={a.icon as any} size={20} color={a.color} />
              </View>
              <Text style={styles.qaLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.notifRow]}>
          <View style={styles.notifLeft}>
            <View style={[styles.notifIcon, { backgroundColor: "rgba(26,90,255,0.2)" }]}>
              <Feather name="bell" size={18} color="#1A5AFF" />
            </View>
            <View>
              <Text style={styles.notifTitle}>Push Notifications</Text>
              <Text style={styles.notifSub}>Trade alerts & updates</Text>
            </View>
          </View>
          <Switch
            value={notifs}
            onValueChange={(v) => { hapticSelection(); setNotifs(v); }}
            trackColor={{ false: "rgba(255,255,255,0.15)", true: "#1A5AFF" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) => {
                const isLast = idx === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => handleNav(item.route)}
                    activeOpacity={0.75}
                    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                  >
                    <View style={[styles.menuIcon, (item as any).highlight && { backgroundColor: "rgba(26,90,255,0.2)" }]}>
                      <Feather name={item.icon as any} size={18} color={(item as any).highlight ? "#1A5AFF" : "rgba(255,255,255,0.6)"} />
                    </View>
                    <View style={styles.menuInfo}>
                      <Text style={[styles.menuLabel, (item as any).highlight && { color: "#1A5AFF" }]}>{item.label}</Text>
                      <Text style={styles.menuSub}>{item.sub}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.25)" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => { hapticLight(); router.replace("/onboarding" as any); }}
          activeOpacity={0.8}
          style={styles.logoutBtn}
        >
          <Feather name="log-out" size={18} color="#FF3B30" />
          <Text style={styles.logoutTxt}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>PayVora v2.0.0 · © 2025</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#07070F" },
  content: { paddingHorizontal: 20, gap: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  userCard: { borderRadius: 22, padding: 1 },
  userCardInner: { borderRadius: 21, backgroundColor: "rgba(10,10,20,0.55)", padding: 20, gap: 18 },
  avatarRow: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  avatarWrap: { position: "relative" },
  avatar: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  avatarOnline: { position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: "#00C48C", borderWidth: 2, borderColor: "#0A0A14" },
  userInfo: { gap: 4, paddingTop: 2 },
  userName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  userHandle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.45)" },
  statsRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, paddingVertical: 14 },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  statDivider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.1)" },
  balanceStrip: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  balanceLbl: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.6 },
  balanceAmt: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 2 },
  walletBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(26,90,255,0.3)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  walletBtnTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  quickActions: { flexDirection: "row", gap: 12 },
  quickAction: { flex: 1, alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, paddingVertical: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  qaIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.7)" },
  notifRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  notifLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  notifIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  notifTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  notifSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)", marginTop: 1 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8 },
  sectionCard: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, paddingVertical: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  menuIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  menuInfo: { flex: 1, gap: 2 },
  menuLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  menuSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.4)" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "rgba(255,59,48,0.1)", borderRadius: 16, paddingVertical: 16, borderWidth: 1, borderColor: "rgba(255,59,48,0.2)" },
  logoutTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#FF3B30" },
  version: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.2)", textAlign: "center" },
});
