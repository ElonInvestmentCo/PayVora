import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { hapticLight, hapticSelection } from "@/utils/haptics";
import { useKyc } from "@/contexts/KycContext";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

const STATS = [
  { label: "Trades",  value: "142" },
  { label: "Volume",  value: "$42K" },
  { label: "Rank",    value: "#5" },
];

const SECTIONS = [
  {
    title: "Account",
    items: [
      { icon: "shield",     label: "KYC Verification",   sub: "Verify your identity",       route: "/kyc",          highlight: true },
      { icon: "credit-card",label: "Virtual Dollar Card", sub: "Manage your virtual Visa",   route: "/virtual-card", highlight: false },
      { icon: "zap",        label: "Bills & eSIMs",       sub: "Pay bills, buy eSIM plans",  route: "/bills",        highlight: false },
    ],
  },
  {
    title: "Trading",
    items: [
      { icon: "trending-up",  label: "Buy Crypto",       sub: "Purchase cryptocurrency",     route: "/buy-crypto",   highlight: false },
      { icon: "trending-down",label: "Sell Crypto",      sub: "Convert crypto to fiat",      route: "/sell-crypto",  highlight: false },
      { icon: "gift",         label: "Gift Cards",       sub: "Buy & sell gift cards",       route: "/buy",          highlight: false },
      { icon: "award",        label: "Leaderboard",      sub: "Top traders this week",       route: "/leaderboard",  highlight: false },
    ],
  },
  {
    title: "More",
    items: [
      { icon: "list",         label: "Transactions",     sub: "Full transaction history",    route: "/(tabs)/transactions", highlight: false },
      { icon: "message-circle",label:"Support Chat",     sub: "Talk to our team",            route: "/support",      highlight: false },
      { icon: "settings",     label: "Settings",         sub: "Account & preferences",       route: "/(tabs)/settings",     highlight: false },
    ],
  },
];

const ICON_PATHS: Record<string, string> = {
  shield:         "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  "credit-card":  "M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22",
  zap:            "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  "trending-up":  "M23 6l-9.5 9.5-5-5L1 18",
  "trending-down":"M23 18l-9.5-9.5-5 5L1 6",
  gift:           "M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  award:          "M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  list:           "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  "message-circle":"M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  settings:       "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  bell:           "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  "chevron-right":"M9 18l6-6-6-6",
  "log-out":      "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
};

function Icon({ name, color = "#8E8E93", size = 16 }: { name: string; color?: string; size?: number }) {
  const d = ICON_PATHS[name] || "";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function KycBadge({ status }: { status: string }) {
  const cfg = {
    verified:     { bg: "#F0FDF4", dot: "#30D158", text: "#30D158", label: "Verified" },
    pending:      { bg: "#FFFBEB", dot: "#FF9F0A", text: "#FF9F0A", label: "Pending Review" },
    not_verified: { bg: "#FFF2F2", dot: "#FF3B30", text: "#FF3B30", label: "Not Verified" },
    rejected:     { bg: "#FFF2F2", dot: "#FF3B30", text: "#FF3B30", label: "Rejected" },
  }[status] ?? { bg: "#F2F2F7", dot: "#8E8E93", text: "#8E8E93", label: status };

  return (
    <View style={[s.kycBadge, { backgroundColor: cfg.bg }]}>
      <View style={[s.kycDot, { backgroundColor: cfg.dot }]} />
      <Text style={[s.kycBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { kycStatus } = useKyc();
  const { usdBalance } = useWallet();
  const { togglePanel } = useNotifications();
  const [notifs, setNotifs] = useState(true);

  const handleNav = (route: string) => {
    hapticLight();
    router.push(route as any);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Profile</Text>
          <TouchableOpacity
            onPress={() => handleNav("/(tabs)/settings")}
            activeOpacity={0.8}
            style={s.headerBtn}
          >
            <Icon name="settings" color="#1C1C1E" size={17} />
          </TouchableOpacity>
        </View>

        {/* ── User Card ── */}
        <View style={s.section}>
          <View style={s.card}>
            {/* Avatar + Info */}
            <View style={s.userRow}>
              <LinearGradient colors={["#1A5AFF", "#0C38C0"]} style={s.avatar}>
                <Text style={s.avatarText}>JD</Text>
              </LinearGradient>
              <View style={s.userInfo}>
                <Text style={s.userName}>John Doe</Text>
                <Text style={s.userHandle}>@johndoe · PayVora</Text>
                <KycBadge status={kycStatus} />
              </View>
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
              {STATS.map((st, i) => (
                <React.Fragment key={st.label}>
                  {i > 0 && <View style={s.statDivider} />}
                  <View style={s.statItem}>
                    <Text style={s.statVal}>{st.value}</Text>
                    <Text style={s.statLbl}>{st.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            {/* Balance strip */}
            <View style={s.balanceStrip}>
              <View>
                <Text style={s.balanceLbl}>USD Wallet</Text>
                <Text style={s.balanceAmt}>${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleNav("/(tabs)/wallet")}
                activeOpacity={0.8}
                style={s.walletBtn}
              >
                <Text style={s.walletBtnTxt}>View Wallet</Text>
                <Icon name="chevron-right" color="#1A5AFF" size={14} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={s.section}>
          <View style={s.card}>
            <View style={s.quickActions}>
              {[
                { icon: "trending-up",   label: "Buy",   route: "/buy-crypto",  color: "#30D158" },
                { icon: "trending-down", label: "Sell",  route: "/sell-crypto", color: "#FF3B30" },
                { icon: "gift",          label: "Cards", route: "/buy",         color: "#1A5AFF" },
                { icon: "zap",           label: "Bills", route: "/bills",       color: "#AF52DE" },
              ].map((a) => (
                <TouchableOpacity
                  key={a.route}
                  onPress={() => handleNav(a.route)}
                  activeOpacity={0.8}
                  style={s.quickAction}
                >
                  <View style={[s.qaIcon, { backgroundColor: a.color + "18" }]}>
                    <Icon name={a.icon} color={a.color} size={18} />
                  </View>
                  <Text style={s.qaLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── Notifications Toggle ── */}
        <View style={s.section}>
          <View style={s.card}>
            <View style={s.notifRow}>
              <View style={s.notifLeft}>
                <View style={[s.notifIcon, { backgroundColor: "#FF9F0A18" }]}>
                  <Icon name="bell" color="#FF9F0A" size={16} />
                </View>
                <View>
                  <Text style={s.notifTitle}>Push Notifications</Text>
                  <Text style={s.notifSub}>Trade alerts & updates</Text>
                </View>
              </View>
              <Switch
                value={notifs}
                onValueChange={(v) => { hapticSelection(); setNotifs(v); togglePanel(); }}
                trackColor={{ false: "#E5E5EA", true: "#1A5AFF55" }}
                thumbColor={notifs ? "#1A5AFF" : "#C7C7CC"}
                ios_backgroundColor="#E5E5EA"
              />
            </View>
          </View>
        </View>

        {/* ── Menu Sections ── */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.card}>
              {section.items.map((item, idx) => {
                const isLast = idx === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => handleNav(item.route)}
                    activeOpacity={0.8}
                    style={[s.menuItem, !isLast && s.menuItemBorder]}
                  >
                    <View style={[s.menuIcon, item.highlight && { backgroundColor: "#EEF3FF" }]}>
                      <Icon
                        name={item.icon}
                        color={item.highlight ? "#1A5AFF" : "#8E8E93"}
                        size={16}
                      />
                    </View>
                    <View style={s.menuInfo}>
                      <Text style={[s.menuLabel, item.highlight && { color: "#1A5AFF" }]}>{item.label}</Text>
                      <Text style={s.menuSub}>{item.sub}</Text>
                    </View>
                    <Icon name="chevron-right" color="#C7C7CC" size={15} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* ── Logout ── */}
        <View style={s.section}>
          <TouchableOpacity
            onPress={() => { hapticLight(); router.replace("/onboarding" as any); }}
            activeOpacity={0.8}
            style={s.logoutBtn}
          >
            <Icon name="log-out" color="#FF3B30" size={17} />
            <Text style={s.logoutTxt}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.version}>PayVora v2.0.0 · © 2025</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: { paddingBottom: 120 },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },

  section: { paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8, paddingLeft: 4 },

  card: {
    backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },

  userRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 20, paddingBottom: 16 },
  avatar: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  userInfo: { gap: 4 },
  userName: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  userHandle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  kycBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 2 },
  kycDot: { width: 6, height: 6, borderRadius: 3 },
  kycBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  statsRow: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: "#F2F2F7", borderRadius: 14, paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  statDivider: { width: 1, height: 28, backgroundColor: "#E5E5EA" },

  balanceStrip: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 16, marginBottom: 18,
    backgroundColor: "#F2F2F7", borderRadius: 14, padding: 14,
  },
  balanceLbl: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#8E8E93", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  balanceAmt: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  walletBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#EEF3FF", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  walletBtnTxt: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#1A5AFF" },

  quickActions: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 16 },
  quickAction: { flex: 1, alignItems: "center", gap: 6 },
  qaIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },

  notifRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  notifLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  notifIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  notifTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  notifSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#8E8E93", marginTop: 1 },

  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  menuItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  menuIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F2F2F7", alignItems: "center", justifyContent: "center" },
  menuInfo: { flex: 1, gap: 2 },
  menuLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
  menuSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#8E8E93" },

  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#FFF2F2", borderRadius: 16, paddingVertical: 16,
    borderWidth: 1, borderColor: "rgba(255,59,48,0.15)",
  },
  logoutTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#FF3B30" },
  version: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#C7C7CC", textAlign: "center", paddingBottom: 8 },
});
