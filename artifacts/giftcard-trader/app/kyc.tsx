import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { hapticLight, hapticSuccess, hapticError } from "@/utils/haptics";
import { useKyc } from "@/contexts/KycContext";

const STEPS = ["Personal Info", "ID Document", "Selfie"];

const PERKS = [
  { icon: "trending-up", label: "Higher Trade Limits",    sub: "Up to $50,000/day" },
  { icon: "shield",      label: "Full Account Access",    sub: "All features unlocked" },
  { icon: "zap",         label: "Priority Support",        sub: "Dedicated agent 24/7" },
  { icon: "award",       label: "Verified Badge",          sub: "Trusted trader status" },
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
  user:          "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
};

function Icon({ name, color = "#8E8E93", size = 18 }: { name: string; color?: string; size?: number }) {
  const d = ICON_PATHS[name] || "";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={d} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function KycScreen() {
  const insets = useSafeAreaInsets();
  const { kycStatus, runFullVerification } = useKyc() as any;

  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");

  const handleNext = useCallback(() => {
    if (step === 0) {
      if (!firstName.trim() || !lastName.trim() || !dob.trim() || !address.trim()) {
        hapticError();
        Alert.alert("Incomplete", "Please fill in all personal information fields.");
        return;
      }
    }
    hapticLight();
    setStep((s) => s + 1);
  }, [step, firstName, lastName, dob, address]);

  const handleSubmit = useCallback(async () => {
    hapticLight();
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setProcessing(false);
    if (typeof runFullVerification === "function") {
      runFullVerification();
    }
    hapticSuccess();
  }, [runFullVerification]);

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

  if (kycStatus === "pending") {
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
          <View style={s.pendingIcon}>
            <Icon name="shield" color="#FF9F0A" size={40} />
          </View>
          <Text style={s.pendingTitle}>Under Review</Text>
          <Text style={s.pendingSub}>Your identity verification is being reviewed. This usually takes 1–2 business days.</Text>
          <View style={s.pendingBadge}>
            <View style={s.pendingDot} />
            <Text style={s.pendingBadgeTxt}>Pending Review</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.cancelBtn}>
            <Text style={s.cancelBtnTxt}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => step > 0 ? setStep(s => s - 1) : router.back()}
          activeOpacity={0.8}
          style={s.backBtn}
        >
          <Icon name="arrow-left" color="#1C1C1E" size={18} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
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

        {/* Step 0: Personal Info */}
        {step === 0 && (
          <View style={s.section}>
            <Text style={s.stepTitle}>Personal Information</Text>
            <Text style={s.stepSub}>Enter your legal name and address as shown on your ID.</Text>
            <View style={s.card}>
              {[
                { label: "First Name",    value: firstName,  onChange: setFirstName,  placeholder: "John" },
                { label: "Last Name",     value: lastName,   onChange: setLastName,   placeholder: "Doe" },
                { label: "Date of Birth", value: dob,        onChange: setDob,        placeholder: "MM/DD/YYYY" },
                { label: "Home Address",  value: address,    onChange: setAddress,    placeholder: "123 Main St, City, Country" },
              ].map((f, i, arr) => (
                <View key={f.label} style={[s.fieldGroup, i < arr.length - 1 && s.fieldGroupBorder]}>
                  <Text style={s.fieldLabel}>{f.label}</Text>
                  <TextInput
                    value={f.value}
                    onChangeText={f.onChange}
                    placeholder={f.placeholder}
                    placeholderTextColor="#8E8E93"
                    style={s.fieldInput}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Step 1: ID Document */}
        {step === 1 && (
          <View style={s.section}>
            <Text style={s.stepTitle}>ID Document</Text>
            <Text style={s.stepSub}>Upload a clear photo of your government-issued ID (passport, driver's license, or national ID).</Text>
            <TouchableOpacity activeOpacity={0.8} style={s.uploadArea}>
              <View style={s.uploadIcon}>
                <Icon name="upload" color="#1A5AFF" size={28} />
              </View>
              <Text style={s.uploadTitle}>Upload Document</Text>
              <Text style={s.uploadSub}>JPG, PNG or PDF · Max 5MB</Text>
            </TouchableOpacity>
            <View style={s.infoBox}>
              <Icon name="shield" color="#1A5AFF" size={15} />
              <Text style={s.infoBoxTxt}>Your documents are encrypted and processed securely. We comply with global data protection standards.</Text>
            </View>
          </View>
        )}

        {/* Step 2: Selfie */}
        {step === 2 && (
          <View style={s.section}>
            <Text style={s.stepTitle}>Take a Selfie</Text>
            <Text style={s.stepSub}>Take a clear selfie holding your ID next to your face. Make sure both are clearly visible.</Text>
            <TouchableOpacity activeOpacity={0.8} style={s.uploadArea}>
              <View style={s.uploadIcon}>
                <Icon name="camera" color="#1A5AFF" size={28} />
              </View>
              <Text style={s.uploadTitle}>Open Camera</Text>
              <Text style={s.uploadSub}>Take a live selfie with your ID</Text>
            </TouchableOpacity>
            <View style={[s.infoBox, { marginTop: 12 }]}>
              <Text style={s.infoBoxHeader}>Tips for a good photo:</Text>
              {["Face fully visible, no sunglasses", "Good lighting, no shadows", "ID text clearly readable"].map((t) => (
                <View key={t} style={s.tipRow}>
                  <View style={s.tipDot} />
                  <Text style={s.tipTxt}>{t}</Text>
                </View>
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
  fieldGroup: { paddingHorizontal: 16, paddingVertical: 14 },
  fieldGroupBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#8E8E93", marginBottom: 6 },
  fieldInput: { fontSize: 16, fontFamily: "Inter_400Regular", color: "#1C1C1E" },

  uploadArea: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 32, alignItems: "center",
    borderWidth: 2, borderColor: "#1A5AFF18", borderStyle: "dashed",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  uploadIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#EEF3FF", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  uploadTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 4 },
  uploadSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8E8E93" },

  infoBox: { backgroundColor: "#EEF3FF", borderRadius: 14, padding: 14, marginTop: 16, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoBoxTxt: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#1A5AFF", lineHeight: 18 },
  infoBoxHeader: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 8 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  tipDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#1A5AFF" },
  tipTxt: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#1C1C1E" },

  ctaSection: { paddingHorizontal: 16, paddingTop: 24 },
  nextBtn: { backgroundColor: "#1A5AFF", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 12 },
  nextBtnTxt: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  disclaimer: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93", textAlign: "center", lineHeight: 18 },

  // Verified state
  verifiedScroll: { alignItems: "center", padding: 24, paddingBottom: 48 },
  verifiedBadge: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", marginBottom: 20, shadowColor: "#30D158", shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  verifiedTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#1C1C1E", marginBottom: 8, letterSpacing: -0.3 },
  verifiedSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#8E8E93", textAlign: "center", lineHeight: 22, marginBottom: 24, paddingHorizontal: 10 },
  perksCard: { width: "100%", backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3, marginBottom: 24 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  perkRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  perkIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  perkInfo: { flex: 1 },
  perkLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1C1C1E", marginBottom: 2 },
  perkSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  doneBtn: { width: "100%", backgroundColor: "#1A5AFF", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  doneBtnTxt: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },

  // Pending state
  pendingContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  pendingIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#FFF9EC", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  pendingTitle: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#1C1C1E", marginBottom: 8, letterSpacing: -0.3 },
  pendingSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#8E8E93", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  pendingBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFF9EC", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 32 },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF9F0A" },
  pendingBadgeTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FF9F0A" },
  cancelBtn: { backgroundColor: "#F2F2F7", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, alignItems: "center" },
  cancelBtnTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#1C1C1E" },
});
