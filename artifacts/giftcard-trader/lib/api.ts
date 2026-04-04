import { Platform } from "react-native";

function getBaseUrl(): string {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.location) {
      const origin = window.location.origin;
      return `${origin}/proxy-api`;
    }
    return "/proxy-api";
  }
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api-server/api`;
  return "http://localhost:8080/api";
}

const BASE_URL = getBaseUrl();

export async function apiFetch<T = any>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}
