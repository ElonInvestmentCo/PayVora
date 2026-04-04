import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Pressable,
  Switch,
  Alert,
} from "react-native";
import { FocusedModal } from "@/components/FocusedModal";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { hapticSelection } from "@/utils/haptics";
import { GlowButton } from "@/components/GlowButton";
import { useKyc } from "@/contexts/KycContext";
import { useTheme } from "@/contexts/ThemeContext";

const LANGUAGES = ["English", "Spanish", "French", "Arabic", "Chinese", "Portuguese"];
const CURRENCIES = ["USD", "NGN", "EUR", "GBP", "CAD", "AUD"];

interface SettingToggle {
  key: string;
  label: string;
  subtitle: string;
  icon: string;
  iconColor: string;
}

const SECURITY_TOGGLES: SettingToggle[] = [
  { key: "twoFa",     label: "Two-Factor Authentication", subtitle: "Add extra security to your account",        icon: "shield",      iconColor: "#00E5FF" },
  { key: "biometric",  label: "Biometric Login",           subtitle: "Use Face ID or fingerprint to sign in",     icon: "smartphone",  iconColor: "#14B8A6" },
];

const NOTIFICATION_TOGGLES: SettingToggle[] = [
  { key: "txAlerts",    label: "Transaction Alerts",  subtitle: "Get notified on every transaction",  icon: "bell",        iconColor: "#00FF88" },
  { key: "priceAlerts", label: "Price Alerts",         subtitle: "Crypto price movement notifications", icon: "trending-up", iconColor: "#F59E0B" },
  { key: "promos",      label: "Promotions",           subtitle: "Deals, offers, and updates",         icon: "gift",        iconColor: "#8B5CF6" },
];

const PAYMENT_METHODS = [
  { id: "1", type: "Visa", last4: "6789", icon: "credit-card", color: "#00E5FF" },
  { id: "2", type: "Bank Account", last4: "4321", icon: "briefcase", color: "#14B8A6" },
];

const SESSIONS = [
  { id: "1", device: "iPhone 15 Pro", location: "Lagos, Nigeria", current: true, time: "Now" },
  { id: "2", device: "Chrome · macOS", location: "London, UK", current: false, time: "2 hours ago" },
  { id: "3", device: "Safari · iPad", location: "Lagos, Nigeria", current: false, time: "Yesterday" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { kycStatus } = useKyc();
  const { isDark, toggle: toggleDarkMode } = useTheme();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    twoFa: true, biometric: false,
    txAlerts: true, priceAlerts: true, promos: false,
    darkMode: true,
  });

  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("USD");
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [txLimit, setTxLimit] = useState("5000");

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggle = useCallback((key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleChangePw = useCallback(async () => {
    if (!currentPw || !newPw || !confirmPw) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (newPw.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPwSaving(false);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    Alert.alert("Success", "Your password has been updated.");
  }, [currentPw, newPw, confirmPw]);

  const handleLogout = useCallback(() => {
    Alert.alert("Logged Out", "You have been signed out successfully.");
  }, []);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setDeleting(false);
    setDeleteModal(false);
    Alert.alert("Account Deleted", "Your account has been permanently deleted.");
  }, []);

  const renderToggleRow = (item: SettingToggle) => (
    <View key={item.key} style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.toggleIcon, { backgroundColor: `${item.iconColor}15` }]}>
        <Feather name={item.icon as any} size={16} color={item.iconColor} />
      </View>
      <View style={styles.toggleInfo}>
        <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{item.label}</Text>
        <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
      </View>
      <Switch
        value={toggles[item.key]}
        onValueChange={() => toggle(item.key)}
        trackColor={{ false: colors.border, true: "rgba(0,229,255,0.3)" }}
        thumbColor={toggles[item.key] ? "#00E5FF" : "#94A3B8"}
      />
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        {/* Profile */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: "rgba(0,229,255,0.12)", borderColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>AJ</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>Alex Johnson</Text>
              <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>alex.johnson@email.com</Text>
              <TouchableOpacity onPress={() => router.push("/kyc")} activeOpacity={0.8}>
                <View style={[styles.verifiedBadge, {
                  backgroundColor: kycStatus === "verified" ? "rgba(0,255,136,0.12)" : kycStatus === "pending" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                  borderColor: kycStatus === "verified" ? "#00FF8830" : kycStatus === "pending" ? "#F59E0B30" : "#EF444430",
                }]}>
                  <Feather
                    name={kycStatus === "verified" ? "check-circle" : kycStatus === "pending" ? "clock" : "alert-circle"}
                    size={10}
                    color={kycStatus === "verified" ? "#00FF88" : kycStatus === "pending" ? "#F59E0B" : "#EF4444"}
                  />
                  <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: kycStatus === "verified" ? "#00FF88" : kycStatus === "pending" ? "#F59E0B" : "#EF4444" }}>
                    {kycStatus === "verified" ? "Verified" : kycStatus === "pending" ? "Pending" : "Not Verified"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.8} style={[styles.editBtn, { backgroundColor: "rgba(0,229,255,0.1)", borderColor: colors.primary + "30" }]}>
              <Feather name="edit-2" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="shield" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Security</Text>
          </View>
          {SECURITY_TOGGLES.map(renderToggleRow)}

          {/* Change Password */}
          <Text style={[styles.subHeader, { color: colors.mutedForeground }]}>Change Password</Text>
          <View style={styles.pwFields}>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="lock" size={14} color={colors.mutedForeground} />
              <TextInput
                value={currentPw}
                onChangeText={setCurrentPw}
                placeholder="Current password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPw}
                style={[styles.textInput, { color: colors.foreground }]}
              />
            </View>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="key" size={14} color={colors.mutedForeground} />
              <TextInput
                value={newPw}
                onChangeText={setNewPw}
                placeholder="New password (min 8 chars)"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPw}
                style={[styles.textInput, { color: colors.foreground }]}
              />
            </View>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="check-circle" size={14} color={colors.mutedForeground} />
              <TextInput
                value={confirmPw}
                onChangeText={setConfirmPw}
                placeholder="Confirm new password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPw}
                style={[styles.textInput, { color: colors.foreground }]}
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)} activeOpacity={0.8}>
                <Feather name={showPw ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleChangePw}
            activeOpacity={0.8}
            style={[styles.smallBtn, { backgroundColor: "rgba(0,229,255,0.12)", borderColor: colors.primary + "30" }]}
          >
            <Text style={[styles.smallBtnText, { color: colors.primary }]}>{pwSaving ? "Saving..." : "Update Password"}</Text>
          </TouchableOpacity>

          {/* Sessions */}
          <Text style={[styles.subHeader, { color: colors.mutedForeground }]}>Active Sessions</Text>
          {SESSIONS.map((s) => (
            <View key={s.id} style={[styles.sessionRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.sessionIcon, { backgroundColor: s.current ? "rgba(0,255,136,0.12)" : "rgba(148,163,184,0.1)" }]}>
                <Feather name={s.device.includes("iPhone") ? "smartphone" : s.device.includes("iPad") ? "tablet" : "monitor"} size={14} color={s.current ? "#00FF88" : colors.mutedForeground} />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionDevice, { color: colors.foreground }]}>{s.device}</Text>
                <Text style={[styles.sessionMeta, { color: colors.mutedForeground }]}>{s.location} · {s.time}</Text>
              </View>
              {s.current ? (
                <View style={[styles.currentBadge, { backgroundColor: "rgba(0,255,136,0.12)", borderColor: "#00FF8830" }]}>
                  <Text style={{ fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#00FF88" }}>Current</Text>
                </View>
              ) : (
                <TouchableOpacity activeOpacity={0.8}>
                  <Feather name="x" size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Notifications */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="bell" size={16} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Notifications</Text>
          </View>
          {NOTIFICATION_TOGGLES.map(renderToggleRow)}
        </View>

        {/* App Settings */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="sliders" size={16} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>App Settings</Text>
          </View>

          {/* Dark mode */}
          <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.toggleIcon, { backgroundColor: "rgba(139,92,246,0.15)" }]}>
              <Feather name={isDark ? "moon" : "sun"} size={16} color="#8B5CF6" />
            </View>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Dark Mode</Text>
              <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
                {isDark ? "Currently dark theme" : "Currently light theme"}
              </Text>
            </View>
            <Switch
              testID="dark-mode-switch"
              value={isDark}
              onValueChange={() => { hapticSelection(); toggleDarkMode(); }}
              trackColor={{ false: colors.border, true: "rgba(139,92,246,0.3)" }}
              thumbColor={isDark ? "#8B5CF6" : "#94A3B8"}
            />
          </View>

          {/* Language */}
          <TouchableOpacity onPress={() => { setLangOpen(!langOpen); setCurrOpen(false); }} activeOpacity={0.8} style={[styles.selectRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.toggleIcon, { backgroundColor: "rgba(20,184,166,0.15)" }]}>
              <Feather name="globe" size={16} color="#14B8A6" />
            </View>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Language</Text>
              <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>{language}</Text>
            </View>
            <Feather name={langOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          {langOpen && (
            <View style={styles.optionList}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity key={l} onPress={() => { setLanguage(l); setLangOpen(false); }} style={[styles.optionItem, l === language && { backgroundColor: "rgba(0,229,255,0.06)" }]}>
                  <Text style={[styles.optionText, { color: l === language ? colors.primary : colors.foreground }]}>{l}</Text>
                  {l === language && <Feather name="check" size={14} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Currency */}
          <TouchableOpacity onPress={() => { setCurrOpen(!currOpen); setLangOpen(false); }} activeOpacity={0.8} style={[styles.selectRow, { borderBottomColor: "transparent" }]}>
            <View style={[styles.toggleIcon, { backgroundColor: "rgba(0,229,255,0.15)" }]}>
              <Feather name="dollar-sign" size={16} color="#00E5FF" />
            </View>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Currency</Text>
              <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>{currency}</Text>
            </View>
            <Feather name={currOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          {currOpen && (
            <View style={styles.optionList}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity key={c} onPress={() => { setCurrency(c); setCurrOpen(false); }} style={[styles.optionItem, c === currency && { backgroundColor: "rgba(0,229,255,0.06)" }]}>
                  <Text style={[styles.optionText, { color: c === currency ? colors.primary : colors.foreground }]}>{c}</Text>
                  {c === currency && <Feather name="check" size={14} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Payment & Limits */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="credit-card" size={16} color="#00FF88" />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Payment & Limits</Text>
          </View>

          <Text style={[styles.subHeader, { color: colors.mutedForeground }]}>Daily Transaction Limit</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border, marginBottom: 14 }]}>
            <Text style={[styles.prefix, { color: colors.primary }]}>$</Text>
            <TextInput
              value={txLimit}
              onChangeText={setTxLimit}
              keyboardType="numeric"
              style={[styles.textInput, styles.limitInput, { color: colors.foreground }]}
            />
            <Text style={[styles.suffix, { color: colors.mutedForeground }]}>/day</Text>
          </View>

          <Text style={[styles.subHeader, { color: colors.mutedForeground }]}>Linked Payment Methods</Text>
          {PAYMENT_METHODS.map((pm) => (
            <View key={pm.id} style={[styles.paymentRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.toggleIcon, { backgroundColor: `${pm.color}15` }]}>
                <Feather name={pm.icon as any} size={16} color={pm.color} />
              </View>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{pm.type}</Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>•••• {pm.last4}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.8}>
                <Feather name="trash-2" size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity activeOpacity={0.8} style={[styles.addMethodBtn, { borderColor: colors.border }]}>
            <Feather name="plus" size={16} color={colors.primary} />
            <Text style={[styles.addMethodText, { color: colors.primary }]}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: "#EF444430" }]}>
          <View style={styles.sectionHeader}>
            <Feather name="alert-triangle" size={16} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: "#EF4444" }]}>Danger Zone</Text>
          </View>

          <TouchableOpacity onPress={handleLogout} activeOpacity={0.8} style={[styles.dangerBtn, { backgroundColor: "rgba(245,158,11,0.1)", borderColor: "#F59E0B30" }]}>
            <Feather name="log-out" size={16} color="#F59E0B" />
            <Text style={[styles.dangerBtnText, { color: "#F59E0B" }]}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setDeleteModal(true)} activeOpacity={0.8} style={[styles.dangerBtn, { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "#EF444430", marginTop: 10 }]}>
            <Feather name="trash-2" size={16} color="#EF4444" />
            <Text style={[styles.dangerBtnText, { color: "#EF4444" }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: colors.mutedForeground }]}>GiftCard Trader v2.4.1</Text>
      </ScrollView>

      {/* Delete Account Modal */}
      <FocusedModal transparent visible={deleteModal} animationType="fade" onRequestClose={() => setDeleteModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setDeleteModal(false)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Delete Account</Text>
              <TouchableOpacity onPress={() => setDeleteModal(false)} activeOpacity={0.8}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalWarningIcon, { backgroundColor: "rgba(239,68,68,0.1)" }]}>
              <Feather name="alert-triangle" size={36} color="#EF4444" />
            </View>

            <Text style={[styles.modalWarningTitle, { color: "#EF4444" }]}>This action is permanent</Text>
            <Text style={[styles.modalWarningSub, { color: colors.mutedForeground }]}>
              Deleting your account will permanently remove all your data, transaction history, and wallet balances. This cannot be undone.
            </Text>

            <GlowButton title={deleting ? "Deleting..." : "Delete My Account"} onPress={handleDelete} loading={deleting} style={{ backgroundColor: "#EF4444" }} />

            <TouchableOpacity onPress={() => setDeleteModal(false)} activeOpacity={0.8} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </FocusedModal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  content: { padding: 20, gap: 16 },

  card: { borderRadius: 16, padding: 18, borderWidth: 1 },

  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontFamily: "Inter_700Bold" },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  verifiedBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start", marginTop: 4,
  },
  editBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },

  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  toggleIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toggleInfo: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  toggleSub: { fontSize: 11, fontFamily: "Inter_400Regular" },

  subHeader: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 14, marginBottom: 10 },

  pwFields: { gap: 8 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48,
  },
  textInput: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  prefix: { fontSize: 18, fontFamily: "Inter_700Bold" },
  suffix: { fontSize: 12, fontFamily: "Inter_400Regular" },
  limitInput: { fontSize: 20, fontFamily: "Inter_700Bold" },

  smallBtn: { borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1, marginTop: 10 },
  smallBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  sessionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  sessionIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sessionInfo: { flex: 1, gap: 2 },
  sessionDevice: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sessionMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  currentBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },

  selectRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  optionList: { paddingLeft: 48 },
  optionItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  optionText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  paymentRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  addMethodBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 12, borderWidth: 1, borderStyle: "dashed", paddingVertical: 14, marginTop: 10,
  },
  addMethodText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  dangerBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, paddingVertical: 14,
  },
  dangerBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  version: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end", padding: 16 },
  modal: { borderRadius: 20, padding: 20, borderWidth: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalWarningIcon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16 },
  modalWarningTitle: { fontSize: 17, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 8 },
  modalWarningSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 20 },
  cancelBtn: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  cancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
