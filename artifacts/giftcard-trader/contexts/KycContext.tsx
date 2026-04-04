import React, { createContext, useContext, useState, useCallback } from "react";

export type KycStatus = "not_verified" | "pending" | "verified" | "rejected";

export interface KycData {
  kycStatus: KycStatus;
  fullName: string;
  email: string;
  dob: string;
  address: string;
  idType: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReasons?: string[];
}

export interface KycValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface KycContextType {
  kycStatus: KycStatus;
  kycData: KycData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  submitKyc: (data: { fullName: string; dob: string; address: string; idType?: string }) => Promise<void>;
  setStatus: (status: KycStatus, reasons?: string[]) => void;
  validatePersonalInfo: (fullName: string, dob: string, address: string) => KycValidationResult;
  validateDocument: (side: "front" | "back", uploaded: boolean) => KycValidationResult;
  validateSelfie: (uploaded: boolean) => KycValidationResult;
  runFullVerification: (data: {
    fullName: string; dob: string; address: string; idType: string;
    frontUploaded: boolean; backUploaded: boolean; selfieUploaded: boolean;
  }) => Promise<{ verified: boolean; errors: string[] }>;
}

const KycContext = createContext<KycContextType>({} as KycContextType);

function parseDate(dateStr: string): Date | null {
  const cleaned = dateStr.replace(/[/\-.\s]+/g, "/");
  const parts = cleaned.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) return null;
  const date = new Date(y, m - 1, d);
  if (date.getDate() !== d || date.getMonth() !== m - 1) return null;
  return date;
}

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function KycProvider({ children }: { children: React.ReactNode }) {
  const [kycData, setKycData] = useState<KycData | null>({
    kycStatus: "not_verified",
    fullName: "",
    email: "alex.johnson@email.com",
    dob: "",
    address: "",
    idType: "passport",
    submittedAt: null,
    reviewedAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {}, []);

  const setStatus = useCallback((status: KycStatus, reasons?: string[]) => {
    setKycData((prev) => prev ? { ...prev, kycStatus: status, rejectionReasons: reasons, reviewedAt: new Date().toISOString() } : prev);
  }, []);

  const validatePersonalInfo = useCallback((fullName: string, dob: string, address: string): KycValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errors.push("Full name is required");
    } else if (trimmedName.split(/\s+/).length < 2) {
      errors.push("Please enter your first and last name");
    } else if (trimmedName.length < 3) {
      errors.push("Name is too short");
    } else if (/\d/.test(trimmedName)) {
      errors.push("Name should not contain numbers");
    }

    const trimmedDob = dob.trim();
    if (!trimmedDob) {
      errors.push("Date of birth is required");
    } else {
      const parsed = parseDate(trimmedDob);
      if (!parsed) {
        errors.push("Invalid date format. Use DD/MM/YYYY");
      } else {
        const age = calculateAge(parsed);
        if (age < 18) errors.push("You must be at least 18 years old");
        else if (age > 120) errors.push("Please enter a valid date of birth");
        if (age >= 18 && age < 21) warnings.push("Some features may be restricted for users under 21");
      }
    }

    const trimmedAddr = address.trim();
    if (!trimmedAddr) {
      errors.push("Residential address is required");
    } else if (trimmedAddr.length < 10) {
      errors.push("Please enter a complete address (at least 10 characters)");
    } else if (!/\d/.test(trimmedAddr)) {
      warnings.push("Address typically includes a house/building number");
    }

    return { valid: errors.length === 0, errors, warnings };
  }, []);

  const validateDocument = useCallback((side: "front" | "back", uploaded: boolean): KycValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!uploaded) {
      errors.push(`${side === "front" ? "Front" : "Back"} side of ID is required`);
    }
    return { valid: errors.length === 0, errors, warnings };
  }, []);

  const validateSelfie = useCallback((uploaded: boolean): KycValidationResult => {
    const errors: string[] = [];
    if (!uploaded) errors.push("Selfie photo is required");
    return { valid: errors.length === 0, errors, warnings: [] };
  }, []);

  const runFullVerification = useCallback(async (data: {
    fullName: string; dob: string; address: string; idType: string;
    frontUploaded: boolean; backUploaded: boolean; selfieUploaded: boolean;
  }): Promise<{ verified: boolean; errors: string[] }> => {
    const allErrors: string[] = [];

    const personalResult = validatePersonalInfo(data.fullName, data.dob, data.address);
    allErrors.push(...personalResult.errors);

    const frontResult = validateDocument("front", data.frontUploaded);
    allErrors.push(...frontResult.errors);
    const backResult = validateDocument("back", data.backUploaded);
    allErrors.push(...backResult.errors);

    const selfieResult = validateSelfie(data.selfieUploaded);
    allErrors.push(...selfieResult.errors);

    if (allErrors.length > 0) {
      setStatus("rejected", allErrors);
      return { verified: false, errors: allErrors };
    }

    setKycData((prev) => prev ? {
      ...prev,
      kycStatus: "verified",
      fullName: data.fullName.trim(),
      dob: data.dob.trim(),
      address: data.address.trim(),
      idType: data.idType,
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      rejectionReasons: undefined,
    } : prev);

    return { verified: true, errors: [] };
  }, [validatePersonalInfo, validateDocument, validateSelfie, setStatus]);

  const submitKyc = useCallback(async (data: { fullName: string; dob: string; address: string; idType?: string }) => {
    setLoading(true);
    try {
      setKycData((prev) => prev ? {
        ...prev,
        kycStatus: "pending",
        fullName: data.fullName,
        dob: data.dob,
        address: data.address,
        idType: data.idType || "passport",
        submittedAt: new Date().toISOString(),
      } : prev);
    } finally {
      setLoading(false);
    }
  }, []);

  const kycStatus = kycData?.kycStatus ?? "not_verified";

  return (
    <KycContext.Provider value={{
      kycStatus, kycData, loading, error, refresh, submitKyc, setStatus,
      validatePersonalInfo, validateDocument, validateSelfie, runFullVerification,
    }}>
      {children}
    </KycContext.Provider>
  );
}

export function useKyc() {
  return useContext(KycContext);
}
