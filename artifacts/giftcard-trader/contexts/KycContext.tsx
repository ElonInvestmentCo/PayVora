import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiUrl } from "@/utils/api";

export type KycStatus =
  | "not_verified"
  | "pending"
  | "reviewing"
  | "verified"
  | "rejected"
  | "requires_resubmission";

export interface KycData {
  kycStatus: KycStatus;
  fullName: string;
  email: string;
  dob: string;
  address: string;
  idType: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  reviewerNotes: string | null;
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
  setStatus: (status: KycStatus, rejectionReason?: string) => void;
  validatePersonalInfo: (fullName: string, dob: string, address: string) => KycValidationResult;
  validateDocument: (uploaded: boolean) => KycValidationResult;
  validateSelfie: (uploaded: boolean) => KycValidationResult;
  runFullVerification: (data: {
    fullName: string; dob: string; address: string; idType: string;
    documentUploaded: boolean; selfieUploaded: boolean;
  }) => Promise<{ submitted: boolean; errors: string[] }>;
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
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

const DEFAULT_KYC_DATA: KycData = {
  kycStatus: "not_verified",
  fullName: "",
  email: "customer@payvora.io",
  dob: "",
  address: "",
  idType: "passport",
  submittedAt: null,
  reviewedAt: null,
  rejectionReason: null,
  reviewerNotes: null,
};

export function KycProvider({ children }: { children: React.ReactNode }) {
  const [kycData, setKycData] = useState<KycData | null>(DEFAULT_KYC_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const resp = await fetch(apiUrl("/api/kyc/status"));
      if (resp.ok) {
        const json = (await resp.json()) as KycData;
        setKycData(json);
      }
    } catch {
      // Network failure — keep local state
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setStatus = useCallback((status: KycStatus, rejectionReason?: string) => {
    setKycData((prev) =>
      prev
        ? {
            ...prev,
            kycStatus: status,
            rejectionReason: rejectionReason ?? null,
            reviewedAt: new Date().toISOString(),
          }
        : prev,
    );
  }, []);

  const validatePersonalInfo = useCallback(
    (fullName: string, dob: string, address: string): KycValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const trimmedName = fullName.trim();
      if (!trimmedName) {
        errors.push("Full name is required");
      } else if (trimmedName.split(/\s+/).length < 2) {
        errors.push("Please enter your first and last name");
      } else if (/\d/.test(trimmedName)) {
        errors.push("Name should not contain numbers");
      }

      const trimmedDob = dob.trim();
      if (!trimmedDob) {
        errors.push("Date of birth is required");
      } else {
        const parsed = parseDate(trimmedDob);
        if (!parsed) {
          errors.push("Invalid date. Use DD/MM/YYYY (e.g. 15/03/1990)");
        } else {
          const age = calculateAge(parsed);
          if (age < 18) errors.push("You must be at least 18 years old");
          else if (age > 120) errors.push("Please enter a valid date of birth");
          if (age >= 18 && age < 21)
            warnings.push("Some features may be restricted for users under 21");
        }
      }

      const trimmedAddr = address.trim();
      if (!trimmedAddr) {
        errors.push("Residential address is required");
      } else if (trimmedAddr.length < 10) {
        errors.push("Enter your full address (street, city, country)");
      } else if (!/\d/.test(trimmedAddr)) {
        warnings.push("Address usually includes a building or house number");
      }

      return { valid: errors.length === 0, errors, warnings };
    },
    [],
  );

  const validateDocument = useCallback(
    (uploaded: boolean): KycValidationResult => ({
      valid: uploaded,
      errors: uploaded ? [] : ["Please upload a photo of your ID document"],
      warnings: [],
    }),
    [],
  );

  const validateSelfie = useCallback(
    (uploaded: boolean): KycValidationResult => ({
      valid: uploaded,
      errors: uploaded ? [] : ["Please take a selfie photo"],
      warnings: [],
    }),
    [],
  );

  const submitKyc = useCallback(
    async (data: { fullName: string; dob: string; address: string; idType?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(apiUrl("/api/kyc/submit"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: data.fullName,
            dob: data.dob,
            address: data.address,
            idType: data.idType ?? "passport",
          }),
        });
        const json = (await resp.json()) as KycData & { error?: string };
        if (!resp.ok) throw new Error(json.error ?? "Submission failed");
        setKycData((prev) =>
          prev
            ? {
                ...prev,
                kycStatus: json.kycStatus ?? "pending",
                fullName: json.fullName ?? data.fullName,
                dob: json.dob ?? data.dob,
                address: json.address ?? data.address,
                idType: json.idType ?? data.idType ?? "passport",
                submittedAt: json.submittedAt ?? new Date().toISOString(),
                rejectionReason: null,
                reviewerNotes: null,
              }
            : prev,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Submission failed";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const runFullVerification = useCallback(
    async (data: {
      fullName: string;
      dob: string;
      address: string;
      idType: string;
      documentUploaded: boolean;
      selfieUploaded: boolean;
    }): Promise<{ submitted: boolean; errors: string[] }> => {
      const allErrors: string[] = [];

      const personalResult = validatePersonalInfo(data.fullName, data.dob, data.address);
      allErrors.push(...personalResult.errors);
      if (!data.documentUploaded) allErrors.push("ID document photo is required");
      if (!data.selfieUploaded) allErrors.push("Selfie photo is required");

      if (allErrors.length > 0) return { submitted: false, errors: allErrors };

      try {
        await submitKyc({
          fullName: data.fullName,
          dob: data.dob,
          address: data.address,
          idType: data.idType,
        });
        return { submitted: true, errors: [] };
      } catch (err) {
        return {
          submitted: false,
          errors: [err instanceof Error ? err.message : "Submission failed"],
        };
      }
    },
    [validatePersonalInfo, submitKyc],
  );

  const kycStatus = kycData?.kycStatus ?? "not_verified";

  return (
    <KycContext.Provider
      value={{
        kycStatus,
        kycData,
        loading,
        error,
        refresh,
        submitKyc,
        setStatus,
        validatePersonalInfo,
        validateDocument,
        validateSelfie,
        runFullVerification,
      }}
    >
      {children}
    </KycContext.Provider>
  );
}

export function useKyc() {
  return useContext(KycContext);
}
