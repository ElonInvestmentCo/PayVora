import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { GlowButton } from "@/components/GlowButton";
import { useKyc, type KycStatus } from "@/contexts/KycContext";

type IdType = "passport" | "drivers_license" | "national_id";

const STATUS_MAP: Record<KycStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  not_verified: { label: "Not Verified",  color: "#EF4444", bg: "rgba(239,68,68,0.12)",  border: "#EF444430", icon: "x-circle" },
  pending:      { label: "Pending Review", color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "#F59E0B30", icon: "clock" },
  verified:     { label: "Verified",       color: "#00FF88", bg: "rgba(0,255,136,0.12)",  border: "#00FF8830", icon: "check-circle" },
  rejected:     { label: "Rejected",       color: "#EF4444", bg: "rgba(239,68,68,0.12)",  border: "#EF444430", icon: "alert-circle" },
};

const ID_TYPES: { id: IdType; label: string; icon: string }[] = [
  { id: "passport",        label: "Passport",         icon: "book" },
  { id: "drivers_license",  label: "Driver's License", icon: "credit-card" },
  { id: "national_id",      label: "National ID",      icon: "shield" },
];

const TIPS = [
  "Ensure your ID photo is clear and all text is readable",
  "Your selfie must match the photo on your ID document",
  "Use a well-lit environment for clearer uploads",
  "Documents must not be expired",
];

export default function KycScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const { kycStatus, kycData, loading, submitKyc, refresh } = useKyc();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const [step, setStep] = useState(0);
  const [confirmModal, setConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");

  const [idType, setIdType] = useState<IdType>("passport");

  React.useEffect(() => {
    if (kycData) {
      if (kycData.fullName) setFullName(kycData.fullName);
      if (kycData.dob) setDob(kycData.dob);
      if (kycData.address) setAddress(kycData.address);
      if (kycData.idType) setIdType(kycData.idType as IdType);
    }
  }, [kycData]);
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);

  const [selfieUploaded, setSelfieUploaded] = useState(false);

  const step1Valid = fullName.trim().length >= 2 && dob.trim().length >= 4 && address.trim().length >= 5;
  const step2Valid = frontUploaded && backUploaded;
  const step3Valid = selfieUploaded;

  const canProceed = step === 0 ? step1Valid : step === 1 ? step2Valid : step3Valid;

  const handleNext = useCallback(() => {
    if (step < 2) setStep(step + 1);
    else setConfirmModal(true);
  }, [step]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      await submitKyc({ fullName, dob, address, idType });
      setConfirmModal(false);
    } catch {
    } finally {
      setSubmitting(false);
    }
  }, [fullName, dob, address, idType, submitKyc]);

  const showForm = kycStatus === "not_verified" || kycStatus === "rejected";
  const stCfg = STATUS_MAP[kycStatus];

  const STEPS = [
    { label: "Personal Info", icon: "user" },
    { label: "ID Document",   icon: "file-text" },
    { label: "Selfie",        icon: "camera" },
  ];

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>KYC Verification</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="help-circle" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 100 }]} keyboardShouldPersistTaps="handled">

        <View style={[styles.statusBanner, { backgroundColor: stCfg.bg, borderColor: stCfg.border }]}>
          <View style={[styles.statusIconWrap, { backgroundColor: `${stCfg.color}20` }]}>
            <Feather name={stCfg.icon as any} size={20} color={stCfg.color} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { color: stCfg.color }]}>{stCfg.label}</Text>
            <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>
              {kycStatus === "not_verified" ? "Complete verification to unlock all features" :
               kycStatus === "pending" ? "Your documents are being reviewed" :
               kycStatus === "rejected" ? "Your verification was declined. Please resubmit." :
               "Your identity has been verified"}
            </Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          {STEPS.map((s, i) => {
            const done = i < step || kycStatus === "verified";
            const active = i === step && showForm;
            const lineColor = done ? "#00FF88" : colors.border;
            return (
              <React.Fragment key={i}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, {
                    backgroundColor: done ? "rgba(0,255,136,0.15)" : active ? "rgba(0,229,255,0.15)" : colors.card,
                    borderColor: done ? "#00FF88" : active ? colors.primary : colors.border,
                  }]}>
                    {done ? (
                      <Feather name="check" size={14} color="#00FF88" />
                    ) : (
                      <Text style={[styles.stepNum, { color: active ? colors.primary : colors.mutedForeground }]}>{i + 1}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, { color: done ? "#00FF88" : active ? colors.primary : colors.mutedForeground }]}>{s.label}</Text>
                </View>
                {i < 2 && <View style={[styles.stepLine, { backgroundColor: lineColor }]} />}
              </React.Fragment>
            );
          })}
        </View>

        {!showForm ? (
          <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.bigStatusIcon, { backgroundColor: `${stCfg.color}15` }]}>
                <Feather name={stCfg.icon as any} size={36} color={stCfg.color} />
              </View>
              <Text style={[styles.bigStatusTitle, { color: colors.foreground }]}>
                {kycStatus === "pending" ? "Verification In Progress" : "Verification Complete"}
              </Text>
              <Text style={[styles.bigStatusSub, { color: colors.mutedForeground }]}>
                {kycStatus === "pending"
                  ? "We're reviewing your documents. This usually takes 1-3 business days."
                  : "You now have full access to all trading features and higher limits."}
              </Text>
              {kycStatus === "verified" && (
                <View style={styles.verifiedPerks}>
                  {["Unlimited trading", "Higher withdrawal limits", "Full feature access", "Priority support"].map((perk) => (
                    <View key={perk} style={styles.perkRow}>
                      <Feather name="check-circle" size={14} color="#00FF88" />
                      <Text style={[styles.perkText, { color: colors.foreground }]}>{perk}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            {step === 0 && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <Feather name="user" size={18} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>Personal Information</Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Full Name</Text>
                  <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: fullName ? colors.primary : colors.border }]}>
                    <Feather name="user" size={16} color={colors.mutedForeground} />
                    <TextInput
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Enter your full legal name"
                      placeholderTextColor={colors.mutedForeground}
                      style={[styles.textInput, { color: colors.foreground }]}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Date of Birth</Text>
                  <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: dob ? colors.primary : colors.border }]}>
                    <Feather name="calendar" size={16} color={colors.mutedForeground} />
                    <TextInput
                      value={dob}
                      onChangeText={setDob}
                      placeholder="DD / MM / YYYY"
                      placeholderTextColor={colors.mutedForeground}
                      style={[styles.textInput, { color: colors.foreground }]}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Residential Address</Text>
                  <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: address ? colors.primary : colors.border, height: 80, alignItems: "flex-start", paddingTop: 14 }]}>
                    <Feather name="map-pin" size={16} color={colors.mutedForeground} style={{ marginTop: 2 }} />
                    <TextInput
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Enter your full address"
                      placeholderTextColor={colors.mutedForeground}
                      multiline
                      style={[styles.textInput, { color: colors.foreground, textAlignVertical: "top" }]}
                    />
                  </View>
                </View>
              </View>
            )}

            {step === 1 && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <Feather name="file-text" size={18} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>ID Verification</Text>
                </View>

                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginBottom: 10 }]}>Select ID Type</Text>
                <View style={styles.idTypeRow}>
                  {ID_TYPES.map((t) => {
                    const active = t.id === idType;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => setIdType(t.id)}
                        activeOpacity={0.8}
                        style={[styles.idTypeBtn, { backgroundColor: active ? "rgba(0,229,255,0.1)" : colors.background, borderColor: active ? colors.primary : colors.border }]}
                      >
                        <Feather name={t.icon as any} size={18} color={active ? colors.primary : colors.mutedForeground} />
                        <Text style={[styles.idTypeLabel, { color: active ? colors.primary : colors.mutedForeground }]}>{t.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 20, marginBottom: 10 }]}>Upload Documents</Text>

                <TouchableOpacity
                  onPress={() => setFrontUploaded(true)}
                  activeOpacity={0.8}
                  style={[styles.uploadCard, {
                    backgroundColor: frontUploaded ? "rgba(0,255,136,0.06)" : colors.background,
                    borderColor: frontUploaded ? "#00FF8830" : colors.border,
                  }]}
                >
                  {frontUploaded ? (
                    <View style={styles.uploadedContent}>
                      <View style={[styles.uploadedIcon, { backgroundColor: "rgba(0,255,136,0.15)" }]}>
                        <Feather name="check-circle" size={22} color="#00FF88" />
                      </View>
                      <View>
                        <Text style={[styles.uploadedTitle, { color: "#00FF88" }]}>Front Side Uploaded</Text>
                        <Text style={[styles.uploadedSub, { color: colors.mutedForeground }]}>ID_front.jpg · 2.4 MB</Text>
                      </View>
                      <TouchableOpacity onPress={() => setFrontUploaded(false)} activeOpacity={0.8} style={{ marginLeft: "auto" }}>
                        <Feather name="trash-2" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <View style={[styles.uploadIconCircle, { backgroundColor: "rgba(0,229,255,0.1)" }]}>
                        <Feather name="upload" size={22} color={colors.primary} />
                      </View>
                      <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Front of ID</Text>
                      <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>Tap to upload · JPG, PNG (max 10 MB)</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setBackUploaded(true)}
                  activeOpacity={0.8}
                  style={[styles.uploadCard, {
                    backgroundColor: backUploaded ? "rgba(0,255,136,0.06)" : colors.background,
                    borderColor: backUploaded ? "#00FF8830" : colors.border,
                    marginTop: 10,
                  }]}
                >
                  {backUploaded ? (
                    <View style={styles.uploadedContent}>
                      <View style={[styles.uploadedIcon, { backgroundColor: "rgba(0,255,136,0.15)" }]}>
                        <Feather name="check-circle" size={22} color="#00FF88" />
                      </View>
                      <View>
                        <Text style={[styles.uploadedTitle, { color: "#00FF88" }]}>Back Side Uploaded</Text>
                        <Text style={[styles.uploadedSub, { color: colors.mutedForeground }]}>ID_back.jpg · 1.8 MB</Text>
                      </View>
                      <TouchableOpacity onPress={() => setBackUploaded(false)} activeOpacity={0.8} style={{ marginLeft: "auto" }}>
                        <Feather name="trash-2" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <View style={[styles.uploadIconCircle, { backgroundColor: "rgba(0,229,255,0.1)" }]}>
                        <Feather name="upload" size={22} color={colors.primary} />
                      </View>
                      <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Back of ID</Text>
                      <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>Tap to upload · JPG, PNG (max 10 MB)</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <Feather name="camera" size={18} color={colors.primary} />
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>Selfie Verification</Text>
                </View>

                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginBottom: 10 }]}>
                  Take a clear selfie holding your ID next to your face
                </Text>

                <TouchableOpacity
                  onPress={() => setSelfieUploaded(true)}
                  activeOpacity={0.8}
                  style={[styles.selfieCard, {
                    backgroundColor: selfieUploaded ? "rgba(0,255,136,0.06)" : colors.background,
                    borderColor: selfieUploaded ? "#00FF8830" : colors.border,
                  }]}
                >
                  {selfieUploaded ? (
                    <View style={styles.uploadedContent}>
                      <View style={[styles.uploadedIcon, { backgroundColor: "rgba(0,255,136,0.15)" }]}>
                        <Feather name="check-circle" size={28} color="#00FF88" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.uploadedTitle, { color: "#00FF88" }]}>Selfie Captured</Text>
                        <Text style={[styles.uploadedSub, { color: colors.mutedForeground }]}>selfie.jpg · 3.1 MB</Text>
                      </View>
                      <TouchableOpacity onPress={() => setSelfieUploaded(false)} activeOpacity={0.8}>
                        <Feather name="trash-2" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.selfiePlaceholder}>
                      <View style={[styles.selfieIconCircle, { backgroundColor: "rgba(0,229,255,0.08)" }]}>
                        <Feather name="camera" size={32} color={colors.primary} />
                      </View>
                      <Text style={[styles.uploadTitle, { color: colors.foreground }]}>Take or Upload Selfie</Text>
                      <Text style={[styles.uploadSub, { color: colors.mutedForeground }]}>Hold your ID next to your face</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={[styles.selfieGuide, { backgroundColor: "rgba(0,229,255,0.06)", borderColor: "rgba(0,229,255,0.15)" }]}>
                  <Feather name="info" size={16} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.guideTitle, { color: colors.primary }]}>Selfie Guidelines</Text>
                    <Text style={[styles.guideSub, { color: colors.mutedForeground }]}>Face the camera directly. Make sure your face and the ID photo are clearly visible. Remove sunglasses or hats.</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Feather name="info" size={18} color="#F59E0B" />
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Helpful Tips</Text>
              </View>
              {TIPS.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip}</Text>
                </View>
              ))}
            </View>

            <View style={styles.navBtns}>
              {step > 0 && (
                <TouchableOpacity onPress={() => setStep(step - 1)} activeOpacity={0.8} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name="arrow-left" size={16} color={colors.foreground} />
                  <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }}>
                <GlowButton
                  title={step < 2 ? "Next Step" : "Submit Verification"}
                  onPress={handleNext}
                  disabled={!canProceed}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Modal transparent visible={confirmModal} animationType="fade" onRequestClose={() => setConfirmModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setConfirmModal(false)}>
          <Pressable style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Confirm Submission</Text>
              <TouchableOpacity onPress={() => setConfirmModal(false)} activeOpacity={0.8}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={[styles.confirmIcon, { backgroundColor: "rgba(0,229,255,0.08)" }]}>
              <Feather name="shield" size={36} color={colors.primary} />
            </View>

            <Text style={[styles.confirmText, { color: colors.foreground }]}>Ready to submit your verification?</Text>
            <Text style={[styles.confirmSub, { color: colors.mutedForeground }]}>
              Please review your information before submitting. Our team will review your documents within 1-3 business days.
            </Text>

            {[
              { label: "Full Name", value: fullName },
              { label: "Date of Birth", value: dob },
              { label: "ID Type", value: ID_TYPES.find(t => t.id === idType)?.label || "" },
              { label: "Documents", value: "2 files uploaded" },
              { label: "Selfie", value: "Captured" },
            ].map((row) => (
              <View key={row.label} style={[styles.confirmRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.confirmLbl, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[styles.confirmVal, { color: colors.foreground }]}>{row.value}</Text>
              </View>
            ))}

            <GlowButton title="Submit Verification" onPress={handleSubmit} loading={submitting} />

            <TouchableOpacity onPress={() => setConfirmModal(false)} activeOpacity={0.8} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },

  content: { padding: 20, gap: 16 },

  statusBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 14,
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

  card: { borderRadius: 16, padding: 18, borderWidth: 1 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 48,
  },
  textInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },

  idTypeRow: { flexDirection: "row", gap: 8 },
  idTypeBtn: { flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 14, alignItems: "center", gap: 6 },
  idTypeLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },

  uploadCard: { borderRadius: 14, borderWidth: 1, borderStyle: "dashed", overflow: "hidden" },
  uploadPlaceholder: { alignItems: "center", padding: 24, gap: 8 },
  uploadIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  uploadTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  uploadSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  uploadedContent: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  uploadedIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  uploadedTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  uploadedSub: { fontSize: 11, fontFamily: "Inter_400Regular" },

  selfieCard: { borderRadius: 14, borderWidth: 1, borderStyle: "dashed", overflow: "hidden" },
  selfiePlaceholder: { alignItems: "center", padding: 32, gap: 10 },
  selfieIconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  selfieGuide: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 14 },
  guideTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  guideSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 18 },

  tipRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  tipDot: { width: 6, height: 6, borderRadius: 3 },
  tipText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },

  navBtns: { flexDirection: "row", gap: 12, marginTop: 4 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 18, height: 50 },
  backBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  bigStatusIcon: { width: 72, height: 72, borderRadius: 36, alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  bigStatusTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  bigStatusSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8, lineHeight: 20 },
  verifiedPerks: { marginTop: 20, gap: 10 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  perkText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 24 },
  modal: { borderRadius: 20, borderWidth: 1, padding: 24, width: "100%", maxWidth: 400 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  confirmIcon: { width: 64, height: 64, borderRadius: 32, alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  confirmText: { fontSize: 16, fontFamily: "Inter_700Bold", textAlign: "center" },
  confirmSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8, marginBottom: 16, lineHeight: 19 },
  confirmRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  confirmLbl: { fontSize: 13, fontFamily: "Inter_400Regular" },
  confirmVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  cancelBtn: { alignSelf: "center", paddingVertical: 12, marginTop: 8 },
  cancelText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
