import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { hapticLight } from "@/utils/haptics";

function ChevronRight() {
  return (
    <Svg width={7} height={12} viewBox="0 0 7 12" fill="none">
      <Path d="M1 1l5 5-5 5" stroke="#C7C7CC" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={() => { hapticLight(); onToggle(); }}
        trackColor={{ false: "#E5E5EA", true: "#1072EA" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function LinkRow({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={s.rowLabel}>{label}</Text>
      <View style={s.rowRight}>
        {value && <Text style={s.rowValue}>{value}</Text>}
        <ChevronRight />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggle } = useTheme();
  const [notifPush, setNotifPush]   = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [biometrics, setBiometrics] = useState(false);

  const SECTIONS = [
    {
      title: "Account",
      rows: [
        <LinkRow key="profile" label="Edit Profile"       onPress={() => hapticLight()} />,
        <LinkRow key="kyc"     label="KYC Verification"   value="Unverified" onPress={() => { hapticLight(); router.push("/kyc" as any); }} />,
        <LinkRow key="pw"      label="Change Password"    onPress={() => hapticLight()} />,
      ],
    },
    {
      title: "Security",
      rows: [
        <ToggleRow key="bio"  label="Face / Touch ID"    value={biometrics}  onToggle={() => setBiometrics((v) => !v)} />,
        <LinkRow   key="2fa"  label="Two-Factor Auth"    value="Off"         onPress={() => hapticLight()} />,
        <LinkRow   key="sess" label="Active Sessions"                        onPress={() => hapticLight()} />,
      ],
    },
    {
      title: "Notifications",
      rows: [
        <ToggleRow key="push"  label="Push Notifications" value={notifPush}  onToggle={() => setNotifPush((v) => !v)} />,
        <ToggleRow key="email" label="Email Alerts"        value={notifEmail} onToggle={() => setNotifEmail((v) => !v)} />,
      ],
    },
    {
      title: "Appearance",
      rows: [
        <ToggleRow key="dark" label="Dark Mode" value={isDark} onToggle={toggle} />,
        <LinkRow   key="lang" label="Language"  value="English"  onPress={() => hapticLight()} />,
        <LinkRow   key="cur"  label="Currency"  value="USD"      onPress={() => hapticLight()} />,
      ],
    },
    {
      title: "About",
      rows: [
        <LinkRow key="terms" label="Terms of Service"  onPress={() => hapticLight()} />,
        <LinkRow key="priv"  label="Privacy Policy"    onPress={() => hapticLight()} />,
        <LinkRow key="ver"   label="Version"           value="1.0.0" />,
      ],
    },
  ];

  return (
    <View style={s.root}>
      <View style={[s.headerWrap, { paddingTop: insets.top }]}>
        <Text style={s.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {SECTIONS.map((sec) => (
          <View key={sec.title} style={s.section}>
            <Text style={s.sectionTitle}>{sec.title}</Text>
            <View style={s.card}>
              {sec.rows.map((row, i) => (
                <View key={i}>
                  {row}
                  {i < sec.rows.length - 1 && <View style={s.sep} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={[s.section, { paddingBottom: 120 }]}>
          <View style={s.card}>
            <TouchableOpacity
              style={[s.row, { justifyContent: "center" }]}
              onPress={() => { hapticLight(); router.replace("/auth"); }}
              activeOpacity={0.7}
            >
              <Text style={s.signOut}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F9FC" },
  headerWrap: { backgroundColor: "#F7F9FC", paddingHorizontal: 20, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", letterSpacing: -0.5, paddingVertical: 12 },
  scroll: { paddingHorizontal: 16 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#8E8E93", fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8, paddingLeft: 4 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, minHeight: 50 },
  rowLabel: { fontSize: 15, fontWeight: "500", color: "#1C1C1E", fontFamily: "Inter_500Medium" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { fontSize: 14, color: "#8E8E93", fontFamily: "Inter_400Regular" },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E5EA", marginLeft: 16 },
  signOut: { fontSize: 15, fontWeight: "600", color: "#E02E5B", fontFamily: "Inter_600SemiBold" },
});
