import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { hapticLight, hapticSuccess, hapticError } from "@/utils/haptics";
import { useKyc } from "@/contexts/KycContext";

const STEPS = ["Personal Info", "ID Document", "Selfie"];

const PERKS = [
  { icon: "trending-up", label: "Higher Trade Limits",  sub: "Up to $50,000/day" },
  { icon: "shield",      label: "Full Account Access",  sub: "All features unlocked" },
  { icon: "zap",         label: "Priority Support",     sub: "Dedicated agent 24/7" },
  { icon: "award",       label: "Verified Badge",        sub: "Trusted trader status" },
];

const ICON_PATHS: Record<string, string> = {
  "trending-up": "M23 6l-9.5 9.5-5-5L1 18",
  shield:        "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  zap:           "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  award:         "M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  "arrow-left":  "M19 12H5M12 5l-7 7 7 7",
  check:         "M20 6L9 17l-5-5",
  upload:        "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  camera:        "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 13a3 3 0 100-6 3 3 0 000 6z",
  "x-circle":    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM15 9l-6 6M9 9l6 6",
  "alert-circle": "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01",
};

function Icon({ name, color = "#8E8E93", size = 18 }: { name: string; color?: string; size?: number }) {
  const d = ICON_PATHS[name] || "";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Auto-format digits into DD/MM/YYYY as user types */
function formatDob(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function KycScreen() {
  const insets = useSafeAreaInsets();
  const { kycStatus, kycData, runFullVerification } = useKyc();

  const [step, setStep]               = useState(0);
  const [processing, setProcessing]   = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);

  // Step 0 — Personal Info
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [dob, setDob]               = useState("");
  const [address, setAddress]       = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 1 — ID Document
  const [documentUri, setDocumentUri] = useState<string | null>(null);
  const [docError, setDocError]       = useState<string | null>(null);

  // Step 2 — Selfie
  const [selfieUri, setSelfieUri]   = useState<string | null>(null);
  const [selfieError, setSelfieError] = useState<string | null>(null);

  const handleDobChange = useCallback((text: string) => {
    setDob(formatDob(text));
    setFieldErrors((prev) => ({ ...prev, dob: "" }));
  }, []);

  const pickDocument = useCallback(async () => {
    setDocError(null);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library to upload your ID.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      setDocumentUri(result.assets[0].uri);
    }
  }, []);

  const takeSelfie = useCallback(async () => {
    setSelfieError(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow camera access to take your selfie.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelfieUri(result.assets[0].uri);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (step === 0) {
      const errors: Record<string, string> = {};
      if (!firstName.trim()) errors.firstName = "First name is required";
      if (!lastName.trim())  errors.lastName  = "Last name is required";
      if (!dob.trim())       errors.dob       = "Date of birth is required";
      else if (dob.replace(/\D/g, "").length < 8) errors.dob = "Enter full date: DD/MM/YYYY";
      if (!address.trim())   errors.address   = "Home address is required";
      else if (address.trim().length < 10) errors.address = "Enter your full address";

      if (Object.keys(errors).length > 0) {
        hapticError();
        setFieldErrors(errors);
        return;
      }
      setFieldErrors({});
    }
    if (step === 1 && !documentUri) {
      hapticError();
      setDocError("Please upload a photo of your ID document before continuing.");
      return;
    }
    hapticLight();
    setStep((s) => s + 1);
  }, [step, firstName, lastName, dob, address, documentUri]);

  const handleSubmit = useCallback(async () => {
    if (!selfieUri) {
      hapticError();
      setSelfieError("Please take a selfie before submitting.");
      return;
    }

    hapticLight();
    setProcessing(true);
    setSubmitErrors([]);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const result = await runFullVerification({
      fullName,
      dob,
      address,
      idType: "passport",
      documentUploaded: !!documentUri,
      selfieUploaded:   !!selfieUri,
    });

    setProcessing(false);

    if (result.submitted) {
      hapticSuccess();
    } else {
      hapticError();
      setSubmitErrors(result.errors);
    }
  }, [selfieUri, firstName, lastName, dob, address, documentUri, runFullVerification]);

  // ── Verified ─────────────────────────────────────────────────────────────
  if (kycStatus === "verified") {
    return (
      <View style={[s.root, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.backBtn}>
            <Icon name="arrow-left" color="#1C1C1E" size={18} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Verification</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={s.verifiedScroll}>
          <LinearGradient colors={["#30D158", "#20A845"]} style={s.verifiedBadge}>
            <Icon name="check" color="#FFFFFF" size={36} />
          </LinearGradient>
          <Text style={s.verifiedTitle}>Fully Verified</Text>
          <Text style={s.verifiedSub}>Your identity has been confirmed. Enjoy full access to all features.</Text>
          <View style={s.perksCard}>
            {PERKS.map((p, i) => (
              <View key={p.label} style={[s.perkRow, i < PERKS.length - 1 && s.perkRowBorder]}>
                <View style={[s.perkIcon, { backgroundColor: "#30D15818" }]}>
                  <Icon name={p.icon} color="#30D158" size={16} />
                </View>
                <View style={s.perkInfo}>
                  <Text style={s.perkLabel}>{p.label}</Text>
                  <Text style={s.perkSub}>{p.sub}</Text>
                </View>
                <Icon name="check" color="#30D158" size={14} />
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.doneBtn}>
            <Text style={s.doneBtnTxt}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Pending / Reviewing ───────────────────────────────────────────────────
  if (kycStatus === "pending" || kycStatus === "reviewing") {
    const isReviewing = kycStatus === "reviewing";
    return (
      <View style={[s.root, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.backBtn}>
            <Icon name="arrow-left" color="#1C1C1E" size={18} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Verification</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.pendingContainer}>
          <View style={[s.pendingIcon, isReviewing && { backgroundColor: "#EEF3FF" }]}>
            <Icon name="shield" color={isReviewing ? "#1A5AFF" : "#FF9F0A"} size={40} />
          </View>
          <Text style={s.pendingTitle}>{isReviewing ? "Under Active Review" : "Under Review"}</Text>
          <Text style={s.pendingSub}>
            {isReviewing
              ? "Our compliance team is actively reviewing your documents. You'll be notified once complete."
              : "Your identity verification is being reviewed. This usually takes 1–2 business days."}
          </Text>
          <View style={[s.pendingBadge, isReviewing && { backgroundColor: "#EEF3FF" }]}>
            <View style={[s.pendingDot, isReviewing && { backgroundColor: "#1A5AFF" }]} />
            <Text style={[s.pendingBadgeTxt, isReviewing && { color: "#1A5AFF" }]}>
              {isReviewing ? "Reviewing" : "Pending Review"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.cancelBtn}>
            <Text style={s.cancelBtnTxt}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Rejected / Requires Resubmission ─────────────────────────────────────
  if (kycStatus === "rejected" || kycStatus === "requires_resubmission") {
    const needsResub = kycStatus === "requires_resubmission";
    return (
      <View style={[s.root, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.backBtn}>
            <Icon name="arrow-left" color="#1C1C1E" size={18} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Verification</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.pendingContainer}>
          <View style={[s.pendingIcon, { backgroundColor: needsResub ? "#FFF9EC" : "#FFF0EF" }]}>
            <Icon name={needsResub ? "alert-circle" : "x-circle"} color={needsResub ? "#FF9F0A" : "#FF3B30"} size={40} />
          </View>
          <Text style={s.pendingTitle}>{needsResub ? "Resubmission Required" : "Verification Rejected"}</Text>
          <Text style={s.pendingSub}>
            {needsResub
              ? "Some documents need to be resubmitted. Please review the reason below and try again."
              : "Your verification was not approved. Please review the reason below."}
          </Text>
          {kycData?.rejectionReason ? (
            <View style={s.rejectionBox}>
              <Text style={s.rejectionLabel}>Reason:</Text>
              <Text style={s.rejectionText}>{kycData.rejectionReason}</Text>
            </View>
          ) : null}
          {needsResub && (
            <TouchableOpacity
              onPress={() => setStep(0)}
              activeOpacity={0.85}
              style={s.resubmitBtn}
            >
              <LinearGradient colors={["#1A5AFF", "#0C38C0"]} style={s.resubmitGrad}>
                <Text style={s.resubmitTxt}>Resubmit Documents</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.cancelBtn}>
            <Text style={s.cancelBtnTxt}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main flow (not_verified / resubmitting) ───────────────────────────────
  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => (step > 0 ? setStep((p) => p - 1) : router.back())}
          activeOpacity={0.8}
          style={s.backBtn}
        >
          <Icon name="arrow-left" color="#1C1C1E" size={18} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={s.progressRow}>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <View style={s.stepItem}>
              <View style={[s.stepCircle, i <= step ? s.stepCircleActive : {}]}>
                {i < step
                  ? <Icon name="check" color="#fff" size={12} />
                  : <Text style={[s.stepNum, i === step && s.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[s.stepLabel, i === step && s.stepLabelActive]}>{label}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[s.stepLine, i < step && s.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Step 0: Personal Info ─────────────────────────────────────── */}
        {step === 0 && (
          <View style={s.section}>
            <Text style={s.stepTitle}>Personal Information</Text>
            <Text style={s.stepSub}>Enter your legal name and address exactly as shown on your ID.</Text>
            <View style={s.card}>

              {/* First Name */}
              <View style={[s.fieldGroup, s.fieldGroupBorder]}>
                <Text style={s.fieldLabel}>First Name</Text>
                <TextInput
                  value={firstName}
                  onChangeText={(t) => { setFirstName(t); setFieldErrors((p) => ({ ...p, firstName: "" })); }}
                  placeholder="John"
                  placeholderTextColor="#C7C7CC"
                  style={s.fieldInput}
                  autoCapitalize="words"
                />
                {fieldErrors.firstName ? <Text style={s.fieldError}>{fieldErrors.firstName}</Text> : null}
              </View>

              {/* Last Name */}
              <View style={[s.fieldGroup, s.fieldGroupBorder]}>
                <Text style={s.fieldLabel}>Last Name</Text>
                <TextInput
                  value={lastName}
                  onChangeText={(t) => { setLastName(t); setFieldErrors((p) => ({ ...p, lastName: "" })); }}
                  placeholder="Doe"
                  placeholderTextColor="#C7C7CC"
                  style={s.fieldInput}
                  autoCapitalize="words"
                />
                {fieldErrors.lastName ? <Text style={s.fieldError}>{fieldErrors.lastName}</Text> : null}
              </View>

              {/* Date of Birth — auto-formats to DD/MM/YYYY */}
              <View style={[s.fieldGroup, s.fieldGroupBorder]}>
                <Text style={s.fieldLabel}>Date of Birth</Text>
                <TextInput
                  value={dob}
                  onChangeText={handleDobChange}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#C7C7CC"
                  style={s.fieldInput}
                  keyboardType="number-pad"
                  maxLength={10}
                />
                <Text style={s.fieldHint}>Type digits — auto-formatted (e.g. 15031990 → 15/03/1990)</Text>
                {fieldErrors.dob ? <Text style={s.fieldError}>{fieldErrors.dob}</Text> : null}
              </View>

              {/* Home Address */}
              <View style={s.fieldGroup}>
                <Text style={s.fieldLabel}>Home Address</Text>
                <TextInput
                  value={address}
                  onChangeText={(t) => { setAddress(t); setFieldErrors((p) => ({ ...p, address: "" })); }}
                  placeholder="12 Lagos Road, Victoria Island, Lagos, Nigeria"
                  placeholderTextColor="#C7C7CC"
                  style={[s.fieldInput, { minHeight: 44 }]}
                  multiline
                  autoCapitalize="words"
                />
                <Text style={s.fieldHint}>Include street number, city and country</Text>
                {fieldErrors.address ? <Text style={s.fieldError}>{fieldErrors.address}</Text> : null}
              </View>

            </View>
          </View>
        )}

        {/* ── Step 1: ID Document ───────────────────────────────────────── */}
        {step === 1 && (
          <View style={s.section}>
            <Text style={s.stepTitle}>ID Document</Text>
            <Text style={s.stepSub}>Upload a clear photo of your government-issued ID — passport, driver's licence, or national ID card.</Text>

            <TouchableOpacity onPress={pickDocument} activeOpacity={0.8} style={[s.uploadArea, documentUri && s.uploadAreaDone]}>
              {documentUri ? (
                <>
                  <Image source={{ uri: documentUri }} style={s.uploadPreview} resizeMode="cover" />
                  <Text style={s.uploadDoneLabel}>✓ Document uploaded — tap to change</Text>
                </>
              ) : (
                <>
                  <View style={s.uploadIcon}>
                    <Icon name="upload" color="#1A5AFF" size={28} />
                  </View>
                  <Text style={s.uploadTitle}>Upload Document</Text>
                  <Text style={s.uploadSub}>JPG or PNG · Max 10 MB</Text>
                </>
              )}
            </TouchableOpacity>

            {docError ? (
              <View style={s.errorBox}>
                <Icon name="alert-circle" color="#FF3B30" size={15} />
                <Text style={s.errorBoxTxt}>{docError}</Text>
              </View>
            ) : null}

            <View style={s.infoBox}>
              <Icon name="shield" color="#1A5AFF" size={15} />
              <Text style={s.infoBoxTxt}>Your documents are encrypted and processed securely in compliance with global data protection standards.</Text>
            </View>

            <View style={s.tipsCard}>
              <Text style={s.tipsHeader}>Tips for a clear ID photo</Text>
              {["All four corners visible", "Text is sharp and readable", "No glare or shadows", "Colour photo (no black & white)"].map((t) => (
                <View key={t} style={s.tipRow}>
                  <View style={s.tipDot} />
                  <Text style={s.tipTxt}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Step 2: Selfie ────────────────────────────────────────────── */}
        {step === 2 && (
          <View style={s.section}>
            <Text style={s.stepTitle}>Take a Selfie</Text>
            <Text style={s.stepSub}>Take a clear selfie holding your ID beside your face. Both must be clearly visible.</Text>

            <TouchableOpacity onPress={takeSelfie} activeOpacity={0.8} style={[s.uploadArea, selfieUri && s.uploadAreaDone]}>
              {selfieUri ? (
                <>
                  <Image source={{ uri: selfieUri }} style={s.selfiePreview} resizeMode="cover" />
                  <Text style={s.uploadDoneLabel}>✓ Selfie taken — tap to retake</Text>
                </>
              ) : (
                <>
                  <View style={s.uploadIcon}>
                    <Icon name="camera" color="#1A5AFF" size={28} />
                  </View>
                  <Text style={s.uploadTitle}>Open Camera</Text>
                  <Text style={s.uploadSub}>Take a live selfie with your ID</Text>
                </>
              )}
            </TouchableOpacity>

            {selfieError ? (
              <View style={s.errorBox}>
                <Icon name="alert-circle" color="#FF3B30" size={15} />
                <Text style={s.errorBoxTxt}>{selfieError}</Text>
              </View>
            ) : null}

            <View style={s.tipsCard}>
              <Text style={s.tipsHeader}>Tips for a good selfie</Text>
              {["Face fully visible, no sunglasses", "Good lighting — no shadows or backlighting", "Hold your ID next to your face", "Keep both face and ID text in focus"].map((t) => (
                <View key={t} style={s.tipRow}>
                  <View style={s.tipDot} />
                  <Text style={s.tipTxt}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Submit errors */}
        {submitErrors.length > 0 && (
          <View style={[s.errorBox, { marginHorizontal: 16, marginTop: 0 }]}>
            <Icon name="alert-circle" color="#FF3B30" size={15} />
            <View style={{ flex: 1 }}>
              {submitErrors.map((e, i) => (
                <Text key={i} style={s.errorBoxTxt}>{e}</Text>
              ))}
            </View>
          </View>
        )}

        {/* CTA */}
        <View style={s.ctaSection}>
          {step < STEPS.length - 1 ? (
            <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={s.nextBtn}>
              <Text style={s.nextBtnTxt}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={processing}
              style={[s.nextBtn, { opacity: processing ? 0.65 : 1 }]}
            >
              {processing
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.nextBtnTxt}>Submit for Review</Text>
              }
            </TouchableOpacity>
          )}
          <Text style={s.disclaimer}>
            By submitting, you agree to our{" "}
            <Text style={{ color: "#1A5AFF" }}>Privacy Policy</Text>
            {" "}and{" "}
            <Text style={{ color: "#1A5AFF" }}>Terms of Service</Text>.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },

  progressRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 20 },
  stepItem: { alignItems: "center", gap: 4 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#F2F2F7",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#E5E5EA",
  },
  stepCircleActive: { backgroundColor: "#1A5AFF", borderColor: "#1A5AFF" },
  stepNum: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  stepNumActive: { color: "#FFFFFF" },
  stepLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#8E8E93" },
  stepLabelActive: { color: "#1A5AFF", fontFamily: "Inter_600SemiBold" },
  stepLine: { flex: 1, height: 2, backgroundColor: "#E5E5EA", marginBottom: 14, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: "#1A5AFF" },

  scroll: { paddingBottom: 40 },
  section: { paddingHorizontal: 16 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#1C1C1E", marginBottom: 6, letterSpacing: -0.3 },
  stepSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#8E8E93", marginBottom: 20, lineHeight: 20 },

  card: {
    backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  fieldGroup: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
  fieldGroupBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#8E8E93", marginBottom: 4 },
  fieldInput: { fontSize: 16, fontFamily: "Inter_400Regular", color: "#1C1C1E" },
  fieldHint: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#C7C7CC", marginTop: 3 },
  fieldError: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#FF3B30", marginTop: 4 },

  uploadArea: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 28, alignItems: "center",
    borderWidth: 2, borderColor: "#1A5AFF22", borderStyle: "dashed",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  uploadAreaDone: { borderColor: "#30D15844", borderStyle: "solid" },
  uploadIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#EEF3FF", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  uploadTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 4 },
  uploadSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  uploadPreview: { width: "100%", height: 160, borderRadius: 12, marginBottom: 10 },
  selfiePreview: { width: 160, height: 160, borderRadius: 80, marginBottom: 10 },
  uploadDoneLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#30D158" },

  infoBox: { backgroundColor: "#EEF3FF", borderRadius: 14, padding: 14, marginTop: 16, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoBoxTxt: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#1A5AFF", lineHeight: 18 },

  errorBox: { backgroundColor: "#FFF0EF", borderRadius: 12, padding: 12, marginTop: 12, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  errorBoxTxt: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#FF3B30", lineHeight: 18 },

  tipsCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginTop: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  tipsHeader: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 10 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 },
  tipDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#1A5AFF" },
  tipTxt: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#3C3C43" },

  ctaSection: { paddingHorizontal: 16, paddingTop: 24 },
  nextBtn: { backgroundColor: "#1A5AFF", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  nextBtnTxt: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  disclaimer: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93", textAlign: "center", lineHeight: 18 },

  // Verified
  verifiedScroll: { alignItems: "center", padding: 24, paddingBottom: 48 },
  verifiedBadge: {
    width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center",
    marginBottom: 20, shadowColor: "#30D158", shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  verifiedTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#1C1C1E", marginBottom: 8, letterSpacing: -0.3 },
  verifiedSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#8E8E93", textAlign: "center", lineHeight: 22, marginBottom: 24, paddingHorizontal: 10 },
  perksCard: {
    width: "100%", backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3, marginBottom: 24,
  },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  perkRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  perkIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  perkInfo: { flex: 1 },
  perkLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 2 },
  perkSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  doneBtn: { width: "100%", backgroundColor: "#1A5AFF", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  doneBtnTxt: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },

  // Pending / reviewing
  pendingContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  pendingIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#FFF9EC", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  pendingTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#1C1C1E", marginBottom: 8, letterSpacing: -0.3 },
  pendingSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#8E8E93", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  pendingBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFF9EC", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 32 },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF9F0A" },
  pendingBadgeTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FF9F0A" },

  // Rejected
  rejectionBox: { backgroundColor: "#FFF0EF", borderRadius: 12, padding: 14, marginBottom: 20, width: "100%" },
  rejectionLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#FF3B30", marginBottom: 4 },
  rejectionText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#1C1C1E", lineHeight: 20 },
  resubmitBtn: { width: "100%", marginBottom: 12 },
  resubmitGrad: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  resubmitTxt: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },

  cancelBtn: { backgroundColor: "#F2F2F7", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, alignItems: "center" },
  cancelBtnTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
});
