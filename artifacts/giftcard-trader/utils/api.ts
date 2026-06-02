const raw = process.env.EXPO_PUBLIC_API_URL ?? "";
export const API_BASE = raw.replace(/\/$/, "");
export const apiUrl = (path: string) => `${API_BASE}${path}`;
