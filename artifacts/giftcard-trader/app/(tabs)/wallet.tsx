import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { hapticLight, hapticSuccess, hapticError, hapticSelection } from "@/utils/haptics";
import { useKyc } from "@/contexts/KycContext";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

type FilterTab = "all" | "crypto" | "fiat";

const CHART_POINTS = [42, 45, 43, 48, 46, 50, 47, 53, 51, 55, 52, 58, 56, 60, 57, 62, 59, 64, 61, 66, 63, 68, 65, 70];

const ICON_MAP: Record<string, string> = {
  BTC: "bold", ETH: "triangle", SOL: "sun", USDT: "dollar-sign",
  BNB: "hexagon", NGN: "dollar-sign", USD: "dollar-sign",
};

const DEPOSIT_ADDRESSES: Record<string, { address: string; network: string }> = {
  BTC: { address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", network: "Bitcoin" },
  ETH: { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", network: "Ethereum (ERC-20)" },
  SOL: { address: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV", network: "Solana" },
  USDT: { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", network: "Ethereum (ERC-20)" },
  BNB: { address: "bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2", network: "BNB Smart Chain" },
  NGN: { address: "0012345678 (Access Bank)", network: "Bank Transfer" },
  USD: { address: "ACH/Wire via linked bank", network: "Bank Transfer" },
};

function PortfolioChart() {
  const max = Math.max(...CHART_POINTS);
  const min = Math.min(...CHART_POINTS);
  const range = max - min || 1;
  const h = 80;

  return (
    <View style={cStyles.wrap}>
      {CHART_POINTS.map((v, i) => {
        const pct = (v - min) / range;
        const barH = 6 + pct * (h - 6);
        const isLast = i === CHART_POINTS.length - 1;
        return (
          <View key={i} style={cStyles.col}>
            <View
              style={{
                height: barH,
                borderRadius: 2,
                backgroundColor: isLast ? "#00E5FF" : `rgba(0,229,255,${0.15 + pct * 0.55})`,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

const cStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 80 },
  col: { flex: 1, justifyContent: "flex-end" },
});

const ACTION_COLOR_MAP: Record<string, string> = {
  Buy: "#00E5FF", Sell: "#FF4444", Deposit: "#00FF88", Withdraw: "#F59E0B",
};
const ACTION_ICON_MAP: Record<string, string> = {
  Buy: "arrow-down-left", Sell: "arrow-up-right", Deposit: "download", Withdraw: "upload",
};
const STATUS_CFG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  success: { bg: "rgba(0,255,136,0.12)", border: "#00FF8830", text: "#00FF88", label: "Completed" },
  pending: { bg: "rgba(245,158,11,0.12)", border: "#F59E0B30", text: "#F59E0B", label: "Pending" },
  error: { bg: "rgba(239,68,68,0.12)", border: "#EF444430", text: "#EF4444", label: "Failed" },
};

type ModalMode = null | "deposit" | "withdraw";

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { kycStatus } = useKyc();
  const { assets, transactions, ngnBalance, usdBalance, updateNgnBalance, updateUsdBalance, updateAsset, addTransaction } = useWallet();
  const { togglePanel, addNotification } = useNotifications();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom;

  const [filter, setFilter] = useState<FilterTab>("all");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>("BTC");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [processing, setProcessing] = useState(false);

  const filteredAssets = filter === "all" ? assets : assets.filter((a) => a.type === filter);

  const walletTxs = transactions.slice(0, 7).map((t) => ({
    id: t.id,
    action: (t.direction === "in" ? (t.type === "crypto" ? "Sell" : "Deposit") : (t.type === "crypto" ? "Buy" : "Withdraw")) as "Buy" | "Sell" | "Deposit" | "Withdraw",
    asset: t.currency,
    amount: `${t.direction === "in" ? "+" : "-"}${t.currency === "NGN" ? "₦" : "$"}${t.amount.toLocaleString()}`,
    fiat: "",
    date: t.date,
    status: t.status,
    type: (t.type === "crypto" ? "crypto" : "fiat") as "crypto" | "fiat",
  }));

  const filteredTx = filter === "all" ? walletTxs : walletTxs.filter((t) => t.type === filter);
  const totalBalance = assets.reduce((s, a) => s + a.value, 0);

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
    if (amt <= 0) {
      hapticError();
      Alert.alert("Invalid Amount", "Please enter a valid withdrawal amount.");
      return;
    }
    if (!withdrawAddress || withdrawAddress.length < 5) {
      hapticError();
      Alert.alert("Invalid Address", "Please enter a valid destination address.");
      return;
    }
    const asset = assets.find((a) => a.symbol === selectedAssetSymbol);
    if (asset && amt > asset.balance) {
      hapticError();
      Alert.alert("Insufficient Balance", `You only have ${asset.balance} ${asset.symbol} available.`);
      return;
    }
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

    addTransaction({
      type: isFiat ? "wallet" : "crypto",
      category: isFiat ? "Wallet" : "Crypto",
      title: `${selectedAssetSymbol} Withdrawal`,
      amount: amt,
      currency: selectedAssetSymbol,
      status: "pending",
      date: "Just now",
      direction: "out",
    });
    addNotification({
      title: "Withdrawal Initiated",
      message: `${amt} ${selectedAssetSymbol} withdrawal to ${withdrawAddress.slice(0, 12)}... is processing.`,
      type: "info",
      time: "Just now",
    });
    hapticSuccess();
    setModalMode(null);
    Alert.alert("Withdrawal Submitted", `Your withdrawal of ${amt} ${selectedAssetSymbol} is being processed. Expected arrival: 10-30 minutes.`);
  }, [withdrawAmount, withdrawAddress, selectedAssetSymbol, assets, updateNgnBalance, updateUsdBalance, addTransaction, addNotification]);

  const depositInfo = DEPOSIT_ADDRESSES[selectedAssetSymbol] || { address: "N/A", network: "N/A" };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 }]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Wallet</Text>
          <TouchableOpacity onPress={togglePanel} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
            <Feather name="bell" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.balLabel, { color: colors.mutedForeground }]}>Total Portfolio Value</Text>
          <View style={styles.balRow}>
            <Text style={[styles.balAmount, { color: colors.foreground }]}>
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={[styles.changePill, { backgroundColor: "rgba(0,255,136,0.12)" }]}>
              <Feather name="trending-up" size={12} color="#00FF88" />
              <Text style={[styles.changeText, { color: "#00FF88" }]}>+3.2%</Text>
            </View>
          </View>
          <PortfolioChart />
        </View>

        {kycStatus !== "verified" && (
          <View style={[styles.alertBanner, {
            backgroundColor: kycStatus === "pending" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
            borderColor: kycStatus === "pending" ? "#F59E0B30" : "#EF444430",
          }]}>
            <Feather name={kycStatus === "pending" ? "clock" : "alert-circle"} size={16} color={kycStatus === "pending" ? "#F59E0B" : "#EF4444"} />
            <Text style={[styles.alertText, { color: kycStatus === "pending" ? "#F59E0B" : "#EF4444" }]}>
              {kycStatus === "pending" ? "Your KYC verification is under review." : "Complete KYC verification to increase your withdrawal limit."}
            </Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/kyc")}>
              <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: kycStatus === "pending" ? "#F59E0B" : "#EF4444" }}>
                {kycStatus === "pending" ? "View" : "Verify"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionRow}>
          {[
            { label: "Deposit", icon: "download", color: colors.success, onPress: () => openDeposit("BTC") },
            { label: "Withdraw", icon: "upload", color: "#F59E0B", onPress: () => openWithdraw("USD") },
            { label: "Transfer", icon: "repeat", color: colors.primary, onPress: () => {} },
          ].map((btn) => (
            <TouchableOpacity
              key={btn.label}
              activeOpacity={0.8}
              onPress={btn.onPress}
              style={[styles.actionBtn, { backgroundColor: `${btn.color}18` }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${btn.color}20` }]}>
                <Feather name={btn.icon as any} size={18} color={btn.color} />
              </View>
              <Text style={[styles.actionLabel, { color: btn.color }]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.filterRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(["all", "crypto", "fiat"] as FilterTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              testID={`filter-${tab}`}
              onPress={() => { hapticSelection(); setFilter(tab); }}
              activeOpacity={0.8}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: filter === tab ? "rgba(0,229,255,0.15)" : "transparent",
                  borderColor: filter === tab ? colors.primary : "transparent",
                },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === tab ? colors.primary : colors.mutedForeground }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Assets</Text>
        {filteredAssets.map((asset) => {
          const iconName = ICON_MAP[asset.symbol] || "circle";
          return (
            <TouchableOpacity
              key={asset.id}
              activeOpacity={0.8}
              onPress={() => { hapticLight(); openDeposit(asset.symbol); }}
              style={[styles.assetRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.assetIcon, { backgroundColor: `${asset.color}22` }]}>
                <Feather name={iconName as any} size={18} color={asset.color} />
              </View>
              <View style={styles.assetInfo}>
                <Text style={[styles.assetName, { color: colors.foreground }]}>{asset.name}</Text>
                <Text style={[styles.assetBal, { color: colors.mutedForeground }]}>
                  {asset.type === "fiat"
                    ? `${asset.symbol === "NGN" ? "₦" : "$"}${asset.balance.toLocaleString()}`
                    : `${asset.balance} ${asset.symbol}`}
                </Text>
              </View>
              <View style={styles.assetRight}>
                <Text style={[styles.assetFiat, { color: colors.foreground }]}>
                  ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                {asset.change !== 0 && (
                  <View style={styles.assetChangeRow}>
                    <Feather
                      name={asset.change >= 0 ? "trending-up" : "trending-down"}
                      size={10}
                      color={asset.change >= 0 ? "#00FF88" : "#FF4444"}
                    />
                    <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: asset.change >= 0 ? "#00FF88" : "#FF4444" }}>
                      {asset.change >= 0 ? "+" : ""}{asset.change}%
                    </Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={(e) => { e.stopPropagation(); openDeposit(asset.symbol); }}
                  style={[styles.miniBtn, { backgroundColor: "rgba(0,255,136,0.12)" }]}
                >
                  <Feather name="download" size={12} color="#00FF88" />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={(e) => { e.stopPropagation(); openWithdraw(asset.symbol); }}
                  style={[styles.miniBtn, { backgroundColor: "rgba(245,158,11,0.12)" }]}
                >
                  <Feather name="upload" size={12} color="#F59E0B" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.txHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 0 }]}>Transaction History</Text>
          <TouchableOpacity onPress={() => router.push("/transactions")} activeOpacity={0.8}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {filteredTx.map((tx) => {
          const st = STATUS_CFG[tx.status];
          return (
            <View key={tx.id} style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.txIcon, { backgroundColor: `${ACTION_COLOR_MAP[tx.action]}15` }]}>
                <Feather name={ACTION_ICON_MAP[tx.action] as any} size={16} color={ACTION_COLOR_MAP[tx.action]} />
              </View>
              <View style={styles.txInfo}>
                <View style={styles.txTop}>
                  <Text style={[styles.txAction, { color: colors.foreground }]}>{tx.action} {tx.asset}</Text>
                  <Text style={[styles.txAmount, { color: tx.action === "Sell" || tx.action === "Deposit" ? "#00FF88" : "#FF4444" }]}>
                    {tx.amount}
                  </Text>
                </View>
                <View style={styles.txBottom}>
                  <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{tx.date}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                    <View style={[styles.statusDot, { backgroundColor: st.text }]} />
                    <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {filteredTx.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="inbox" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No transactions found</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={modalMode !== null} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>
                {modalMode === "deposit" ? `Deposit ${selectedAssetSymbol}` : `Withdraw ${selectedAssetSymbol}`}
              </Text>
              <TouchableOpacity onPress={() => setModalMode(null)} activeOpacity={0.8}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {modalMode === "deposit" && (
              <>
                <View style={[styles.depositCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.depositLabel, { color: colors.mutedForeground }]}>Network</Text>
                  <Text style={[styles.depositNetwork, { color: colors.foreground }]}>{depositInfo.network}</Text>
                </View>
                <View style={[styles.depositCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.depositLabel, { color: colors.mutedForeground }]}>Deposit Address</Text>
                  <Text style={[styles.depositAddress, { color: colors.primary }]} numberOfLines={2}>{depositInfo.address}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => { hapticSuccess(); Alert.alert("Copied!", "Address copied to clipboard."); }}
                  style={[styles.copyBtn, { backgroundColor: colors.primary }]}
                >
                  <Feather name="copy" size={16} color={colors.primaryForeground} />
                  <Text style={[styles.copyBtnText, { color: colors.primaryForeground }]}>Copy Address</Text>
                </TouchableOpacity>
                <View style={[styles.warningBox, { backgroundColor: "rgba(245,158,11,0.1)", borderColor: "#F59E0B30" }]}>
                  <Feather name="alert-triangle" size={14} color="#F59E0B" />
                  <Text style={[styles.warningText, { color: "#F59E0B" }]}>
                    Only send {selectedAssetSymbol} to this address. Sending other assets may result in permanent loss.
                  </Text>
                </View>
              </>
            )}

            {modalMode === "withdraw" && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Amount</Text>
                <View style={[styles.wInputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.wInput, { color: colors.foreground }]}
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    placeholder="0.00"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="decimal-pad"
                  />
                  <Text style={[styles.wSuffix, { color: colors.mutedForeground }]}>{selectedAssetSymbol}</Text>
                </View>

                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Destination Address</Text>
                <TextInput
                  style={[styles.wFullInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
                  value={withdrawAddress}
                  onChangeText={setWithdrawAddress}
                  placeholder="Enter wallet address..."
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize="none"
                />

                <View style={[styles.wFeeRow, { borderColor: colors.border }]}>
                  <Text style={[styles.wFeeLabel, { color: colors.mutedForeground }]}>Network Fee</Text>
                  <Text style={[styles.wFeeValue, { color: colors.foreground }]}>~$2.50</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={processing}
                  onPress={handleWithdraw}
                  style={[styles.withdrawBtn, { backgroundColor: "#F59E0B", opacity: processing ? 0.5 : 1 }]}
                >
                  <Text style={[styles.withdrawBtnText, { color: "#0A1428" }]}>
                    {processing ? "Processing..." : "Withdraw"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },

  balanceCard: { borderRadius: 16, padding: 20, borderWidth: 1, marginBottom: 14, gap: 12 },
  balLabel: { fontSize: 12, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.8 },
  balRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  balAmount: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  changePill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  changeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  alertBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 16,
  },
  alertText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", lineHeight: 17 },

  actionRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", gap: 8,
  },
  actionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  filterRow: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 4, gap: 4, marginBottom: 20 },
  filterBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 14 },

  assetRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  assetIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  assetInfo: { flex: 1, gap: 2 },
  assetName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  assetBal: { fontSize: 12, fontFamily: "Inter_400Regular" },
  assetRight: { alignItems: "flex-end", gap: 3, marginRight: 6 },
  assetFiat: { fontSize: 15, fontFamily: "Inter_700Bold" },
  assetChangeRow: { flexDirection: "row", alignItems: "center", gap: 3 },

  miniBtn: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },

  txHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, marginTop: 8 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },

  txRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10,
  },
  txIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  txInfo: { flex: 1, gap: 4 },
  txTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  txAction: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  txAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  txBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  txDate: { fontSize: 12, fontFamily: "Inter_400Regular" },

  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  emptyState: {
    borderRadius: 14, borderWidth: 1, padding: 30,
    alignItems: "center", gap: 10,
  },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },

  depositCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  depositLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  depositNetwork: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  depositAddress: { fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 20 },

  copyBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 12, paddingVertical: 14, marginBottom: 14,
  },
  copyBtnText: { fontSize: 15, fontFamily: "Inter_700Bold" },

  warningBox: {
    flexDirection: "row", gap: 10, padding: 12, borderRadius: 10, borderWidth: 1,
  },
  warningText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6, marginTop: 4 },
  wInputRow: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, marginBottom: 14 },
  wInput: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold", paddingVertical: 14 },
  wSuffix: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  wFullInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 14 },
  wFeeRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, paddingTop: 12, marginBottom: 16 },
  wFeeLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  wFeeValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  withdrawBtn: { borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  withdrawBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
