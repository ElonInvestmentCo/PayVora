import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { hapticLight } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";

function ChevronRight() {
  return (
    <Svg width={7} height={12} viewBox="0 0 7 12" fill="none">
      <Path d="M1 1l5 5-5 5" stroke="#C7C7CC" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MenuItem({ icon, label, value, onPress, danger }: {
  icon: React.ReactNode; label: string; value?: string; onPress?: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.menuIcon, danger && s.menuIconDanger]}>{icon}</View>
      <Text style={[s.menuLabel, danger && s.menuLabelDanger]}>{label}</Text>
      {value && <Text style={s.menuValue}>{value}</Text>}
      {!danger && <ChevronRight />}
    </TouchableOpacity>
  );
}

function Icon({ d, color = "#1C1C1E" }: { d: string; color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { transactions } = useWallet();
  const totalVolume = (transactions || []).reduce((s, t) => s + t.amount, 0);

  const SECTIONS = [
    {
      title: "Account",
      items: [
        { label: "KYC Verification",    d: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", route: "/kyc" },
        { label: "Virtual Dollar Card", d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",     route: "/virtual-card" },
        { label: "Transactions",        d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",  route: "/(tabs)/transactions" },
      ],
    },
    {
      title: "Explore",
      items: [
        { label: "Leaderboard", d: "M16 8v8m-4-5v5m-4-2v2M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", route: "/leaderboard" },
        { label: "Bills & eSIMs",  d: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",  route: "/bills" },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "Help & Support", d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", route: "/support" },
      ],
    },
    {
      title: "App",
      items: [
        { label: "Settings", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", route: "/(tabs)/settings" },
      ],
    },
  ];

  return (
    <View style={s.root}>
      <View style={[s.headerWrap, { paddingTop: insets.top }]}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <LinearGradient colors={["#1A5AFF", "#0C38C0"]} style={s.userCard}>
          <LinearGradient colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.10)"]} style={s.avatar}>
            <Text style={s.avatarText}>PV</Text>
          </LinearGradient>
          <Text style={s.userName}>PayVora User</Text>
          <Text style={s.userEmail}>user@payvora.com</Text>
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statVal}>{(transactions || []).length}</Text>
              <Text style={s.statLabel}>Trades</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.stat}>
              <Text style={s.statVal}>${totalVolume.toLocaleString("en-US", { maximumFractionDigits: 0 })}</Text>
              <Text style={s.statLabel}>Volume</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.stat}>
              <Text style={s.statVal}>—</Text>
              <Text style={s.statLabel}>Rank</Text>
            </View>
          </View>
        </LinearGradient>

        {SECTIONS.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.menuCard}>
              {section.items.map((item, i) => (
                <View key={item.label}>
                  <MenuItem
                    label={item.label}
                    icon={<Icon d={item.d} />}
                    onPress={() => { hapticLight(); router.push(item.route as any); }}
                  />
                  {i < section.items.length - 1 && <View style={s.sep} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={[s.menuCard, { marginHorizontal: 16, marginBottom: 20 }]}>
          <MenuItem
            label="Sign Out"
            icon={
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="#FF3B30" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
            danger
            onPress={() => { hapticLight(); router.replace("/auth"); }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  headerWrap: { backgroundColor: "#F2F2F7", paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  scroll: { paddingBottom: 40 },

  userCard: { marginHorizontal: 16, borderRadius: 20, padding: 24, marginBottom: 20, alignItems: "center" },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  userName: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", marginBottom: 4 },
  userEmail: { fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", marginBottom: 20 },
  statsRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, gap: 0, width: "100%" },
  stat: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold", marginBottom: 2 },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular" },
  statDiv: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.2)" },

  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#8E8E93", fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8, paddingLeft: 4 },
  menuCard: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 15 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#F2F2F7", alignItems: "center", justifyContent: "center" },
  menuIconDanger: { backgroundColor: "rgba(255,59,48,0.1)" },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: "#1C1C1E", fontFamily: "Inter_500Medium" },
  menuLabelDanger: { color: "#FF3B30" },
  menuValue: { fontSize: 14, color: "#8E8E93", fontFamily: "Inter_400Regular", marginRight: 6 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E5EA", marginLeft: 62 },
});
