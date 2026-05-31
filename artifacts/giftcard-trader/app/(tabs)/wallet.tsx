import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { FocusedModal } from "@/components/FocusedModal";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { router } from "expo-router";
import { hapticLight, hapticSuccess, hapticError } from "@/utils/haptics";
import { useKyc } from "@/contexts/KycContext";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

const DEPOSIT_ADDRESSES: Record<string, { address: string; network: string }> = {
  BTC:  { address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", network: "Bitcoin" },
  ETH:  { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", network: "Ethereum (ERC-20)" },
  SOL:  { address: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV", network: "Solana" },
  USDT: { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", network: "Ethereum (ERC-20)" },
  BNB:  { address: "bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2", network: "BNB Smart Chain" },
  NGN:  { address: "0012345678 (Access Bank)", network: "Bank Transfer" },
  USD:  { address: "ACH/Wire via linked bank", network: "Bank Transfer" },
};

type ModalMode = null | "deposit" | "withdraw";
type FilterTab = "All" | "Crypto" | "Fiat";

// ─── Icons ────────────────────────────────────────────────────────────────────
function BellIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#8E8E93" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={6} height={10} viewBox="0 0 6 10" fill="none">
      <Path d="M1 1l4 4-4 4" stroke="#8E8E93" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TrendIcon({ up, color }: { up: boolean; color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d={up ? "M23 6l-9.5 9.5-5-5L1 18" : "M23 18l-9.5-9.5-5 5L1 6"} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { kycStatus } = useKyc();
  const { assets, transactions, ngnBalance, usdBalance, updateNgnBalance, updateUsdBalance, updateAsset, addTransaction } = useWallet();
  const { togglePanel, addNotification } = useNotifications();

  const [filter, setFilter] = useState<FilterTab>("All");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>("BTC");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [processing, setProcessing] = useState(false);

  const filteredAssets = filter === "All" ? assets : assets.filter((a) =>
    filter === "Crypto" ? a.type === "crypto" : a.type === "fiat"
  );

  const totalBalance = assets.reduce((s, a) => s + a.value, 0);

  const recentTxs = transactions.slice(0, 5).map((t) => ({
    id: t.id,
    title: t.title,
    amount: `${t.direction === "in" ? "+" : "-"}${t.currency === "NGN" ? "₦" : "$"}${t.amount.toLocaleString()}`,
    date: t.date,
    status: t.status,
    isIn: t.direction === "in",
  }));

  const openDeposit = useCallback((symbol: string) => {
    setSelectedAssetSymbol(symbol);
    setModalMode("deposit");
  }, []);

  const openWithdraw = useCallback((symbol: string) => {
    setSelectedAssetSymbol(symbol);
    setWithdrawAmount("");
    setWithdrawAddress("");
    setModalMode("withdraw");
  }, []);

  const handleWithdraw = useCallback(async () => {
    const amt = parseFloat(withdrawAmount) || 0;
    if (amt <= 0) { hapticError(); Alert.alert("Invalid Amount", "Please enter a valid withdrawal amount."); return; }
    if (!withdrawAddress || withdrawAddress.length < 5) { hapticError(); Alert.alert("Invalid Address", "Please enter a valid destination address."); return; }
    const asset = assets.find((a) => a.symbol === selectedAssetSymbol);
    if (asset && amt > asset.balance) { hapticError(); Alert.alert("Insufficient Balance", `You only have ${asset.balance} ${asset.symbol} available.`); return; }

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);

    const isFiat = selectedAssetSymbol === "NGN" || selectedAssetSymbol === "USD";
    if (selectedAssetSymbol === "NGN") updateNgnBalance(-amt);
    else if (selectedAssetSymbol === "USD") updateUsdBalance(-amt);
    else {
      const a = assets.find((x) => x.symbol === selectedAssetSymbol);
      if (a) {
        const pricePerUnit = a.balance > 0 ? a.value / a.balance : 0;
        updateAsset(a.id, { balance: Math.max(0, a.balance - amt), value: Math.max(0, a.value - amt * pricePerUnit) });
      }
    }
    addTransaction({ type: isFiat ? "wallet" : "crypto", category: isFiat ? "Wallet" : "Crypto", title: `${selectedAssetSymbol} Withdrawal`, amount: amt, currency: selectedAssetSymbol, status: "pending", date: "Just now", direction: "out" });
    addNotification({ title: "Withdrawal Initiated", message: `${amt} ${selectedAssetSymbol} withdrawal is processing.`, type: "info", time: "Just now" });
    hapticSuccess();
    setModalMode(null);
    Alert.alert("Withdrawal Submitted", `Your withdrawal of ${amt} ${selectedAssetSymbol} is being processed.`);
  }, [withdrawAmount, withdrawAddress, selectedAssetSymbol, assets, updateNgnBalance, updateUsdBalance, updateAsset, addTransaction, addNotification]);

  const depositInfo = DEPOSIT_ADDRESSES[selectedAssetSymbol] || { address: "N/A", network: "N/A" };

  const getStatusColor = (status: string) => {
    if (status === "completed" || status === "success") return "#30D158";
    if (status === "pending") return "#FF9F0A";
    return "#FF3B30";
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Wallet</Text>
          <TouchableOpacity onPress={() => { hapticLight(); togglePanel(); }} activeOpacity={0.8} style={s.headerBtn}>
            <BellIcon />
          </TouchableOpacity>
        </View>

        {/* ── Portfolio Balance Card ── */}
        <View style={s.section}>
          <LinearGradient colors={["#1A5AFF", "#0C38C0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.portfolioCard}>
            <Text style={s.portfolioLabel}>Total Portfolio</Text>
            <Text style={s.portfolioAmount}>
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={s.portfolioRow}>
              <View style={s.portfolioPill}>
                <TrendIcon up color="#fff" />
                <Text style={s.portfolioPillText}>+3.2% this month</Text>
              </View>
            </View>
            <View style={s.portfolioStats}>
              <View style={s.portfolioStat}>
                <Text style={s.portfolioStatLabel}>USD Balance</Text>
                <Text style={s.portfolioStatValue}>${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              <View style={s.portfolioStatDivider} />
              <View style={s.portfolioStat}>
                <Text style={s.portfolioStatLabel}>NGN Balance</Text>
                <Text style={s.portfolioStatValue}>₦{ngnBalance.toLocaleString()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── Quick Actions ── */}
        <View style={s.section}>
          <View style={s.card}>
            <View style={s.quickActions}>
              {[
                { label: "Deposit", icon: "↓", onPress: () => { hapticLight(); openDeposit("BTC"); } },
                { label: "Withdraw", icon: "↑", onPress: () => { hapticLight(); openWithdraw("USD"); } },
                { label: "Buy Crypto", icon: "₿", onPress: () => { hapticLight(); router.push("/buy-crypto" as any); } },
                { label: "Sell", icon: "$", onPress: () => { hapticLight(); router.push("/sell" as any); } },
              ].map((a) => (
                <TouchableOpacity key={a.label} onPress={a.onPress} activeOpacity={0.8} style={s.quickAction}>
                  <View style={s.quickActionIcon}>
                    <Text style={s.quickActionIconText}>{a.icon}</Text>
                  </View>
                  <Text style={s.quickActionLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── KYC Banner ── */}
        {kycStatus !== "verified" && (
          <View style={s.section}>
            <TouchableOpacity onPress={() => router.push("/kyc" as any)} activeOpacity={0.88}
              style={[s.kycBanner, { backgroundColor: kycStatus === "pending" ? "#FFF9EC" : "#FFF2F2" }]}>
              <View style={[s.kycDot, { backgroundColor: kycStatus === "pending" ? "#FF9F0A" : "#FF3B30" }]} />
              <Text style={[s.kycText, { color: kycStatus === "pending" ? "#FF9F0A" : "#FF3B30" }]}>
                {kycStatus === "pending" ? "KYC verification is under review" : "Complete identity verification to unlock full access"}
              </Text>
              <ChevronRight />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Assets ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Your Assets</Text>
          <View style={s.filterPills}>
            {(["All", "Crypto", "Fiat"] as FilterTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setFilter(tab)}
                style={[s.filterPill, filter === tab && s.filterPillActive]}
              >
                <Text style={[s.filterPillText, filter === tab && s.filterPillTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.card}>
            {filteredAssets.map((asset, i) => (
              <TouchableOpacity
                key={asset.id}
                activeOpacity={0.8}
                onPress={() => { hapticLight(); openDeposit(asset.symbol); }}
                style={[s.assetRow, i < filteredAssets.length - 1 && s.assetRowBorder]}
              >
                <View style={[s.assetIcon, { backgroundColor: asset.color + "18" }]}>
                  <Text style={[s.assetIconText, { color: asset.color }]}>{asset.symbol.slice(0, 2)}</Text>
                </View>
                <View style={s.assetInfo}>
                  <Text style={s.assetName}>{asset.name}</Text>
                  <Text style={s.assetBal}>
                    {asset.type === "fiat"
                      ? `${asset.symbol === "NGN" ? "₦" : "$"}${asset.balance.toLocaleString()}`
                      : `${asset.balance} ${asset.symbol}`}
                  </Text>
                </View>
                <View style={s.assetRight}>
                  <Text style={s.assetValue}>
                    ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  {asset.change !== 0 && (
                    <View style={s.changeRow}>
                      <TrendIcon up={asset.change >= 0} color={asset.change >= 0 ? "#30D158" : "#FF3B30"} />
                      <Text style={[s.changeText, { color: asset.change >= 0 ? "#30D158" : "#FF3B30" }]}>
                        {asset.change >= 0 ? "+" : ""}{asset.change}%
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Recent Transactions ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recent</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/transactions" as any)} activeOpacity={0.8}>
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={s.section}>
          <View style={s.card}>
            {recentTxs.length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyTitle}>No transactions yet</Text>
                <Text style={s.emptySub}>Your activity will appear here</Text>
              </View>
            ) : (
              recentTxs.map((tx, i) => (
                <View key={tx.id} style={[s.txRow, i < recentTxs.length - 1 && s.txRowBorder]}>
                  <View style={[s.txIcon, { backgroundColor: tx.isIn ? "rgba(48,209,88,0.1)" : "rgba(255,59,48,0.08)" }]}>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <Path d={tx.isIn ? "M12 19V5M5 12l7-7 7 7" : "M12 5v14M5 12l7 7 7-7"} stroke={tx.isIn ? "#30D158" : "#FF3B30"} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <View style={s.txInfo}>
                    <Text style={s.txTitle}>{tx.title}</Text>
                    <Text style={s.txDate}>{tx.date}</Text>
                  </View>
                  <View style={s.txRight}>
                    <Text style={[s.txAmount, { color: tx.isIn ? "#30D158" : "#1C1C1E" }]}>{tx.amount}</Text>
                    <View style={[s.txStatusDot, { backgroundColor: getStatusColor(tx.status) }]} />
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

      </ScrollView>

      {/* ── Deposit/Withdraw Modal ── */}
      <FocusedModal visible={modalMode !== null} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />

            <View style={s.modalHeaderRow}>
              <Text style={s.modalTitle}>
                {modalMode === "deposit" ? `Deposit ${selectedAssetSymbol}` : `Withdraw ${selectedAssetSymbol}`}
              </Text>
              <TouchableOpacity onPress={() => setModalMode(null)} activeOpacity={0.8}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 6L6 18M6 6l12 12" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Asset Selector Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.assetPills} style={{ marginBottom: 16 }}>
              {Object.keys(DEPOSIT_ADDRESSES).map((sym) => (
                <TouchableOpacity
                  key={sym}
                  onPress={() => setSelectedAssetSymbol(sym)}
                  style={[s.assetPill, selectedAssetSymbol === sym && s.assetPillActive]}
                >
                  <Text style={[s.assetPillText, selectedAssetSymbol === sym && s.assetPillTextActive]}>{sym}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {modalMode === "deposit" && (
              <>
                <View style={s.modalInfoRow}>
                  <Text style={s.modalInfoLabel}>Network</Text>
                  <Text style={s.modalInfoValue}>{depositInfo.network}</Text>
                </View>
                <View style={s.modalInfoRow}>
                  <Text style={s.modalInfoLabel}>Deposit Address</Text>
                  <Text style={s.modalAddressValue} numberOfLines={2}>{depositInfo.address}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => { hapticSuccess(); Alert.alert("Copied!", "Address copied to clipboard."); }}
                  style={s.copyBtn}
                >
                  <Text style={s.copyBtnText}>Copy Address</Text>
                </TouchableOpacity>
                <View style={s.warningBox}>
                  <Text style={s.warningText}>Only send {selectedAssetSymbol} to this address. Sending other assets may result in permanent loss.</Text>
                </View>
              </>
            )}

            {modalMode === "withdraw" && (
              <>
                <Text style={s.modalLabel}>Amount</Text>
                <View style={s.modalInputRow}>
                  <TextInput
                    style={s.modalInput}
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    placeholder="0.00"
                    placeholderTextColor="#8E8E93"
                    keyboardType="decimal-pad"
                  />
                  <View style={s.modalInputTag}>
                    <Text style={s.modalInputTagText}>{selectedAssetSymbol}</Text>
                  </View>
                </View>
                <Text style={[s.modalLabel, { marginTop: 12 }]}>Destination Address</Text>
                <TextInput
                  style={s.modalAddressInput}
                  value={withdrawAddress}
                  onChangeText={setWithdrawAddress}
                  placeholder="Enter wallet address..."
                  placeholderTextColor="#8E8E93"
                  autoCapitalize="none"
                />
                <View style={s.feeRow}>
                  <Text style={s.feeLabel}>Network Fee</Text>
                  <Text style={s.feeValue}>~$2.50</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={processing}
                  onPress={handleWithdraw}
                  style={[s.withdrawBtn, { opacity: processing ? 0.6 : 1 }]}
                >
                  {processing ? <ActivityIndicator color="#fff" /> : <Text style={s.withdrawBtnText}>Confirm Withdrawal</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </FocusedModal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: { paddingBottom: 32 },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },

  section: { paddingHorizontal: 16, marginBottom: 10 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 10, marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  seeAll: { fontSize: 14, color: "#1A5AFF", fontFamily: "Inter_600SemiBold" },

  card: {
    backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },

  portfolioCard: {
    borderRadius: 20, padding: 22,
    shadowColor: "#1A5AFF", shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  portfolioLabel: { fontSize: 14, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_500Medium", marginBottom: 4 },
  portfolioAmount: { fontSize: 38, fontWeight: "700", color: "#FFFFFF", letterSpacing: -1, marginBottom: 10, fontFamily: "Inter_700Bold" },
  portfolioRow: { marginBottom: 16 },
  portfolioPill: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  portfolioPillText: { fontSize: 12, color: "#fff", fontFamily: "Inter_600SemiBold" },
  portfolioStats: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 14 },
  portfolioStat: { flex: 1, alignItems: "center" },
  portfolioStatDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.25)", marginVertical: 2 },
  portfolioStatLabel: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", marginBottom: 3 },
  portfolioStatValue: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },

  quickActions: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 16 },
  quickAction: { flex: 1, alignItems: "center", gap: 6 },
  quickActionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F2F2F7", alignItems: "center", justifyContent: "center" },
  quickActionIconText: { fontSize: 20, color: "#1A5AFF", fontFamily: "Inter_700Bold" },
  quickActionLabel: { fontSize: 12, color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },

  kycBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 16 },
  kycDot: { width: 8, height: 8, borderRadius: 4 },
  kycText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },

  filterPills: { flexDirection: "row", gap: 6 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  filterPillActive: { backgroundColor: "#1A5AFF" },
  filterPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  filterPillTextActive: { color: "#FFFFFF" },

  assetRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  assetRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  assetIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  assetIconText: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 15, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  assetBal: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular", marginTop: 1 },
  assetRight: { alignItems: "flex-end", gap: 3 },
  assetValue: { fontSize: 15, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  changeRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  changeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  txRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  txDate: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular", marginTop: 1 },
  txRight: { alignItems: "flex-end", gap: 4 },
  txAmount: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  txStatusDot: { width: 6, height: 6, borderRadius: 3 },

  emptyState: { padding: 28, alignItems: "center" },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  emptySub: { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_400Regular" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40, minHeight: 380,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: -4 }, elevation: 20,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E5EA", alignSelf: "center", marginBottom: 20 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1C1C1E", fontFamily: "Inter_700Bold" },
  assetPills: { flexDirection: "row", gap: 8, paddingRight: 8 },
  assetPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#F2F2F7" },
  assetPillActive: { backgroundColor: "#1A5AFF" },
  assetPillText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8E8E93" },
  assetPillTextActive: { color: "#FFFFFF" },
  modalInfoRow: { backgroundColor: "#F2F2F7", borderRadius: 12, padding: 14, marginBottom: 10 },
  modalInfoLabel: { fontSize: 12, color: "#8E8E93", fontFamily: "Inter_400Regular", marginBottom: 3 },
  modalInfoValue: { fontSize: 15, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  modalAddressValue: { fontSize: 13, color: "#1A5AFF", fontFamily: "Inter_500Medium" },
  copyBtn: { backgroundColor: "#1A5AFF", borderRadius: 14, paddingVertical: 15, alignItems: "center", marginBottom: 12 },
  copyBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
  warningBox: { backgroundColor: "#FFF9EC", borderRadius: 12, padding: 12 },
  warningText: { fontSize: 12, color: "#FF9F0A", fontFamily: "Inter_400Regular", lineHeight: 18 },
  modalLabel: { fontSize: 13, color: "#8E8E93", fontFamily: "Inter_500Medium", marginBottom: 8 },
  modalInputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F2F2F7", borderRadius: 12, paddingHorizontal: 14 },
  modalInput: { flex: 1, fontSize: 22, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold", paddingVertical: 14 },
  modalInputTag: { backgroundColor: "#E5E5EA", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  modalInputTagText: { fontSize: 13, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  modalAddressInput: { backgroundColor: "#F2F2F7", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 14, color: "#1C1C1E", fontFamily: "Inter_400Regular" },
  feeRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E5EA", marginTop: 12, marginBottom: 12 },
  feeLabel: { fontSize: 14, color: "#8E8E93", fontFamily: "Inter_400Regular" },
  feeValue: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", fontFamily: "Inter_600SemiBold" },
  withdrawBtn: { backgroundColor: "#1C1C1E", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  withdrawBtnText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF", fontFamily: "Inter_700Bold" },
});
