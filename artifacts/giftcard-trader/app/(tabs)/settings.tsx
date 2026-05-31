import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FocusedModal } from "@/components/FocusedModal";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { hapticSelection } from "@/utils/haptics";
import { useKyc } from "@/contexts/KycContext";
import { useTheme } from "@/contexts/ThemeContext";
import { GlowButton } from "@/components/GlowButton";

const LANGUAGES = ["English", "Spanish", "French", "Arabic", "Chinese", "Portuguese"];
const CURRENCIES = ["USD", "NGN", "EUR", "GBP", "CAD", "AUD"];

const SECURITY_TOGGLES = [
  { key: "twoFa",     label: "Two-Factor Auth",  subtitle: "Add extra security",            icon: "shield",    color: "#1A5AFF" },
  { key: "biometric", label: "Biometric Login",   subtitle: "Face ID or fingerprint",        icon: "eye",       color: "#5AC8FA" },
];
const NOTIF_TOGGLES = [
  { key: "txAlerts",    label: "Transaction Alerts", subtitle: "Get notified on every transaction", icon: "bell",        color: "#30D158" },
  { key: "priceAlerts", label: "Price Alerts",        subtitle: "Crypto price movements",           icon: "trending-up", color: "#FF9F0A" },
  { key: "promos",      label: "Promotions",           subtitle: "Deals, offers, and updates",       icon: "gift",        color: "#AF52DE" },
];
const PAYMENT_METHODS = [
  { id: "1", type: "Visa",         last4: "6789", color: "#1A5AFF" },
  { id: "2", type: "Bank Account", last4: "4321", color: "#30D158" },
];
const SESSIONS = [
  { id: "1", device: "iPhone 15 Pro",   location: "Lagos, Nigeria", current: true,  time: "Now" },
  { id: "2", device: "Chrome · macOS",  location: "London, UK",     current: false, time: "2 hours ago" },
  { id: "3", device: "Safari · iPad",   location: "Lagos, Nigeria", current: false, time: "Yesterday" },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const ICON_PATHS: Record<string, string> = {
  shield:       "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  eye:          "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  bell:         "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  "trending-up":"M23 6l-9.5 9.5-5-5L1 18",
  gift:         "M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  moon:         "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  sun:          "M12 3v1m0 16v1M3 12H2m20 0h-1M5.22 5.22l-.71-.71m14 14l-.71-.71M5.22 18.78l-.71.71M18.78 5.22l.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z",
  globe:        "M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20",
  dollar:       "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  "credit-card":"M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22",
  sliders:      "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  trash:        "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2",
  "log-out":    "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  "alert-tri":  "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  check:        "M20 6L9 17l-5-5",
  "chevron-d":  "M6 9l6 6 6-6",
  "chevron-u":  "M18 15l-6-6-6 6",
  "x":          "M18 6L6 18M6 6l12 12",
  lock:         "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  key:          "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  smartphone:   "M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2zM12 18h.01",
  monitor:      "M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2zM8 21h8M12 17v4",
  tablet:       "M18 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zM12 17h.01",
  plus:         "M12 5v14M5 12h14",
  "edit-2":     "M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z",
};

function Icon({ name, color = "#8E8E93", size = 16 }: { name: string; color?: string; size?: number }) {
  const d = ICON_PATHS[name] || ICON_PATHS["x"];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}

function SectionHeader({ icon, label, iconColor }: { icon: string; label: string; iconColor: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={[s.sectionHeaderIcon, { backgroundColor: iconColor + "15" }]}>
        <Icon name={icon} color={iconColor} size={16} />
      </View>
      <Text style={s.sectionHeaderText}>{label}</Text>
    </View>
  );
}

function ToggleRow({ item, value, onToggle }: { item: typeof SECURITY_TOGGLES[0]; value: boolean; onToggle: () => void }) {
  return (
    <View style={s.toggleRow}>
      <View style={[s.toggleIcon, { backgroundColor: item.color + "15" }]}>
        <Icon name={item.icon} color={item.color} size={15} />
      </View>
      <View style={s.toggleInfo}>
        <Text style={s.toggleLabel}>{item.label}</Text>
        <Text style={s.toggleSub}>{item.subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#E5E5EA", true: "#1A5AFF55" }}
        thumbColor={value ? "#1A5AFF" : "#C7C7CC"}
        ios_backgroundColor="#E5E5EA"
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { kycStatus } = useKyc();
  const { isDark, toggle: toggleDark } = useTheme();

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    twoFa: true, biometric: false,
    txAlerts: true, priceAlerts: true, promos: false,
  });

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [txLimit, setTxLimit] = useState("5000");
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("USD");
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggle = useCallback((key: string) => {
    setToggles((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  const handleChangePw = useCallback(async () => {
    if (!currentPw || !newPw || !confirmPw) { Alert.alert("Error", "Please fill all password fields."); return; }
    if (newPw !== confirmPw) { Alert.alert("Error", "New passwords do not match."); return; }
    if (newPw.length < 8) { Alert.alert("Error", "Password must be at least 8 characters."); return; }
    setPwSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPwSaving(false);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    Alert.alert("Success", "Your password has been updated.");
  }, [currentPw, newPw, confirmPw]);

  const handleLogout = useCallback(() => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => Alert.alert("Logged Out", "You have been signed out.") },
    ]);
  }, []);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setDeleting(false);
    setDeleteModal(false);
    Alert.alert("Account Deleted", "Your account has been permanently deleted.");
  }, []);

  const kycColor = kycStatus === "verified" ? "#30D158" : kycStatus === "pending" ? "#FF9F0A" : "#FF3B30";
  const kycLabel = kycStatus === "verified" ? "Verified" : kycStatus === "pending" ? "Pending" : "Not Verified";

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Settings</Text>
        </View>

        {/* ── Profile Card ── */}
        <View style={s.section}>
          <SectionCard>
            <View style={s.profileRow}>
              <View style={s.avatarGrad}>
                <Text style={s.avatarText}>AJ</Text>
              </View>
              <View style={s.profileInfo}>
                <Text style={s.profileName}>Alex Johnson</Text>
                <Text style={s.profileEmail}>alex.johnson@email.com</Text>
                <TouchableOpacity onPress={() => router.push("/kyc" as any)} activeOpacity={0.8}>
                  <View style={[s.kycBadge, { backgroundColor: kycColor + "15" }]}>
                    <View style={[s.kycDot, { backgroundColor: kycColor }]} />
                    <Text style={[s.kycBadgeText, { color: kycColor }]}>{kycLabel}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity activeOpacity={0.8} style={s.editBtn}>
                <Icon name="edit-2" color="#1A5AFF" size={14} />
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
              {[{ label: "Trades", value: "142" }, { label: "Volume", value: "$42K" }, { label: "Rank", value: "#5" }].map((st, i) => (
                <React.Fragment key={st.label}>
                  {i > 0 && <View style={s.statDivider} />}
                  <View style={s.statItem}>
                    <Text style={s.statValue}>{st.value}</Text>
                    <Text style={s.statLabel}>{st.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </SectionCard>
        </View>

        {/* ── Quick Links ── */}
        <View style={s.section}>
          <SectionCard>
            {[
              { icon: "credit-card", label: "Virtual Dollar Card", color: "#AF52DE", route: "/virtual-card" },
              { icon: "smartphone",  label: "Bills & eSIMs",        color: "#FF9F0A", route: "/bills" },
              { icon: "shield",      label: "KYC Verification",     color: "#1A5AFF", route: "/kyc" },
            ].map((item, i, arr) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.8}
                style={[s.menuRow, i < arr.length - 1 && s.menuRowBorder]}
              >
                <View style={[s.menuIcon, { backgroundColor: item.color + "15" }]}>
                  <Icon name={item.icon} color={item.color} size={15} />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Icon name="chevron-d" color="#C7C7CC" size={14} />
              </TouchableOpacity>
            ))}
          </SectionCard>
        </View>

        {/* ── Security ── */}
        <View style={s.section}>
          <SectionCard>
            <SectionHeader icon="shield" label="Security" iconColor="#1A5AFF" />
            {SECURITY_TOGGLES.map((item) => (
              <ToggleRow key={item.key} item={item} value={toggles[item.key]} onToggle={() => toggle(item.key)} />
            ))}

            <Text style={s.subHeader}>Change Password</Text>
            <View style={s.pwFields}>
              {[
                { value: currentPw, onChange: setCurrentPw, placeholder: "Current password",         icon: "lock" },
                { value: newPw,     onChange: setNewPw,     placeholder: "New password (min 8 chars)", icon: "key" },
                { value: confirmPw, onChange: setConfirmPw, placeholder: "Confirm new password",      icon: "check" },
              ].map((f, i) => (
                <View key={i} style={s.inputRow}>
                  <Icon name={f.icon} color="#8E8E93" size={14} />
                  <TextInput
                    value={f.value}
                    onChangeText={f.onChange}
                    placeholder={f.placeholder}
                    placeholderTextColor="#8E8E93"
                    secureTextEntry={!showPw}
                    style={s.textInput}
                  />
                  {i === 2 && (
                    <TouchableOpacity onPress={() => setShowPw(!showPw)} activeOpacity={0.8}>
                      <Icon name={showPw ? "eye" : "eye"} color="#8E8E93" size={15} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={handleChangePw} activeOpacity={0.8} style={s.smallBtn}>
              <Text style={s.smallBtnText}>{pwSaving ? "Saving…" : "Update Password"}</Text>
            </TouchableOpacity>

            <Text style={s.subHeader}>Active Sessions</Text>
            {SESSIONS.map((sess, i) => (
              <View key={sess.id} style={[s.sessionRow, i < SESSIONS.length - 1 && s.sessionRowBorder]}>
                <View style={[s.sessionIcon, { backgroundColor: sess.current ? "#30D15815" : "#F2F2F7" }]}>
                  <Icon name={sess.device.includes("iPhone") ? "smartphone" : sess.device.includes("iPad") ? "tablet" : "monitor"} color={sess.current ? "#30D158" : "#8E8E93"} size={13} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.sessionDevice}>{sess.device}</Text>
                  <Text style={s.sessionMeta}>{sess.location} · {sess.time}</Text>
                </View>
                {sess.current ? (
                  <View style={s.currentBadge}>
                    <Text style={s.currentBadgeText}>Current</Text>
                  </View>
                ) : (
                  <TouchableOpacity activeOpacity={0.8}>
                    <Icon name="x" color="#FF3B30" size={15} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </SectionCard>
        </View>

        {/* ── Notifications ── */}
        <View style={s.section}>
          <SectionCard>
            <SectionHeader icon="bell" label="Notifications" iconColor="#FF9F0A" />
            {NOTIF_TOGGLES.map((item) => (
              <ToggleRow key={item.key} item={item} value={toggles[item.key]} onToggle={() => toggle(item.key)} />
            ))}
          </SectionCard>
        </View>

        {/* ── App Settings ── */}
        <View style={s.section}>
          <SectionCard>
            <SectionHeader icon="sliders" label="App Settings" iconColor="#AF52DE" />

            {/* Dark Mode */}
            <View style={s.toggleRow}>
              <View style={[s.toggleIcon, { backgroundColor: "#AF52DE15" }]}>
                <Icon name={isDark ? "moon" : "sun"} color="#AF52DE" size={15} />
              </View>
              <View style={s.toggleInfo}>
                <Text style={s.toggleLabel}>Dark Mode</Text>
                <Text style={s.toggleSub}>{isDark ? "Currently dark" : "Currently light"}</Text>
              </View>
              <Switch value={isDark} onValueChange={() => { hapticSelection(); toggleDark(); }} trackColor={{ false: "#E5E5EA", true: "#AF52DE55" }} thumbColor={isDark ? "#AF52DE" : "#C7C7CC"} ios_backgroundColor="#E5E5EA" />
            </View>

            {/* Language */}
            <TouchableOpacity onPress={() => { setLangOpen(!langOpen); setCurrOpen(false); }} activeOpacity={0.8} style={[s.selectRow, langOpen && s.selectRowOpen]}>
              <View style={[s.toggleIcon, { backgroundColor: "#5AC8FA15" }]}>
                <Icon name="globe" color="#5AC8FA" size={15} />
              </View>
              <View style={s.toggleInfo}>
                <Text style={s.toggleLabel}>Language</Text>
                <Text style={s.toggleSub}>{language}</Text>
              </View>
              <Icon name={langOpen ? "chevron-u" : "chevron-d"} color="#8E8E93" size={14} />
            </TouchableOpacity>
            {langOpen && (
              <View style={s.optionList}>
                {LANGUAGES.map((l) => (
                  <TouchableOpacity key={l} onPress={() => { setLanguage(l); setLangOpen(false); }} style={[s.optionItem, l === language && s.optionItemActive]}>
                    <Text style={[s.optionText, l === language && s.optionTextActive]}>{l}</Text>
                    {l === language && <Icon name="check" color="#1A5AFF" size={14} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Currency */}
            <TouchableOpacity onPress={() => { setCurrOpen(!currOpen); setLangOpen(false); }} activeOpacity={0.8} style={s.selectRow}>
              <View style={[s.toggleIcon, { backgroundColor: "#1A5AFF15" }]}>
                <Icon name="dollar" color="#1A5AFF" size={15} />
              </View>
              <View style={s.toggleInfo}>
                <Text style={s.toggleLabel}>Currency</Text>
                <Text style={s.toggleSub}>{currency}</Text>
              </View>
              <Icon name={currOpen ? "chevron-u" : "chevron-d"} color="#8E8E93" size={14} />
            </TouchableOpacity>
            {currOpen && (
              <View style={s.optionList}>
                {CURRENCIES.map((c) => (
                  <TouchableOpacity key={c} onPress={() => { setCurrency(c); setCurrOpen(false); }} style={[s.optionItem, c === currency && s.optionItemActive]}>
                    <Text style={[s.optionText, c === currency && s.optionTextActive]}>{c}</Text>
                    {c === currency && <Icon name="check" color="#1A5AFF" size={14} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </SectionCard>
        </View>

        {/* ── Payment & Limits ── */}
        <View style={s.section}>
          <SectionCard>
            <SectionHeader icon="credit-card" label="Payment & Limits" iconColor="#30D158" />

            <Text style={s.subHeader}>Daily Transaction Limit</Text>
            <View style={s.limitRow}>
              <Text style={s.limitPrefix}>$</Text>
              <TextInput value={txLimit} onChangeText={setTxLimit} keyboardType="numeric" style={s.limitInput} />
              <Text style={s.limitSuffix}>/day</Text>
            </View>

            <Text style={s.subHeader}>Payment Methods</Text>
            {PAYMENT_METHODS.map((pm, i) => (
              <View key={pm.id} style={[s.paymentRow, i < PAYMENT_METHODS.length - 1 && s.paymentRowBorder]}>
                <View style={[s.toggleIcon, { backgroundColor: pm.color + "15" }]}>
                  <Icon name="credit-card" color={pm.color} size={15} />
                </View>
                <View style={s.toggleInfo}>
                  <Text style={s.toggleLabel}>{pm.type}</Text>
                  <Text style={s.toggleSub}>•••• {pm.last4}</Text>
                </View>
                <TouchableOpacity activeOpacity={0.8}>
                  <Icon name="trash" color="#FF3B30" size={14} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity activeOpacity={0.8} style={s.addBtn}>
              <Icon name="plus" color="#1A5AFF" size={16} />
              <Text style={s.addBtnText}>Add Payment Method</Text>
            </TouchableOpacity>
          </SectionCard>
        </View>

        {/* ── Danger Zone ── */}
        <View style={s.section}>
          <View style={[s.card, s.dangerCard]}>
            <SectionHeader icon="alert-tri" label="Danger Zone" iconColor="#FF3B30" />
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.8} style={s.dangerBtn}>
              <Icon name="log-out" color="#FF9F0A" size={16} />
              <Text style={[s.dangerBtnText, { color: "#FF9F0A" }]}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteModal(true)} activeOpacity={0.8} style={[s.dangerBtn, s.dangerBtnRed]}>
              <Icon name="trash" color="#FF3B30" size={16} />
              <Text style={[s.dangerBtnText, { color: "#FF3B30" }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.version}>GiftCard Trader v2.4.1</Text>
      </ScrollView>

      {/* ── Delete Modal ── */}
      <FocusedModal transparent visible={deleteModal} animationType="fade" onRequestClose={() => setDeleteModal(false)}>
        <Pressable style={s.overlay} onPress={() => setDeleteModal(false)}>
          <Pressable style={s.modal} onPress={() => {}}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Delete Account</Text>
              <TouchableOpacity onPress={() => setDeleteModal(false)} activeOpacity={0.8}>
                <Icon name="x" color="#8E8E93" size={20} />
              </TouchableOpacity>
            </View>
            <View style={s.warningCircle}>
              <Icon name="alert-tri" color="#FF3B30" size={32} />
            </View>
            <Text style={s.warningTitle}>This action is permanent</Text>
            <Text style={s.warningBody}>Deleting your account will permanently remove all data, transaction history, and wallet balances. This cannot be undone.</Text>
            <GlowButton title={deleting ? "Deleting…" : "Delete My Account"} onPress={handleDelete} loading={deleting} variant="danger" />
            <TouchableOpacity onPress={() => setDeleteModal(false)} activeOpacity={0.8} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </FocusedModal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: { paddingBottom: 40 },

  header: { paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },

  section: { paddingHorizontal: 16, marginBottom: 10 },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  dangerCard: { borderWidth: 1, borderColor: "#FF3B3018" },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  sectionHeaderIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sectionHeaderText: { fontSize: 15, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },

  profileRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, paddingBottom: 10 },
  avatarGrad: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#1A5AFF", alignItems: "center", justifyContent: "center", shadowColor: "#1A5AFF", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 17, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  profileEmail: { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_400Regular" },
  kycBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  kycDot: { width: 6, height: 6, borderRadius: 3 },
  kycBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  editBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#EEF3FF", alignItems: "center", justifyContent: "center" },

  statsRow: { flexDirection: "row", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E5EA", marginTop: 4 },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 12 },
  statDivider: { width: StyleSheet.hairlineWidth, backgroundColor: "#E5E5EA" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, color: "#8E8E93", fontFamily: "Inter_400Regular", marginTop: 2 },

  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },

  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F2F2F7" },
  toggleIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toggleInfo: { flex: 1, gap: 1 },
  toggleLabel: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  toggleSub: { fontSize: 11, color: "#8E8E93", fontFamily: "Inter_400Regular" },

  subHeader: { fontSize: 11, color: "#8E8E93", fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.7, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },

  pwFields: { paddingHorizontal: 16, gap: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F2F2F7", borderRadius: 12, paddingHorizontal: 14, height: 48 },
  textInput: { flex: 1, fontSize: 14, color: "#1C1C1E", fontFamily: "Inter_400Regular" },
  smallBtn: { marginHorizontal: 16, marginTop: 10, marginBottom: 4, backgroundColor: "#EEF3FF", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  smallBtnText: { fontSize: 13, fontWeight: "600", color: "#1A5AFF", fontFamily: "Inter_600SemiBold" },

  sessionRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  sessionRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F2F2F7" },
  sessionIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sessionDevice: { fontSize: 13, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  sessionMeta: { fontSize: 11, color: "#8E8E93", fontFamily: "Inter_400Regular", marginTop: 1 },
  currentBadge: { backgroundColor: "#30D15815", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  currentBadgeText: { fontSize: 10, fontWeight: "600", color: "#30D158", fontFamily: "Inter_600SemiBold" },

  selectRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F2F2F7" },
  selectRowOpen: { borderBottomColor: "#E5E5EA" },
  optionList: { paddingLeft: 62, paddingRight: 16, paddingBottom: 8 },
  optionItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8 },
  optionItemActive: { backgroundColor: "#EEF3FF" },
  optionText: { fontSize: 14, color: "#1C1C1E", fontFamily: "Inter_500Medium" },
  optionTextActive: { color: "#1A5AFF", fontFamily: "Inter_600SemiBold" },

  limitRow: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, backgroundColor: "#F2F2F7", borderRadius: 12, paddingHorizontal: 14, height: 52, marginBottom: 8 },
  limitPrefix: { fontSize: 22, fontWeight: "700", color: "#1A5AFF", fontFamily: "Inter_700Bold" },
  limitInput: { flex: 1, fontSize: 22, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  limitSuffix: { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_400Regular" },

  paymentRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  paymentRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#F2F2F7" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginTop: 10, marginBottom: 16, borderRadius: 12, borderWidth: 1, borderColor: "#E5E5EA", borderStyle: "dashed", paddingVertical: 13 },
  addBtnText: { fontSize: 13, fontWeight: "600", color: "#1A5AFF", fontFamily: "Inter_600SemiBold" },

  dangerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 16, marginTop: 10, borderRadius: 14, backgroundColor: "#FFF9EC", paddingVertical: 15 },
  dangerBtnRed: { backgroundColor: "#FFF2F2", marginBottom: 16 },
  dangerBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },

  version: { fontSize: 12, color: "#C7C7CC", fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8, paddingBottom: 8 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end", padding: 16 },
  modal: { backgroundColor: "#FFFFFF", borderRadius: 28, padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  warningCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFF2F2", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 14 },
  warningTitle: { fontSize: 17, fontWeight: "700", color: "#FF3B30", textAlign: "center", fontFamily: "Inter_700Bold", marginBottom: 8 },
  warningBody: { fontSize: 14, color: "#8E8E93", textAlign: "center", lineHeight: 21, fontFamily: "Inter_400Regular", marginBottom: 22 },
  cancelBtn: { alignItems: "center", paddingVertical: 14, marginTop: 4 },
  cancelText: { fontSize: 14, color: "#8E8E93", fontFamily: "Inter_500Medium" },
});
