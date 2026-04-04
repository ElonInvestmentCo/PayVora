import React, { createContext, useContext, useState, useCallback } from "react";

export interface WalletTransaction {
  id: string;
  type: "gift_card" | "crypto" | "bills" | "card" | "wallet" | "transfer";
  category: string;
  title: string;
  amount: number;
  currency: string;
  status: "success" | "pending" | "error";
  date: string;
  direction: "in" | "out";
}

export interface WalletAsset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value: number;
  change: number;
  type: "crypto" | "fiat";
  icon: string;
  color: string;
}

interface WalletContextType {
  ngnBalance: number;
  usdBalance: number;
  assets: WalletAsset[];
  transactions: WalletTransaction[];
  addTransaction: (tx: Omit<WalletTransaction, "id">) => void;
  updateNgnBalance: (delta: number) => void;
  updateUsdBalance: (delta: number) => void;
  updateAsset: (id: string, updates: Partial<WalletAsset>) => void;
  virtualCardBalance: number;
  virtualCardFrozen: boolean;
  virtualCardCreated: boolean;
  createVirtualCard: () => void;
  fundVirtualCard: (amount: number) => void;
  withdrawVirtualCard: (amount: number) => void;
  toggleFreezeCard: () => void;
}

const INITIAL_ASSETS: WalletAsset[] = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", balance: 0.3425, value: 15412.50, change: 2.4, type: "crypto", icon: "B", color: "#F7931A" },
  { id: "eth", name: "Ethereum", symbol: "ETH", balance: 2.15, value: 6881.20, change: -1.2, type: "crypto", icon: "E", color: "#627EEA" },
  { id: "sol", name: "Solana", symbol: "SOL", balance: 45.8, value: 3211.45, change: 5.8, type: "crypto", icon: "S", color: "#00FFA3" },
  { id: "usdt", name: "Tether", symbol: "USDT", balance: 2500.0, value: 2500.0, change: 0.01, type: "crypto", icon: "T", color: "#26A17B" },
  { id: "ngn", name: "Naira", symbol: "NGN", balance: 253750, value: 338.33, change: 0, type: "fiat", icon: "₦", color: "#00E5FF" },
  { id: "usd", name: "US Dollar", symbol: "USD", balance: 1250.0, value: 1250.0, change: 0, type: "fiat", icon: "$", color: "#00FF88" },
];

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  { id: "t1", type: "gift_card", category: "Gift Cards", title: "Amazon Gift Card Sold", amount: 75000, currency: "NGN", status: "success", date: "Today, 2:30 PM", direction: "in" },
  { id: "t2", type: "gift_card", category: "Gift Cards", title: "iTunes Gift Card Sold", amount: 36000, currency: "NGN", status: "pending", date: "Yesterday, 11:10 AM", direction: "in" },
  { id: "t3", type: "crypto", category: "Crypto", title: "Bitcoin Purchase", amount: 500, currency: "USD", status: "success", date: "Yesterday, 9:05 AM", direction: "out" },
  { id: "t4", type: "bills", category: "Bills", title: "Airtime Purchase - MTN", amount: 5000, currency: "NGN", status: "success", date: "Apr 1, 4:20 PM", direction: "out" },
  { id: "t5", type: "wallet", category: "Wallet", title: "Bank Deposit", amount: 50000, currency: "NGN", status: "success", date: "Apr 1, 10:00 AM", direction: "in" },
  { id: "t6", type: "crypto", category: "Crypto", title: "Ethereum Sold", amount: 800, currency: "USD", status: "success", date: "Mar 31, 3:15 PM", direction: "in" },
  { id: "t7", type: "card", category: "Card", title: "Virtual Card Funding", amount: 200, currency: "USD", status: "success", date: "Mar 30, 2:00 PM", direction: "out" },
  { id: "t8", type: "gift_card", category: "Gift Cards", title: "Steam Gift Card Sold", amount: 140000, currency: "NGN", status: "success", date: "Mar 29, 9:05 AM", direction: "in" },
  { id: "t9", type: "bills", category: "Bills", title: "DSTV Subscription", amount: 21000, currency: "NGN", status: "error", date: "Mar 28, 6:30 PM", direction: "out" },
  { id: "t10", type: "transfer", category: "Wallet", title: "Transfer to John D.", amount: 25000, currency: "NGN", status: "success", date: "Mar 27, 1:45 PM", direction: "out" },
];

let txCounter = 100;

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [ngnBalance, setNgnBalance] = useState(253750);
  const [usdBalance, setUsdBalance] = useState(1250);
  const [assets, setAssets] = useState<WalletAsset[]>(INITIAL_ASSETS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [virtualCardBalance, setVirtualCardBalance] = useState(350);
  const [virtualCardFrozen, setVirtualCardFrozen] = useState(false);
  const [virtualCardCreated, setVirtualCardCreated] = useState(true);

  const addTransaction = useCallback((tx: Omit<WalletTransaction, "id">) => {
    const newTx = { ...tx, id: `t${txCounter++}` };
    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  const updateNgnBalance = useCallback((delta: number) => {
    setNgnBalance((prev) => Math.max(0, prev + delta));
    setAssets((prev) => prev.map((a) => a.id === "ngn" ? { ...a, balance: Math.max(0, a.balance + delta), value: Math.max(0, a.value + delta / 750) } : a));
  }, []);

  const updateUsdBalance = useCallback((delta: number) => {
    setUsdBalance((prev) => Math.max(0, prev + delta));
    setAssets((prev) => prev.map((a) => a.id === "usd" ? { ...a, balance: Math.max(0, a.balance + delta), value: Math.max(0, a.value + delta) } : a));
  }, []);

  const updateAsset = useCallback((id: string, updates: Partial<WalletAsset>) => {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  }, []);

  const createVirtualCard = useCallback(() => {
    setVirtualCardCreated(true);
    setVirtualCardBalance(0);
  }, []);

  const fundVirtualCard = useCallback((amount: number) => {
    if (amount > usdBalance) return;
    setVirtualCardBalance((prev) => prev + amount);
    setUsdBalance((prev) => prev - amount);
    setAssets((prev) => prev.map((a) => a.id === "usd" ? { ...a, balance: a.balance - amount, value: a.value - amount } : a));
  }, [usdBalance]);

  const withdrawVirtualCard = useCallback((amount: number) => {
    if (amount > virtualCardBalance) return;
    setVirtualCardBalance((prev) => prev - amount);
    setUsdBalance((prev) => prev + amount);
    setAssets((prev) => prev.map((a) => a.id === "usd" ? { ...a, balance: a.balance + amount, value: a.value + amount } : a));
  }, [virtualCardBalance]);

  const toggleFreezeCard = useCallback(() => {
    setVirtualCardFrozen((prev) => !prev);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ngnBalance, usdBalance, assets, transactions,
        addTransaction, updateNgnBalance, updateUsdBalance, updateAsset,
        virtualCardBalance, virtualCardFrozen, virtualCardCreated,
        createVirtualCard, fundVirtualCard, withdrawVirtualCard, toggleFreezeCard,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
