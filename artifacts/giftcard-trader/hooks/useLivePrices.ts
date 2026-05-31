import { useQuery } from "@tanstack/react-query";

const COIN_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  ADA: "cardano",
  XRP: "ripple",
};

export interface LivePrice {
  price: number;
  change: number;
}

export interface LivePricesResult {
  prices: Record<string, LivePrice>;
  ngnRate: number;
  loading: boolean;
  error: boolean;
  lastUpdated: Date | null;
}

async function fetchCryptoPrices(): Promise<Record<string, LivePrice>> {
  const ids = Object.values(COIN_IDS).join(",");
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error("CoinGecko fetch failed");
  const data: Record<string, { usd: number; usd_24h_change: number }> = await res.json();
  const result: Record<string, LivePrice> = {};
  for (const [symbol, id] of Object.entries(COIN_IDS)) {
    if (data[id]) {
      result[symbol] = {
        price: data[id].usd,
        change: Number((data[id].usd_24h_change ?? 0).toFixed(2)),
      };
    }
  }
  return result;
}

async function fetchNgnRate(): Promise<number> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!res.ok) throw new Error("Exchange rate fetch failed");
  const data: { rates: Record<string, number> } = await res.json();
  return data.rates?.NGN ?? 1650;
}

export function useLivePrices(): LivePricesResult {
  const cryptoQuery = useQuery({
    queryKey: ["live-crypto-prices"],
    queryFn: fetchCryptoPrices,
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: 2,
  });

  const ngnQuery = useQuery({
    queryKey: ["live-ngn-rate"],
    queryFn: fetchNgnRate,
    refetchInterval: 5 * 60_000,
    staleTime: 4 * 60_000,
    retry: 2,
  });

  return {
    prices: cryptoQuery.data ?? {},
    ngnRate: ngnQuery.data ?? 1650,
    loading: cryptoQuery.isLoading || ngnQuery.isLoading,
    error: cryptoQuery.isError || ngnQuery.isError,
    lastUpdated: cryptoQuery.dataUpdatedAt ? new Date(cryptoQuery.dataUpdatedAt) : null,
  };
}
