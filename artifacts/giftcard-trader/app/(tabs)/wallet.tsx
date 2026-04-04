import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FocusedModal } from "@/components/FocusedModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { ThemeToggle } from "@/components/ThemeToggle";
import { hapticLight, hapticSuccess, hapticError, hapticSelection } from "@/utils/haptics";
import { useKyc } from "@/contexts/KycContext";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { XStack, YStack } from "@/components/Stacks";
import { SizableText, Paragraph, Strong } from "@/components/Typography";

type FilterTab = "All" | "Crypto" | "Fiat";

const DEPOSIT_ADDRESSES: Record<string, { address: string; network: string }> = {
  BTC: { address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", network: "Bitcoin" },
  ETH: { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", network: "Ethereum (ERC-20)" },
  SOL: { address: "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV", network: "Solana" },
  USDT: { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", network: "Ethereum (ERC-20)" },
  BNB: { address: "bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2", network: "BNB Smart Chain" },
  NGN: { address: "0012345678 (Access Bank)", network: "Bank Transfer" },
  USD: { address: "ACH/Wire via linked bank", network: "Bank Transfer" },
};

type ModalMode = null | "deposit" | "withdraw";

export default function WalletScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
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

  const walletTxs = transactions.slice(0, 7).map((t) => ({
    id: t.id,
    type: (t.direction === "in" ? (t.type === "crypto" ? "buy" : "deposit") : (t.type === "crypto" ? "sell" : "withdraw")) as "buy" | "sell" | "deposit" | "withdraw",
    title: t.title,
    amount: `${t.direction === "in" ? "+" : "-"}${t.currency === "NGN" ? "₦" : "$"}${t.amount.toLocaleString()}`,
    date: t.date,
    status: t.status as "completed" | "pending" | "failed",
    txType: t.type,
  }));

  const filteredTx = filter === "All" ? walletTxs : walletTxs.filter((t) => {
    if (filter === "Crypto") return t.type === "buy" || t.type === "sell";
    return t.type === "deposit" || t.type === "withdraw";
  });

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
    Alert.alert("Withdrawal Submitted", `Your withdrawal of ${amt} ${selectedAssetSymbol} is being processed.`);
  }, [withdrawAmount, withdrawAddress, selectedAssetSymbol, assets, updateNgnBalance, updateUsdBalance, updateAsset, addTransaction, addNotification]);

  const depositInfo = DEPOSIT_ADDRESSES[selectedAssetSymbol] || { address: "N/A", network: "N/A" };

  const bg = isDark ? "#0A1428" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const borderClr = isDark ? "#334155" : "#E2E8F0";
  const fg = isDark ? "#FFFFFF" : "#0F172A";
  const muted = isDark ? "#94A3B8" : "#64748B";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": case "success": return "#22C55E";
      case "pending": return "#F59E0B";
      case "failed": case "error": return "#EF4444";
      default: return muted;
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": case "success": return "Completed";
      case "pending": return "Pending";
      case "failed": case "error": return "Failed";
      default: return status;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={["top", "left", "right"]}>
      <XStack justifyContent="space-between" alignItems="center" paddingHorizontal={24} paddingVertical={16} style={{ borderBottomWidth: 1, borderBottomColor: borderClr }}>
        <SizableText size="$7" fontWeight="bold" color={fg}>Wallet Balance</SizableText>
        <XStack alignItems="center" gap={12}>
          <TouchableOpacity onPress={togglePanel} activeOpacity={0.8}>
            <Feather name="bell" size={22} color={muted} />
          </TouchableOpacity>
          <ThemeToggle />
        </XStack>
      </XStack>

      <ScrollView contentContainerStyle={{ paddingBottom: 128, gap: 24 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <LinearGradient
            colors={["#00E5FF", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 16, padding: 24 }}
          >
            <SizableText size="$4" color="rgba(255,255,255,0.8)" marginBottom={4}>Total Balance</SizableText>
            <SizableText size="$9" fontWeight="bold" color="#FFFFFF" marginBottom={8}>
              ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </SizableText>
            <XStack alignItems="center" gap={8}>
              <XStack alignItems="center" gap={4} style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }}>
                <Feather name="trending-up" size={12} color="#FFFFFF" />
                <SizableText size="$2" fontWeight="600" color="#FFFFFF">+3.2%</SizableText>
              </XStack>
              <SizableText size="$2" color="rgba(255,255,255,0.6)">vs last month</SizableText>
            </XStack>
          </LinearGradient>
        </View>

        {kycStatus !== "verified" && (
          <XStack
            alignItems="center"
            gap={12}
            padding={12}
            borderRadius={12}
            borderWidth={1}
            backgroundColor={kycStatus === "pending" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)"}
            borderColor={kycStatus === "pending" ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}
            style={{ marginHorizontal: 24 }}
          >
            <Feather name={kycStatus === "pending" ? "clock" : "alert-circle"} size={16} color={kycStatus === "pending" ? "#F59E0B" : "#EF4444"} />
            <SizableText size="$2" color={kycStatus === "pending" ? "#F59E0B" : "#EF4444"} flex={1}>
              {kycStatus === "pending" ? "Your KYC verification is under review." : "Complete KYC verification to increase your withdrawal limit."}
            </SizableText>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/kyc")}>
              <SizableText size="$2" fontWeight="600" color={kycStatus === "pending" ? "#F59E0B" : "#EF4444"}>
                {kycStatus === "pending" ? "View" : "Verify"}
              </SizableText>
            </TouchableOpacity>
          </XStack>
        )}

        <XStack gap={16} paddingHorizontal={24}>
          <TouchableOpacity
            onPress={() => { hapticLight(); openDeposit("BTC"); }}
            style={{ flex: 1, padding: 16, alignItems: "center", backgroundColor: cardBg, borderWidth: 1, borderColor: borderClr, borderRadius: 12 }}
          >
            <Feather name="download" size={24} color="#00E5FF" style={{ marginBottom: 8 }} />
            <SizableText size="$4" fontWeight="600" color={fg}>Deposit</SizableText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { hapticLight(); openWithdraw("USD"); }}
            style={{ flex: 1, padding: 16, alignItems: "center", backgroundColor: cardBg, borderWidth: 1, borderColor: borderClr, borderRadius: 12 }}
          >
            <Feather name="upload" size={24} color="#14B8A6" style={{ marginBottom: 8 }} />
            <SizableText size="$4" fontWeight="600" color={fg}>Withdraw</SizableText>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, padding: 16, alignItems: "center", backgroundColor: cardBg, borderWidth: 1, borderColor: borderClr, borderRadius: 12 }}
          >
            <Feather name="repeat" size={24} color={muted} style={{ marginBottom: 8 }} />
            <SizableText size="$4" fontWeight="600" color={fg}>Transfer</SizableText>
          </TouchableOpacity>
        </XStack>

        <YStack paddingHorizontal={24}>
          <XStack justifyContent="space-between" alignItems="center" style={{ marginBottom: 16 }}>
            <SizableText size="$6" fontWeight="bold" color={fg}>Your Assets</SizableText>
            <XStack gap={8}>
              {(["All", "Crypto", "Fiat"] as FilterTab[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => { hapticSelection(); setFilter(tab); }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: filter === tab ? "#00E5FF" : (isDark ? "#1E293B" : "#F1F5F9"),
                  }}
                >
                  <SizableText size="$4" fontWeight="500" color={filter === tab ? "#0A1428" : muted}>
                    {tab}
                  </SizableText>
                </TouchableOpacity>
              ))}
            </XStack>
          </XStack>

          <YStack gap={12}>
            {filteredAssets.map((asset) => (
              <TouchableOpacity
                key={asset.id}
                activeOpacity={0.8}
                onPress={() => { hapticLight(); openDeposit(asset.symbol); }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: cardBg,
                  borderWidth: 1,
                  borderColor: borderClr,
                }}
              >
                <XStack alignItems="center" gap={12}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: `${asset.color}22` }}>
                    <Feather name="activity" size={20} color={asset.color} />
                  </View>
                  <YStack>
                    <SizableText size="$4" fontWeight="600" color={fg}>{asset.name}</SizableText>
                    <SizableText size="$4" color={muted}>
                      {asset.type === "fiat"
                        ? `${asset.symbol === "NGN" ? "₦" : "$"}${asset.balance.toLocaleString()}`
                        : `${asset.balance} ${asset.symbol}`}
                    </SizableText>
                  </YStack>
                </XStack>
                <YStack alignItems="flex-end">
                  <SizableText size="$4" fontWeight="600" color={fg}>
                    ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </SizableText>
                  {asset.change !== 0 && (
                    <XStack alignItems="center" gap={4}>
                      <Feather
                        name={asset.change >= 0 ? "trending-up" : "trending-down"}
                        size={12}
                        color={asset.change >= 0 ? "#22C55E" : "#EF4444"}
                      />
                      <SizableText size="$2" color={asset.change >= 0 ? "#22C55E" : "#EF4444"}>
                        {asset.change >= 0 ? "+" : ""}{asset.change}%
                      </SizableText>
                    </XStack>
                  )}
                </YStack>
              </TouchableOpacity>
            ))}
          </YStack>
        </YStack>

        <YStack paddingHorizontal={24}>
          <XStack justifyContent="space-between" alignItems="center" style={{ marginBottom: 16 }}>
            <SizableText size="$6" fontWeight="bold" color={fg}>Recent Transactions</SizableText>
            <TouchableOpacity onPress={() => router.push("/transactions")} activeOpacity={0.8}>
              <SizableText size="$4" color="#00E5FF">See All</SizableText>
            </TouchableOpacity>
          </XStack>

          <YStack gap={12}>
            {filteredTx.map((tx) => {
              const stColor = getStatusColor(tx.status);
              const stLabel = getStatusLabel(tx.status);
              const isIn = tx.type === "buy" || tx.type === "deposit";
              const iconName = tx.type === "buy" ? "trending-up" : tx.type === "sell" ? "trending-down" : tx.type === "deposit" ? "arrow-down" : "arrow-up";
              return (
                <XStack key={tx.id} alignItems="center" justifyContent="space-between" padding={16} borderRadius={12} backgroundColor={cardBg} borderWidth={1} borderColor={borderClr}>
                  <XStack alignItems="center" gap={12}>
                    <View style={{
                      width: 40, height: 40, borderRadius: 20,
                      alignItems: "center", justifyContent: "center",
                      backgroundColor: isIn ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    }}>
                      <Feather name={iconName as any} size={20} color={isIn ? "#22C55E" : "#EF4444"} />
                    </View>
                    <YStack>
                      <SizableText size="$4" fontWeight="600" color={fg}>{tx.title}</SizableText>
                      <SizableText size="$4" color={muted}>{tx.date}</SizableText>
                    </YStack>
                  </XStack>
                  <YStack alignItems="flex-end">
                    <SizableText size="$4" fontWeight="600" color={isIn ? "#22C55E" : fg}>{tx.amount}</SizableText>
                    <XStack alignItems="center" gap={4} style={{ marginTop: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: stColor }} />
                      <SizableText size="$2" color={stColor}>{stLabel}</SizableText>
                    </XStack>
                  </YStack>
                </XStack>
              );
            })}

            {filteredTx.length === 0 && (
              <YStack alignItems="center" padding={32} backgroundColor={cardBg} borderRadius={12} borderWidth={1} borderColor={borderClr}>
                <Feather name="inbox" size={28} color={muted} />
                <SizableText size="$4" color={muted} marginTop={8}>No transactions found</SizableText>
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>

      <FocusedModal visible={modalMode !== null} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <YStack backgroundColor={cardBg} borderRadius={24} padding={24} borderWidth={1} borderColor={borderClr} minHeight={400} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
            <View style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: borderClr, alignSelf: "center", marginBottom: 24 }} />

            <XStack justifyContent="space-between" alignItems="center" style={{ marginBottom: 24 }}>
              <SizableText size="$7" fontWeight="bold" color={fg}>
                {modalMode === "deposit" ? `Deposit ${selectedAssetSymbol}` : `Withdraw ${selectedAssetSymbol}`}
              </SizableText>
              <TouchableOpacity onPress={() => setModalMode(null)} activeOpacity={0.8}>
                <Feather name="x" size={22} color={muted} />
              </TouchableOpacity>
            </XStack>

            {modalMode === "deposit" && (
              <>
                <View style={{ padding: 16, borderRadius: 12, backgroundColor: bg, borderWidth: 1, borderColor: borderClr, marginBottom: 16 }}>
                  <SizableText size="$4" color={muted} marginBottom={4}>Network</SizableText>
                  <SizableText size="$true" fontWeight="600" color={fg}>{depositInfo.network}</SizableText>
                </View>
                <View style={{ padding: 16, borderRadius: 12, backgroundColor: bg, borderWidth: 1, borderColor: borderClr, marginBottom: 16 }}>
                  <SizableText size="$4" color={muted} marginBottom={4}>Deposit Address</SizableText>
                  <SizableText size="$4" color="#00E5FF" numberOfLines={2}>{depositInfo.address}</SizableText>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => { hapticSuccess(); Alert.alert("Copied!", "Address copied to clipboard."); }}
                  style={{ backgroundColor: "#00E5FF", paddingVertical: 16, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 }}
                >
                  <Feather name="copy" size={16} color="#0A1428" />
                  <Strong color="#0A1428" style={{ fontSize: 16 }}>Copy Address</Strong>
                </TouchableOpacity>
                <XStack alignItems="flex-start" gap={8} padding={12} borderRadius={12} borderWidth={1} backgroundColor="rgba(245,158,11,0.1)" borderColor="rgba(245,158,11,0.2)">
                  <Feather name="alert-triangle" size={14} color="#F59E0B" style={{ marginTop: 2 }} />
                  <Paragraph size="$2" color="#F59E0B" flex={1}>
                    Only send {selectedAssetSymbol} to this address. Sending other assets may result in permanent loss.
                  </Paragraph>
                </XStack>
              </>
            )}

            {modalMode === "withdraw" && (
              <>
                <SizableText size="$4" color={muted} marginBottom={8}>Amount</SizableText>
                <XStack alignItems="center" padding={16} borderRadius={12} backgroundColor={bg} borderWidth={1} borderColor={borderClr} style={{ marginBottom: 16 }}>
                  <TextInput
                    style={{ flex: 1, fontSize: 20, fontWeight: "600", color: fg }}
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    placeholder="0.00"
                    placeholderTextColor={muted}
                    keyboardType="decimal-pad"
                  />
                  <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, backgroundColor: isDark ? "#1E293B" : "#E2E8F0" }}>
                    <Strong color={fg}>{selectedAssetSymbol}</Strong>
                  </View>
                </XStack>

                <SizableText size="$4" color={muted} marginBottom={8}>Destination Address</SizableText>
                <TextInput
                  style={{ padding: 16, borderRadius: 12, backgroundColor: bg, borderWidth: 1, borderColor: borderClr, color: fg, fontSize: 16, marginBottom: 16 }}
                  value={withdrawAddress}
                  onChangeText={setWithdrawAddress}
                  placeholder="Enter wallet address..."
                  placeholderTextColor={muted}
                  autoCapitalize="none"
                />

                <XStack justifyContent="space-between" paddingVertical={12} style={{ borderTopWidth: 1, borderTopColor: borderClr, marginBottom: 16 }}>
                  <SizableText size="$4" color={muted}>Network Fee</SizableText>
                  <SizableText size="$4" fontWeight="600" color={fg}>~$2.50</SizableText>
                </XStack>

                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={processing}
                  onPress={handleWithdraw}
                  style={{ backgroundColor: "#F59E0B", paddingVertical: 16, borderRadius: 12, alignItems: "center", opacity: processing ? 0.5 : 1 }}
                >
                  {processing ? (
                    <ActivityIndicator color="#0A1428" />
                  ) : (
                    <Strong color="#0A1428" style={{ fontSize: 18 }}>Withdraw</Strong>
                  )}
                </TouchableOpacity>
              </>
            )}
          </YStack>
        </View>
      </FocusedModal>
    </SafeAreaView>
  );
}
