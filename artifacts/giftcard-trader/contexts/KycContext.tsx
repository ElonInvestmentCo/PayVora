import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export type KycStatus = "not_verified" | "pending" | "verified" | "rejected";

interface KycData {
  kycStatus: KycStatus;
  fullName: string;
  email: string;
  dob: string;
  address: string;
  idType: string;
  submittedAt: string | null;
  reviewedAt: string | null;
}

interface KycContextType {
  kycStatus: KycStatus;
  kycData: KycData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  submitKyc: (data: { fullName: string; dob: string; address: string; idType?: string }) => Promise<void>;
}

const KycContext = createContext<KycContextType>({
  kycStatus: "not_verified",
  kycData: null,
  loading: true,
  error: null,
  refresh: async () => {},
  submitKyc: async () => {},
});

export function KycProvider({ children }: { children: React.ReactNode }) {
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await apiFetch<KycData>("/kyc/status");
      setKycData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load KYC status");
      setKycData({
        kycStatus: "not_verified",
        fullName: "",
        email: "",
        dob: "",
        address: "",
        idType: "passport",
        submittedAt: null,
        reviewedAt: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitKyc = useCallback(async (data: { fullName: string; dob: string; address: string; idType?: string }) => {
    const result = await apiFetch<KycData>("/kyc/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setKycData(result);
  }, []);

  const kycStatus = kycData?.kycStatus ?? "not_verified";

  return (
    <KycContext.Provider value={{ kycStatus, kycData, loading, error, refresh, submitKyc }}>
      {children}
    </KycContext.Provider>
  );
}

export function useKyc() {
  return useContext(KycContext);
}
