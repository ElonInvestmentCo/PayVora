import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Path,
  Rect,
  Defs,
  LinearGradient as SvgGrad,
  Stop,
} from "react-native-svg";

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}
import { Eye, EyeOff, ChevronDown, Check } from "lucide-react-native";
import { hapticLight, hapticMedium, hapticSuccess } from "@/utils/haptics";

const { width: W } = Dimensions.get("window");

// ─── Mini PayVora P Logo ───────────────────────────────────────────────────────
function MiniLogo({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.12} viewBox="0 0 72 80">
      <Defs>
        <SvgGrad id="mLG" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#C4DFFF" />
          <Stop offset="45%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#A8CCFF" />
        </SvgGrad>
        <SvgGrad id="mBG" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1A52E8" />
          <Stop offset="100%" stopColor="#0C38C4" />
        </SvgGrad>
      </Defs>
      <Path
        d="M 10,78 L 10,14 C 10,7 15,2 22,2 L 42,2 C 56,2 66,12 66,26 C 66,40 56,50 42,50 L 26,50 L 26,78 Z"
        fill="url(#mLG)"
      />
      <Path
        d="M 26,14 L 40,14 C 50,14 58,20 58,29 C 58,38 50,44 40,44 L 26,44 Z"
        fill="url(#mBG)"
      />
      <Rect x="38" y="17" width="15" height="10" rx="2" fill="rgba(255,255,255,0.88)" />
    </Svg>
  );
}

// ─── Labeled Input ─────────────────────────────────────────────────────────────
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words";
  error?: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  editable?: boolean;
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  rightElement,
  leftElement,
  editable = true,
}: InputFieldProps) {
  return (
    <View style={inputStyles.wrap}>
      <Text style={inputStyles.label}>{label}</Text>
      <View style={[inputStyles.row, error ? inputStyles.rowError : null]}>
        {leftElement}
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? label}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          style={[inputStyles.input, leftElement ? { paddingLeft: 6 } : null]}
        />
        {rightElement}
      </View>
      {error ? <Text style={inputStyles.error}>{error}</Text> : null}
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#475569",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  rowError: { backgroundColor: "#FFF2F2" },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontFamily: "Inter_400Regular",
    paddingVertical: 0,
  },
  error: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
});

// ─── Phone Prefix Badge ────────────────────────────────────────────────────────
function PhonePrefix() {
  return (
    <View style={pStyles.badge}>
      <Text style={pStyles.flag}>🇳🇬</Text>
      <Text style={pStyles.code}>+234</Text>
      <ChevronDown size={12} color="#64748B" />
    </View>
  );
}
const pStyles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: "#CBD5E1",
    marginRight: 8,
  },
  flag: { fontSize: 16 },
  code: { fontSize: 13, color: "#334155", fontFamily: "Inter_500Medium" },
});

// ─── Password Field ────────────────────────────────────────────────────────────
function PasswordField({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <InputField
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? "••••••••"}
      secureTextEntry={!show}
      error={error}
      rightElement={
        <TouchableOpacity onPress={() => setShow((s) => !s)} hitSlop={8}>
          {show ? (
            <EyeOff size={18} color="#94A3B8" />
          ) : (
            <Eye size={18} color="#94A3B8" />
          )}
        </TouchableOpacity>
      }
    />
  );
}

// ─── Tab Toggle ────────────────────────────────────────────────────────────────
function TabToggle({
  active,
  onChange,
}: {
  active: "login" | "signup";
  onChange: (t: "login" | "signup") => void;
}) {
  const slideAnim = useRef(new Animated.Value(active === "login" ? 0 : 1)).current;

  const switchTab = (tab: "login" | "signup") => {
    hapticLight();
    Animated.spring(slideAnim, {
      toValue: tab === "login" ? 0 : 1,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
    onChange(tab);
  };

  const slideX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (W - 48) / 2],
  });

  return (
    <View style={tabStyles.container}>
      <Animated.View style={[tabStyles.slider, { transform: [{ translateX: slideX }] }]} />
      <TouchableOpacity style={tabStyles.tab} onPress={() => switchTab("login")}>
        <Text style={[tabStyles.label, active === "login" && tabStyles.labelActive]}>
          Login
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={tabStyles.tab} onPress={() => switchTab("signup")}>
        <Text style={[tabStyles.label, active === "signup" && tabStyles.labelActive]}>
          Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#EFF3FB",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    position: "relative",
  },
  slider: {
    position: "absolute",
    top: 4,
    left: 4,
    width: (W - 56) / 2,
    bottom: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    shadowColor: "#1254EC",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, zIndex: 1 },
  label: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#94A3B8",
  },
  labelActive: { color: "#0F172A", fontFamily: "Inter_600SemiBold" },
});

// ─── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email or phone is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    hapticMedium();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      hapticSuccess();
      onSuccess();
    }, 1400);
  };

  return (
    <View>
      <InputField
        label="Email Address or Phone"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        error={errors.email}
      />
      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        error={errors.password}
      />

      <TouchableOpacity style={formStyles.forgotRow}>
        <Text style={formStyles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={submit}
        disabled={loading}
        activeOpacity={0.85}
        style={[formStyles.cta, loading && formStyles.ctaLoading]}
      >
        <LinearGradient
          colors={["#1A5AFF", "#0C38C0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={formStyles.ctaGradient}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={formStyles.ctaText}>Login to PayVora</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Sign Up Form ──────────────────────────────────────────────────────────────
function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    referral: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (form.phone.replace(/\D/g, "").length < 8) e.phone = "Enter a valid phone number";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Min 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    if (!agreed) e.terms = "You must accept the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    hapticMedium();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      hapticSuccess();
      onSuccess();
    }, 1600);
  };

  return (
    <View>
      <InputField
        label="Full Name"
        value={form.name}
        onChange={set("name")}
        placeholder="e.g. Amaka Johnson"
        autoCapitalize="words"
        error={errors.name}
      />
      <InputField
        label="Email Address"
        value={form.email}
        onChange={set("email")}
        placeholder="you@example.com"
        keyboardType="email-address"
        error={errors.email}
      />
      <InputField
        label="Phone Number"
        value={form.phone}
        onChange={set("phone")}
        placeholder="800 000 0001"
        keyboardType="phone-pad"
        error={errors.phone}
        leftElement={<PhonePrefix />}
      />
      <PasswordField
        label="Password"
        value={form.password}
        onChange={set("password")}
        error={errors.password}
        placeholder="Min. 8 characters"
      />
      <PasswordField
        label="Confirm Password"
        value={form.confirm}
        onChange={set("confirm")}
        error={errors.confirm}
      />
      <InputField
        label="Referral Code (Optional)"
        value={form.referral}
        onChange={set("referral")}
        placeholder="Enter referral code"
      />

      {/* Terms checkbox */}
      <TouchableOpacity
        style={signupStyles.termsRow}
        onPress={() => {
          hapticLight();
          setAgreed((a) => !a);
        }}
        activeOpacity={0.7}
      >
        <View style={[signupStyles.checkbox, agreed && signupStyles.checkboxActive]}>
          {agreed && <Check size={13} color="#fff" strokeWidth={3} />}
        </View>
        <Text style={signupStyles.termsText}>
          I agree to PayVora's{" "}
          <Text style={signupStyles.link}>Terms & Conditions</Text> and{" "}
          <Text style={signupStyles.link}>Privacy Policy</Text>
        </Text>
      </TouchableOpacity>
      {errors.terms ? (
        <Text style={signupStyles.termsError}>{errors.terms}</Text>
      ) : null}

      <TouchableOpacity
        onPress={submit}
        disabled={loading}
        activeOpacity={0.85}
        style={[formStyles.cta, loading && formStyles.ctaLoading]}
      >
        <LinearGradient
          colors={["#1A5AFF", "#0C38C0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={formStyles.ctaGradient}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={formStyles.ctaText}>Create Account</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Text style={signupStyles.disclaimer}>
        By signing up you confirm you are 18+ years old and agree to our terms.
      </Text>
    </View>
  );
}

const signupStyles = StyleSheet.create({
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 6,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxActive: {
    backgroundColor: "#1254EC",
    borderColor: "#1254EC",
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  link: { color: "#1254EC", fontFamily: "Inter_500Medium" },
  termsError: {
    fontSize: 12,
    color: "#EF4444",
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
    marginLeft: 30,
  },
  disclaimer: {
    fontSize: 11.5,
    color: "#94A3B8",
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    marginTop: 10,
    lineHeight: 17,
  },
});

const formStyles = StyleSheet.create({
  forgotRow: { alignItems: "flex-end", marginTop: -6, marginBottom: 20 },
  forgot: {
    fontSize: 13,
    color: "#1254EC",
    fontFamily: "Inter_500Medium",
  },
  cta: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#1254EC",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  ctaLoading: { opacity: 0.75 },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});

// ─── Auth Screen ───────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"login" | "signup">("login");

  const handleSuccess = useCallback(() => {
    router.replace("/(tabs)");
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.root}
    >
      <StatusBar style="light" />

      {/* ── Header banner ── */}
      <LinearGradient
        colors={["#0C38C0", "#1254EC", "#0E48D8"]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        {/* Top-right arc */}
        <View style={styles.headerArc} />

        <View style={styles.headerContent}>
          <MiniLogo size={42} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.brandName}>PayVora</Text>
            <Text style={styles.brandTag}>PAY SMART. GROW MORE.</Text>
          </View>
        </View>

        <Text style={styles.headerHook}>
          {tab === "login"
            ? "Welcome back 👋"
            : "Join thousands of smart users"}
        </Text>
      </LinearGradient>

      {/* ── Form card ── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <TabToggle active={tab} onChange={setTab} />

          {tab === "login" ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <SignUpForm onSuccess={handleSuccess} />
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
              <View style={styles.googleIconWrap}>
                <GoogleLogo size={18} />
              </View>
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom switch */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {tab === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity
              onPress={() => {
                hapticLight();
                setTab(tab === "login" ? "signup" : "login");
              }}
            >
              <Text style={styles.switchLink}>
                {tab === "login" ? "Sign Up" : "Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0F4FF" },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    overflow: "hidden",
  },
  headerArc: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  brandTag: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.72)",
    letterSpacing: 1.8,
    marginTop: 1,
  },
  headerHook: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    lineHeight: 32,
  },

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#1254EC",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  dividerText: {
    fontSize: 12,
    color: "#94A3B8",
    fontFamily: "Inter_400Regular",
  },

  socialRow: { flexDirection: "row", marginBottom: 18 },
  googleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADCE0",
    borderRadius: 4,
    height: 40,
    paddingHorizontal: 12,
    gap: 10,
  },
  googleIconWrap: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  googleBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#3C4043",
    letterSpacing: 0.25,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "Inter_400Regular",
  },
  switchLink: {
    fontSize: 14,
    color: "#1254EC",
    fontFamily: "Inter_600SemiBold",
  },
});
