import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useKyc, type KycStatus, type KycValidationResult } from "@/contexts/KycContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { hapticLight, hapticMedium, hapticSuccess, hapticError, hapticSelection } from "@/utils/haptics";

const C = {
  bg: "#FFFFFF",
  surface: "#F7F7F7",
  fg: "#1C1C1E",
  muted: "#8E8E93",
  accent: "#1A5AFF",
  success: "#00C48C",
  error: "#FF3B30",
  border: "#E5E5EA",
  warn: "#FF9500",
};

type IdType = "passport" | "drivers_license" | "national_id";

const STATUS_MAP: Record<KycStatus, { label: string; color: string; bg: string; icon: string }> = {
  not_verified: { label: "Not Verified",  color: C.error,   bg: "#FFF2F0", icon: "x-circle" },
  pending:      { label: "Verifying...",  color: C.warn,    bg: "#FFF8F0", icon: "clock" },
  verified:     { label: "Verified",      color: C.success, bg: "#F0FAF6", icon: "check-circle" },
  rejected:     { label: "Rejected",      color: C.error,   bg: "#FFF2F0", icon: "alert-circle" },
};

const ID_TYPES: { id: IdType; label: string; icon: string }[] = [
  { id: "passport",        label: "Passport",         icon: "book" },
  { id: "drivers_license", label: "Driver's License", icon: "credit-card" },
  { id: "national_id",     label: "National ID",      icon: "shield" },
];

function SolidButton({
  title, onPress, disabled, variant = "black", loading,
}: {
  title: string; onPress: () => void; disabled?: boolean; variant?: "black" | "green" | "red" | "outline"; loading?: boolean;
}) {
  const bgMap = { black: C.fg, green: C.success, red: C.error, outline: C.bg };
  const txtMap = { black: "#FFFFFF", green: "#FFFFFF", red: "#FFFFFF", outline: C.fg };
  const borderMap = { black: C.fg, green: C.success, red: C.error, outline: C.border };
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        solidBtn.base,
        { backgroundColor: bgMap[variant], borderColor: borderMap[variant], borderWidth: variant === "outline" ? 1 : 0 },
        (disabled || loading) && solidBtn.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={txtMap[variant]} size="small" />
      ) : (
        <Text style={[solidBtn.text, { color: txtMap[variant] }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
const solidBtn = StyleSheet.create({
  base: { height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", width: "100%" },
  text: { fontSize: 16, fontFamily: "Inter_700Bold" },
  disabled: { opacity: 0.35 },
});

function ValidationMessage({ result, show }: { result: KycValidationResult | null; show: boolean }) {
  if (!show || !result || (result.errors.length === 0 && result.warnings.length === 0)) return null;
  return (
    <View style={vmStyles.container}>
      {result.errors.map((err, i) => (
        <View key={`e${i}`} style={[vmStyles.row, { backgroundColor: "#FFF2F0", borderColor: "#FFCCC7" }]}>
          <Feather name="alert-circle" size={14} color={C.error} />
          <Text style={[vmStyles.text, { color: C.error }]}>{err}</Text>
        </View>
      ))}
      {result.warnings.map((warn, i) => (
        <View key={`w${i}`} style={[vmStyles.row, { backgroundColor: "#FFF8F0", borderColor: "#FFD591" }]}>
          <Feather name="alert-triangle" size={14} color={C.warn} />
          <Text style={[vmStyles.text, { color: C.warn }]}>{warn}</Text>
        </View>
      ))}
    </View>
  );
}
const vmStyles = StyleSheet.create({
  container: { gap: 6, marginTop: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8, borderWidth: 1 },
  text: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
});

function UploadSimulator({ label, side, onComplete, onRemove, uploaded, analyzing }: {
  label: string; side: string; onComplete: () => void; onRemove: () => void;
  uploaded: boolean; analyzing: boolean;
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handleUpload = useCallback(() => {
    hapticMedium();
    Animated.timing(progressAnim, { toValue: 1, duration: 1800, useNativeDriver: false }).start(() => {
      onComplete();
      hapticSuccess();
    });
  }, [progressAnim, onComplete]);

  const handleRemove = useCallback(() => {
    hapticLight();
    progressAnim.setValue(0);
    onRemove();
  }, [progressAnim, onRemove]);

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  if (uploaded) {
    return (
      <View style={[usStyles.card, { backgroundColor: "#F0FAF6", borderColor: "#B7EDD9" }]}>
        <View style={usStyles.uploadedRow}>
          <View style={[usStyles.checkIcon, { backgroundColor: "#D5F2E6" }]}>
            <Feather name="check-circle" size={22} color={C.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[usStyles.uploadedTitle, { color: C.success }]}>{label} Uploaded</Text>
            <Text style={[usStyles.uploadedSub, { color: C.muted }]}>ID_{side}.jpg · Clear quality detected</Text>
          </View>
          <View style={[usStyles.qualityBadge, { backgroundColor: "#D5F2E6", borderColor: "#B7EDD9" }]}>
            <Feather name="check" size={10} color={C.success} />
            <Text style={[usStyles.qualityText, { color: C.success }]}>Clear</Text>
          </View>
          <TouchableOpacity onPress={handleRemove} activeOpacity={0.8} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="trash-2" size={16} color={C.error} />
          </TouchableOpacity>
        </View>
        <View style={[usStyles.previewBar, { backgroundColor: C.surface }]}>
          <View style={usStyles.previewContent}>
            <Feather name="image" size={14} color={C.muted} />
            <Text style={[usStyles.previewText, { color: C.muted }]}>Image verified · Text readable · No glare</Text>
          </View>
        </View>
      </View>
    );
  }

  if (analyzing) {
    return (
      <View style={[usStyles.card, { backgroundColor: "#F0F5FF", borderColor: "#C7D7FF" }]}>
        <View style={usStyles.analyzingRow}>
          <ActivityIndicator size="small" color={C.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[usStyles.analyzingTitle, { color: C.accent }]}>Analyzing {label}...</Text>
            <Text style={[usStyles.analyzingSub, { color: C.muted }]}>Checking image quality and readability</Text>
          </View>
        </View>
        <View style={[usStyles.progressTrack, { backgroundColor: C.border }]}>
          <Animated.View style={[usStyles.progressFill, { width: progressWidth, backgroundColor: C.accent }]} />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={handleUpload} activeOpacity={0.8} style={[usStyles.card, { backgroundColor: C.surface, borderColor: C.border, borderStyle: "dashed" }]}>
      <View style={usStyles.placeholder}>
        <View style={[usStyles.uploadIcon, { backgroundColor: "#EBF0FF" }]}>
          <Feather name="upload" size={22} color={C.accent} />
        </View>
        <Text style={[usStyles.uploadTitle, { color: C.fg }]}>{label}</Text>
        <Text style={[usStyles.uploadSub, { color: C.muted }]}>Tap to upload · JPG, PNG (max 10 MB)</Text>
      </View>
    </TouchableOpacity>
  );
}
const usStyles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 10 },
  uploadedRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  checkIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  uploadedTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  uploadedSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  qualityBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, marginRight: 8 },
  qualityText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  previewBar: { paddingHorizontal: 14, paddingVertical: 8 },
  previewContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  previewText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  analyzingRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  analyzingTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  analyzingSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  progressTrack: { height: 3, borderRadius: 2, marginHorizontal: 14, marginBottom: 14 },
  progressFill: { height: 3, borderRadius: 2 },
  placeholder: { alignItems: "center", padding: 28, gap: 8 },
  uploadIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  uploadTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  uploadSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
});

export default function KycScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const { kycStatus, kycData, validatePersonalInfo, runFullVerification, setStatus } = useKyc();
  const { addNotification } = useNotifications();

  const [step, setStep] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [verificationErrors, setVerificationErrors] = useState<string[]>([]);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [idType, setIdType] = useState<IdType>("passport");

  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const [frontAnalyzing, setFrontAnalyzing] = useState(false);
  const [backAnalyzing, setBackAnalyzing] = useState(false);

  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [selfieAnalyzing, setSelfieAnalyzing] = useState(false);

  const [personalTouched, setPersonalTouched] = useState(false);
  const [showVerifyResult, setShowVerifyResult] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (kycData) {
      if (kycData.fullName) setFullName(kycData.fullName);
      if (kycData.dob) setDob(kycData.dob);
      if (kycData.address) setAddress(kycData.address);
      if (kycData.idType) setIdType(kycData.idType as IdType);
    }
  }, [kycData]);

  const personalValidation = personalTouched ? validatePersonalInfo(fullName, dob, address) : null;
  const step1Valid = fullName.trim().split(/\s+/).length >= 2 && dob.trim().length >= 8 && address.trim().length >= 10;
  const step2Valid = frontUploaded && backUploaded;
  const step3Valid = selfieUploaded;
  const canProceed = step === 0 ? step1Valid : step === 1 ? step2Valid : step3Valid;

  const animateStep = useCallback((newStep: number) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -40, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    setStep(newStep);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [slideAnim]);

  const handleNext = useCallback(() => {
    hapticMedium();
    if (step === 0) {
      setPersonalTouched(true);
      const result = validatePersonalInfo(fullName, dob, address);
      if (!result.valid) { hapticError(); return; }
    }
    if (step < 2) {
      animateStep(step + 1);
    } else {
      handleVerify();
    }
  }, [step, fullName, dob, address, validatePersonalInfo, animateStep]);

  const handleVerify = useCallback(async () => {
    setVerifying(true);
    setVerificationErrors([]);
    setShowVerifyResult(false);
    hapticMedium();
    await new Promise((r) => setTimeout(r, 800));
    await new Promise((r) => setTimeout(r, 1200));
    const result = await runFullVerification({ fullName, dob, address, idType, frontUploaded, backUploaded, selfieUploaded });
    setVerifying(false);
    setShowVerifyResult(true);
    if (result.verified) {
      hapticSuccess();
      Animated.spring(successScale, { toValue: 1, tension: 50, friction: 3, useNativeDriver: true }).start();
      addNotification({ title: "KYC Verified!", message: "Your identity has been successfully verified. All features are now unlocked.", type: "success", time: "Just now" });
    } else {
      hapticError();
      setVerificationErrors(result.errors);
      addNotification({ title: "KYC Verification Failed", message: result.errors[0] || "Please review and resubmit.", type: "error", time: "Just now" });
    }
  }, [fullName, dob, address, idType, frontUploaded, backUploaded, selfieUploaded, runFullVerification, successScale, addNotification]);

  const handleRetry = useCallback(() => {
    hapticLight();
    setStatus("not_verified");
    setStep(0);
    setShowVerifyResult(false);
    setVerificationErrors([]);
    setPersonalTouched(false);
    successScale.setValue(0);
  }, [setStatus, successScale]);

  const handleFrontComplete = useCallback(() => { setFrontAnalyzing(false); setFrontUploaded(true); }, []);
  const handleFrontRemove = useCallback(() => { setFrontUploaded(false); setFrontAnalyzing(false); }, []);
  const handleBackComplete = useCallback(() => { setBackAnalyzing(false); setBackUploaded(true); }, []);
  const handleBackRemove = useCallback(() => { setBackUploaded(false); setBackAnalyzing(false); }, []);
  const handleSelfieComplete = useCallback(() => { setSelfieAnalyzing(false); setSelfieUploaded(true); }, []);
  const handleSelfieRemove = useCallback(() => { setSelfieUploaded(false); setSelfieAnalyzing(false); }, []);

  const showForm = kycStatus === "not_verified" || kycStatus === "rejected";
  const stCfg = STATUS_MAP[kycStatus];

  const STEPS = [
    { label: "Personal", icon: "user" },
    { label: "ID Doc", icon: "file-text" },
    { label: "Selfie", icon: "camera" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: C.border }]}>
        <TouchableOpacity
          onPress={() => { hapticLight(); router.back(); }}
          style={[styles.iconBtn, { backgroundColor: C.surface }]}
          activeOpacity={0.8}
        >
          <Feather name="arrow-left" size={20} color={C.fg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: C.surface }]} activeOpacity={0.8}>
          <Feather name="help-circle" size={18} color={C.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        <View style={[styles.statusBanner, { backgroundColor: stCfg.bg }]}>
          <View style={[styles.statusIconWrap, { backgroundColor: `${stCfg.color}20` }]}>
            <Feather name={stCfg.icon as any} size={20} color={stCfg.color} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { color: stCfg.color }]}>{stCfg.label}</Text>
            <Text style={[styles.statusSub, { color: C.muted }]}>
              {kycStatus === "not_verified" ? "Complete verification to unlock all features" :
               kycStatus === "pending" ? "Analyzing your documents..." :
               kycStatus === "rejected" ? "Verification failed. Please review and try again." :
               "Your identity has been verified"}
            </Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          {STEPS.map((s, i) => {
            const done = i < step || kycStatus === "verified";
            const active = i === step && showForm;
            return (
              <React.Fragment key={i}>
                <TouchableOpacity
                  onPress={() => { if (done && showForm && i < step) { hapticSelection(); animateStep(i); } }}
                  activeOpacity={done && showForm ? 0.7 : 1}
                  style={styles.stepItem}
                >
                  <View style={[styles.stepCircle, {
                    backgroundColor: done ? C.success : active ? "#EBF0FF" : C.surface,
                    borderColor: done ? C.success : active ? C.accent : C.border,
                  }]}>
                    {done ? (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.stepNum, { color: active ? C.accent : C.muted }]}>{i + 1}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, { color: done ? C.success : active ? C.accent : C.muted }]}>{s.label}</Text>
                </TouchableOpacity>
                {i < 2 && <View style={[styles.stepLine, { backgroundColor: done ? C.success : C.border }]} />}
              </React.Fragment>
            );
          })}
        </View>

        {verifying && (
          <View style={[styles.card, { backgroundColor: C.surface }]}>
            <View style={styles.verifyingContent}>
              <ActivityIndicator size="large" color={C.accent} />
              <Text style={[styles.verifyingTitle, { color: C.fg }]}>Verifying Your Identity</Text>
              <Text style={[styles.verifyingSub, { color: C.muted }]}>
                Analyzing documents, checking consistency, and validating your information...
              </Text>
              <View style={styles.verifySteps}>
                {["Validating personal information", "Analyzing ID document quality", "Verifying face match", "Cross-referencing data"].map((s, i) => (
                  <View key={i} style={styles.verifyStepRow}>
                    <ActivityIndicator size="small" color={C.accent} />
                    <Text style={[styles.verifyStepText, { color: C.muted }]}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {showVerifyResult && kycStatus === "verified" && (
          <Animated.View style={[styles.card, { backgroundColor: C.surface, transform: [{ scale: successScale.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
            <View style={styles.successContent}>
              <View style={[styles.bigSuccessIcon, { backgroundColor: "#D5F2E6" }]}>
                <Feather name="check-circle" size={48} color={C.success} />
              </View>
              <Text style={[styles.successTitle, { color: C.fg }]}>Verification Complete!</Text>
              <Text style={[styles.successSub, { color: C.muted }]}>
                Your identity has been successfully verified. All features and higher limits are now unlocked.
              </Text>
              <View style={styles.verifiedPerks}>
                {["Unlimited trading volume", "Higher withdrawal limits ($50,000/day)", "Full feature access", "Priority support", "Lower trading fees"].map((perk) => (
                  <View key={perk} style={styles.perkRow}>
                    <Feather name="check-circle" size={14} color={C.success} />
                    <Text style={[styles.perkText, { color: C.fg }]}>{perk}</Text>
                  </View>
                ))}
              </View>
              <SolidButton title="Back to Home" onPress={() => { hapticLight(); router.replace("/"); }} variant="black" />
            </View>
          </Animated.View>
        )}

        {showVerifyResult && kycStatus === "rejected" && (
          <View style={[styles.card, { backgroundColor: C.surface }]}>
            <View style={styles.failContent}>
              <View style={[styles.bigFailIcon, { backgroundColor: "#FFE5E5" }]}>
                <Feather name="x-circle" size={48} color={C.error} />
              </View>
              <Text style={[styles.failTitle, { color: C.fg }]}>Verification Failed</Text>
              <Text style={[styles.failSub, { color: C.muted }]}>
                We found issues with your submission. Please review the errors below and try again.
              </Text>
              <View style={styles.errorList}>
                {verificationErrors.map((err, i) => (
                  <View key={i} style={[styles.errorRow, { backgroundColor: "#FFF2F0", borderColor: "#FFCCC7" }]}>
                    <Feather name="alert-circle" size={14} color={C.error} />
                    <Text style={[styles.errorText, { color: C.error }]}>{err}</Text>
                  </View>
                ))}
              </View>
              <SolidButton title="Try Again" onPress={handleRetry} variant="red" />
            </View>
          </View>
        )}

        {!verifying && !showVerifyResult && showForm && (
          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            {step === 0 && (
              <View style={[styles.card, { backgroundColor: C.surface }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconWrap, { backgroundColor: "#EBF0FF" }]}>
                    <Feather name="user" size={18} color={C.accent} />
                  </View>
                  <Text style={[styles.cardTitle, { color: C.fg }]}>Personal Information</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: C.muted }]}>Full Name</Text>
                  <View style={[styles.inputRow, {
                    backgroundColor: C.bg,
                    borderColor: personalTouched && fullName.trim().split(/\s+/).length < 2 ? C.error : fullName ? C.accent : C.border,
                    borderWidth: 1.5,
                  }]}>
                    <Feather name="user" size={16} color={C.muted} />
                    <TextInput
                      value={fullName}
                      onChangeText={(t) => { setFullName(t); if (!personalTouched && t.length > 3) setPersonalTouched(true); }}
                      onBlur={() => setPersonalTouched(true)}
                      placeholder="Enter your full legal name"
                      placeholderTextColor={C.muted}
                      style={[styles.textInput, { color: C.fg }]}
                    />
                    {fullName.trim().split(/\s+/).length >= 2 && (
                      <Feather name="check-circle" size={16} color={C.success} />
                    )}
                  </View>
                  {personalTouched && fullName.trim().split(/\s+/).length < 2 && fullName.length > 0 && (
                    <Text style={styles.fieldError}>Please enter first and last name</Text>
                  )}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: C.muted }]}>Date of Birth</Text>
                  <View style={[styles.inputRow, {
                    backgroundColor: C.bg,
                    borderColor: personalTouched && dob.length > 0 && dob.length < 8 ? C.error : dob.length >= 8 ? C.accent : C.border,
                    borderWidth: 1.5,
                  }]}>
                    <Feather name="calendar" size={16} color={C.muted} />
                    <TextInput
                      value={dob}
                      onChangeText={setDob}
                      onBlur={() => setPersonalTouched(true)}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={C.muted}
                      style={[styles.textInput, { color: C.fg }]}
                      keyboardType="numbers-and-punctuation"
                    />
                    {dob.trim().length >= 8 && (
                      <Feather name="check-circle" size={16} color={C.success} />
                    )}
                  </View>
                  {personalTouched && dob.length > 0 && dob.length < 8 && (
                    <Text style={styles.fieldError}>Use format DD/MM/YYYY</Text>
                  )}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: C.muted }]}>Residential Address</Text>
                  <View style={[styles.inputRow, {
                    backgroundColor: C.bg,
                    borderColor: personalTouched && address.length > 0 && address.length < 10 ? C.error : address.length >= 10 ? C.accent : C.border,
                    borderWidth: 1.5,
                    height: 80, alignItems: "flex-start", paddingTop: 14,
                  }]}>
                    <Feather name="map-pin" size={16} color={C.muted} style={{ marginTop: 2 }} />
                    <TextInput
                      value={address}
                      onChangeText={setAddress}
                      onBlur={() => setPersonalTouched(true)}
                      placeholder="Enter your full address"
                      placeholderTextColor={C.muted}
                      multiline
                      style={[styles.textInput, { color: C.fg, textAlignVertical: "top" }]}
                    />
                    {address.trim().length >= 10 && (
                      <Feather name="check-circle" size={16} color={C.success} style={{ marginTop: 2 }} />
                    )}
                  </View>
                  {personalTouched && address.length > 0 && address.length < 10 && (
                    <Text style={styles.fieldError}>Please enter a complete address (min 10 characters)</Text>
                  )}
                </View>

                <ValidationMessage result={personalValidation} show={personalTouched} />
              </View>
            )}

            {step === 1 && (
              <View style={[styles.card, { backgroundColor: C.surface }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconWrap, { backgroundColor: "#EBF0FF" }]}>
                    <Feather name="file-text" size={18} color={C.accent} />
                  </View>
                  <Text style={[styles.cardTitle, { color: C.fg }]}>ID Verification</Text>
                </View>

                <Text style={[styles.fieldLabel, { color: C.muted, marginBottom: 10 }]}>Select ID Type</Text>
                <View style={styles.idTypeRow}>
                  {ID_TYPES.map((t) => {
                    const active = t.id === idType;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => { hapticSelection(); setIdType(t.id); }}
                        activeOpacity={0.8}
                        style={[styles.idTypeBtn, {
                          backgroundColor: active ? "#EBF0FF" : C.bg,
                          borderColor: active ? C.accent : C.border,
                        }]}
                      >
                        <Feather name={t.icon as any} size={18} color={active ? C.accent : C.muted} />
                        <Text style={[styles.idTypeLabel, { color: active ? C.accent : C.muted }]}>{t.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.fieldLabel, { color: C.muted, marginTop: 20, marginBottom: 10 }]}>Upload Documents</Text>

                <UploadSimulator label="Front of ID" side="front" uploaded={frontUploaded} analyzing={frontAnalyzing} onComplete={handleFrontComplete} onRemove={handleFrontRemove} />
                <UploadSimulator label="Back of ID" side="back" uploaded={backUploaded} analyzing={backAnalyzing} onComplete={handleBackComplete} onRemove={handleBackRemove} />

                {frontUploaded && backUploaded && (
                  <View style={[styles.docSummary, { backgroundColor: "#F0FAF6", borderColor: "#B7EDD9" }]}>
                    <Feather name="check-circle" size={16} color={C.success} />
                    <Text style={[styles.docSummaryText, { color: C.success }]}>Both sides uploaded and verified</Text>
                  </View>
                )}
              </View>
            )}

            {step === 2 && (
              <View style={[styles.card, { backgroundColor: C.surface }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconWrap, { backgroundColor: "#EBF0FF" }]}>
                    <Feather name="camera" size={18} color={C.accent} />
                  </View>
                  <Text style={[styles.cardTitle, { color: C.fg }]}>Selfie Verification</Text>
                </View>

                <Text style={[styles.fieldLabel, { color: C.muted, marginBottom: 10 }]}>
                  Take a clear selfie holding your ID next to your face
                </Text>

                <UploadSimulator label="Selfie Photo" side="selfie" uploaded={selfieUploaded} analyzing={selfieAnalyzing} onComplete={handleSelfieComplete} onRemove={handleSelfieRemove} />

                {selfieUploaded && (
                  <View style={[styles.matchResult, { backgroundColor: "#F0FAF6", borderColor: "#B7EDD9" }]}>
                    <View style={styles.matchRow}>
                      <View style={[styles.matchIcon, { backgroundColor: "#D5F2E6" }]}>
                        <Feather name="user-check" size={16} color={C.success} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.matchTitle, { color: C.success }]}>Face Match: 98.7% Confidence</Text>
                        <Text style={[styles.matchSub, { color: C.muted }]}>Selfie matches ID document photo</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={[styles.selfieGuide, { backgroundColor: "#F0F5FF", borderColor: "#C7D7FF" }]}>
                  <Feather name="info" size={16} color={C.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.guideTitle, { color: C.accent }]}>Selfie Guidelines</Text>
                    <Text style={[styles.guideSub, { color: C.muted }]}>Face the camera directly. Make sure your face and the ID photo are clearly visible. Remove sunglasses or hats.</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.navBtns}>
              {step > 0 && (
                <TouchableOpacity
                  onPress={() => { hapticLight(); animateStep(step - 1); }}
                  activeOpacity={0.8}
                  style={[styles.backBtn, { backgroundColor: C.surface, borderColor: C.border }]}
                >
                  <Feather name="arrow-left" size={16} color={C.fg} />
                  <Text style={[styles.backBtnText, { color: C.fg }]}>Back</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }}>
                <SolidButton
                  title={step < 2 ? "Next Step" : "Verify Now"}
                  onPress={handleNext}
                  disabled={!canProceed}
                  variant={step === 2 ? "green" : "black"}
                />
              </View>
            </View>
          </Animated.View>
        )}

        {!showForm && !showVerifyResult && !verifying && kycStatus === "verified" && (
          <View style={[styles.card, { backgroundColor: C.surface }]}>
            <View style={[styles.bigStatusIcon, { backgroundColor: "#D5F2E6", alignSelf: "center" }]}>
              <Feather name="check-circle" size={36} color={C.success} />
            </View>
            <Text style={[styles.bigStatusTitle, { color: C.fg }]}>Verification Complete</Text>
            <Text style={[styles.bigStatusSub, { color: C.muted }]}>
              You now have full access to all trading features and higher limits.
            </Text>
            <View style={styles.verifiedPerks}>
              {["Unlimited trading", "Higher withdrawal limits", "Full feature access", "Priority support"].map((perk) => (
                <View key={perk} style={styles.perkRow}>
                  <Feather name="check-circle" size={14} color={C.success} />
                  <Text style={[styles.perkText, { color: C.fg }]}>{perk}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, gap: 16 },
  statusBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, padding: 14,
  },
  statusIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statusInfo: { flex: 1, gap: 2 },
  statusLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  statusSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  stepRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginVertical: 4 },
  stepItem: { alignItems: "center", gap: 6 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", borderWidth: 1.5,
  },
  stepNum: { fontSize: 13, fontFamily: "Inter_700Bold" },
  stepLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  stepLine: { width: 36, height: 2, borderRadius: 1, marginBottom: 16 },
  card: { borderRadius: 20, padding: 20 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 },
  cardIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  fieldError: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#FF3B30", marginTop: 4, marginLeft: 2 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 8, paddingHorizontal: 14, height: 48,
  },
  textInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  idTypeRow: { flexDirection: "row", gap: 8 },
  idTypeBtn: { flex: 1, borderRadius: 10, borderWidth: 1.5, paddingVertical: 14, alignItems: "center", gap: 6 },
  idTypeLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  docSummary: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 4 },
  docSummaryText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  matchResult: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  matchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  matchIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  matchTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  matchSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  selfieGuide: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 4 },
  guideTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  guideSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 18 },
  navBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, borderWidth: 1, paddingHorizontal: 18, height: 54 },
  backBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  verifyingContent: { alignItems: "center", padding: 20, gap: 12 },
  verifyingTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 8 },
  verifyingSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  verifySteps: { width: "100%", gap: 10, marginTop: 8 },
  verifyStepRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  verifyStepText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  successContent: { alignItems: "center", padding: 10, gap: 12 },
  bigSuccessIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  failContent: { alignItems: "center", padding: 10, gap: 12 },
  bigFailIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  failTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  failSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  errorList: { width: "100%", gap: 8, marginVertical: 8 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  errorText: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  bigStatusIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  bigStatusTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  bigStatusSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8, lineHeight: 20 },
  verifiedPerks: { marginTop: 16, gap: 10, width: "100%" },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  perkText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
