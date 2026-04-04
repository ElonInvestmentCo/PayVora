import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useKyc } from "@/contexts/KycContext";

interface MenuItem {
  icon: string;
  label: string;
  subtitle: string;
  color: string;
  route: string;
  badge?: string;
  badgeColor?: string;
}

const STATIC_MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: "Account",
    items: [
      { icon: "credit-card", label: "Virtual Card",       subtitle: "Manage your dollar card",   color: "#8B5CF6", route: "/virtual-card" },
      { icon: "repeat",      label: "Transactions",       subtitle: "View all transactions",     color: "#00E5FF", route: "/transactions" },
    ],
  },
  {
    title: "Services",
    items: [
      { icon: "smartphone",  label: "Bills & eSIMs",     subtitle: "Pay bills, buy eSIMs",       color: "#F59E0B", route: "/bills" },
      { icon: "award",       label: "Leaderboard",       subtitle: "See top traders",             color: "#14B8A6", route: "/leaderboard" },
      { icon: "message-circle", label: "Support Chat",   subtitle: "Get help 24/7",               color: "#00E5FF", route: "/support" },
    ],
  },
  {
    title: "Settings",
    items: [
      { icon: "settings",    label: "App Settings",      subtitle: "Security, notifications, preferences", color: "#94A3B8", route: "/settings" },
    ],
  },
];

const KYC_BADGE_MAP: Record<string, { badge: string; badgeColor: string; subtitle: string }> = {
  not_verified: { badge: "Unverified", badgeColor: "#EF4444", subtitle: "Tap to verify your identity" },
  pending:      { badge: "Pending",    badgeColor: "#F59E0B", subtitle: "Verification under review" },
  verified:     { badge: "Verified",   badgeColor: "#00FF88", subtitle: "Identity verified" },
  rejected:     { badge: "Rejected",   badgeColor: "#EF4444", subtitle: "Verification declined — resubmit" },
};

const STATS = [
  { label: "Trades", value: "142", color: "#00E5FF" },
  { label: "Volume", value: "$42K", color: "#00FF88" },
  { label: "Rank",   value: "#5",   color: "#F59E0B" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;
  const { kycStatus } = useKyc();

  const kycBadge = KYC_BADGE_MAP[kycStatus] || KYC_BADGE_MAP.not_verified;

  const kycItem: MenuItem = {
    icon: "shield",
    label: "KYC Verification",
    subtitle: kycBadge.subtitle,
    color: kycBadge.badgeColor,
    route: "/kyc",
    badge: kycBadge.badge,
    badgeColor: kycBadge.badgeColor,
  };

  const menuSections = [
    {
      title: "Account",
      items: [kycItem, ...STATIC_MENU_SECTIONS[0].items],
    },
    ...STATIC_MENU_SECTIONS.slice(1),
  ];

  const verifiedBadge = kycStatus === "verified";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        <TouchableOpacity onPress={() => router.push("/settings")} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="settings" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]}>
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: "rgba(0,229,255,0.12)", borderColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>AJ</Text>
          </View>
          <Text style={[styles.profileName, { color: colors.foreground }]}>Alex Johnson</Text>
          <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>alex.johnson@email.com</Text>
          {verifiedBadge ? (
            <View style={[styles.verifiedRow, { backgroundColor: "rgba(0,255,136,0.1)", borderColor: "#00FF8830" }]}>
              <Feather name="check-circle" size={12} color="#00FF88" />
              <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#00FF88" }}>Verified Account</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => router.push("/kyc")} activeOpacity={0.8}>
              <View style={[styles.verifiedRow, { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "#EF444430" }]}>
                <Feather name="alert-circle" size={12} color="#EF4444" />
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#EF4444" }}>
                  {kycStatus === "pending" ? "Verification Pending" : "Not Verified"}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.statsRow}>
            {STATS.map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {menuSections.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.8}
                  style={[styles.menuItem, i < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                >
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                    <Feather name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <View style={styles.menuInfo}>
                    <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                    <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
                  </View>
                  {item.badge && (
                    <View style={[styles.menuBadge, { backgroundColor: `${item.badgeColor}15`, borderColor: `${item.badgeColor}30` }]}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: item.badgeColor }}>{item.badge}</Text>
                    </View>
                  )}
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={[styles.version, { color: colors.mutedForeground }]}>GiftCard Trader v2.4.1</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  content: { padding: 20, gap: 20 },

  profileCard: { borderRadius: 16, padding: 24, borderWidth: 1, alignItems: "center", gap: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  avatarText: { fontSize: 26, fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  verifiedRow: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4,
  },
  statsRow: { flexDirection: "row", marginTop: 18, width: "100%", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },

  menuSection: { gap: 8 },
  sectionTitle: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.8, paddingLeft: 4 },
  menuCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuInfo: { flex: 1, gap: 2 },
  menuLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  menuSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  menuBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },

  version: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
