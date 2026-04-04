import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { ThemeToggle } from "@/components/ThemeToggle";
import { hapticSuccess, hapticError, hapticSelection } from "@/utils/haptics";
import { useWallet } from "@/contexts/WalletContext";
import { useNotifications } from "@/contexts/NotificationsContext";

type CryptoId = "btc" | "eth" | "usdt" | "sol" | "xrp" | "bnb";

interface Crypto {
  id: CryptoId;
  name: string;
  symbol: string;
  price: number;
  change: number;
  balance: number;
  emoji: string;
  color: string;
}

const CRYPTOS: Crypto[] = [
  { id: "btc",  name: "Bitcoin",  symbol: "BTC",  price: 42500.50, change: -2.45, balance: 0.5,    emoji: "₿", color: "#F7931A" },
  { id: "eth",  name: "Ethereum", symbol: "ETH",  price: 2850,     change: 3.12,  balance: 4.125,  emoji: "Ξ", color: "#627EEA" },
  { id: "usdt", name: "Tether",   symbol: "USDT", price: 1.0,      change: 0.01,  balance: 2500,   emoji: "₮", color: "#26A17B" },
  { id: "sol",  name: "Solana",   symbol: "SOL",  price: 142,      change: 5.8,   balance: 18.5,   emoji: "◎", color: "#9945FF" },
  { id: "xrp",  name: "Ripple",   symbol: "XRP",  price: 0.62,     change: -0.5,  balance: 3200,   emoji: "✕", color: "#23292F" },
  { id: "bnb",  name: "BNB",      symbol: "BNB",  price: 312,      change: 1.1,   balance: 2.8,    emoji: "◆", color: "#F3BA2F" },
];

const FEE_RATE = 0.001;

export default function SellCryptoScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { updateUsdBalance, updateAsset, assets, addTransaction } = useWallet();
  const { addNotification } = useNotifications();

  const [selectedCrypto, setSelectedCrypto] = useState<CryptoId>("btc");
  const [amount, setAmount] = useState("");
  const [fiatValue, setFiatValue] = useState("0.00");
  const [isMarket, setIsMarket] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txStatus, setTxStatus] = useState<"pending" | "success" | "failed">("pending");

  const crypto = CRYPTOS.find((c) => c.id === selectedCrypto)!;

  const bg = isDark ? "#0A1428" : "#F8FAFC";
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";
  const borderClr = isDark ? "#334155" : "#E2E8F0";
  const fg = isDark ? "#FFFFFF" : "#0F172A";
  const muted = isDark ? "#94A3B8" : "#64748B";

  const handleAmountChange = useCallback((text: string) => {
    setAmount(text);
    const num = parseFloat(text) || 0;
    setFiatValue((num * crypto.price).toFixed(2));
  }, [crypto.price]);

  const getFee = useCallback(() => {
    return (parseFloat(fiatValue) * FEE_RATE).toFixed(2);
  }, [fiatValue]);

  const getTotalPayout = useCallback(() => {
    const val = parseFloat(fiatValue);
    const fee = parseFloat(getFee());
    return (val - fee).toFixed(2);
  }, [fiatValue, getFee]);

  const handleSell = useCallback(() => {
    const numAmount = parseFloat(amount) || 0;
    if (!amount || numAmount <= 0) {
      hapticError();
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (numAmount > crypto.balance) {
      hapticError();
      Alert.alert("Insufficient Balance", `You only have ${crypto.balance} ${crypto.symbol} available.`);
      return;
    }
    setShowModal(true);
    setIsProcessing(true);
    setTxStatus("pending");

    setTimeout(() => {
      const payout = parseFloat(getTotalPayout());
      updateUsdBalance(payout);

      const walletAsset = assets.find((a) => a.symbol === crypto.symbol);
      if (walletAsset) {
        const pricePerUnit = walletAsset.balance > 0 ? walletAsset.value / walletAsset.balance : 0;
        updateAsset(walletAsset.id, {
          balance: Math.max(0, walletAsset.balance - numAmount),
          value: Math.max(0, walletAsset.value - numAmount * pricePerUnit),
        });
      }

      addTransaction({
        type: "crypto",
        category: "Crypto",
        title: `${crypto.name} Sold`,
        amount: payout,
        currency: "USD",
        status: "success",
        date: "Just now",
        direction: "in",
      });
      addNotification({
        title: "Crypto Sold",
        message: `Sold ${numAmount} ${crypto.symbol} for $${payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
        type: "success",
        time: "Just now",
      });

      hapticSuccess();
      setTxStatus("success");
      setIsProcessing(false);
    }, 2000);
  }, [amount, crypto, getTotalPayout, updateUsdBalance, updateAsset, assets, addTransaction, addNotification]);

  const handlePercentage = useCallback((pct: number) => {
    const val = (crypto.balance * pct).toFixed(pct === 1 ? 4 : 6);
    setAmount(val);
    setFiatValue((parseFloat(val) * crypto.price).toFixed(2));
  }, [crypto.balance, crypto.price]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={["top", "left", "right"]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: borderClr }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: cardBg }}
          >
            <Feather name="arrow-left" size={20} color={muted} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: fg }}>Sell Crypto</Text>
        </View>
        <ThemeToggle />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 128, gap: 24 }}>
        <View style={{ marginHorizontal: 24, marginTop: 24, padding: 20, borderRadius: 16, backgroundColor: cardBg, borderWidth: 1, borderColor: borderClr }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <Text style={{ fontSize: 14, color: muted, marginBottom: 4 }}>Available Balance</Text>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: fg }}>{crypto.balance} {crypto.symbol}</Text>
              <Text style={{ fontSize: 14, color: muted, marginTop: 4 }}>
                ≈ ${(crypto.balance * crypto.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handlePercentage(1)}
              style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: bg, borderWidth: 1, borderColor: borderClr }}
            >
              <Text style={{ color: "#00E5FF", fontSize: 12, fontWeight: "600" }}>MAX</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginHorizontal: 24 }}>
          <Text style={{ fontSize: 14, color: muted, marginBottom: 12 }}>Asset</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CRYPTOS.map((c) => {
              const active = c.id === selectedCrypto;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => {
                    hapticSelection();
                    setSelectedCrypto(c.id);
                    setAmount("");
                    setFiatValue("0.00");
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12,
                    borderWidth: 1,
                    backgroundColor: active ? "rgba(0,229,255,0.1)" : cardBg,
                    borderColor: active ? "#00E5FF" : borderClr,
                  }}
                >
                  <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: `${c.color}20` }}>
                    <Text style={{ color: c.color, fontWeight: "bold", fontSize: 14 }}>{c.emoji}</Text>
                  </View>
                  <Text style={{ fontWeight: "600", fontSize: 14, color: active ? "#00E5FF" : fg }}>{c.symbol}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ marginHorizontal: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 12, color: muted }}>Current Price</Text>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: fg }}>${crypto.price.toLocaleString()}</Text>
            </View>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: crypto.change >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            }}>
              <Feather name={crypto.change >= 0 ? "trending-up" : "trending-down"} size={16} color={crypto.change >= 0 ? "#22C55E" : "#EF4444"} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: crypto.change >= 0 ? "#22C55E" : "#EF4444" }}>
                {crypto.change > 0 ? "+" : ""}{crypto.change}%
              </Text>
            </View>
          </View>

          <View style={{ height: 96, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: borderClr, position: "relative", backgroundColor: isDark ? "#000000" : "#F1F5F9" }}>
            <LinearGradient
              colors={["rgba(0, 229, 255, 0.2)", "rgba(139, 92, 246, 0.1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
            />
            <View style={{ position: "absolute", bottom: 16, left: 16, right: 16, height: 48, justifyContent: "flex-end" }}>
              <View style={{ height: 4, backgroundColor: "#00E5FF", borderRadius: 2, opacity: 0.5, marginBottom: 8, width: "60%", alignSelf: "flex-end" }} />
              <View style={{ height: 4, backgroundColor: "#8B5CF6", borderRadius: 2, opacity: 0.5, marginBottom: 8, width: "80%", alignSelf: "flex-end" }} />
              <View style={{ height: 4, backgroundColor: "#00E5FF", borderRadius: 2, width: "100%" }} />
            </View>
          </View>
        </View>

        <View style={{ marginHorizontal: 24, flexDirection: "row", borderRadius: 12, padding: 4, borderWidth: 1, backgroundColor: cardBg, borderColor: borderClr }}>
          <TouchableOpacity
            onPress={() => { hapticSelection(); setIsMarket(true); }}
            style={{ flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center", backgroundColor: isMarket ? "rgba(0,229,255,0.2)" : "transparent" }}
          >
            <Text style={{ fontWeight: "600", color: isMarket ? "#00E5FF" : muted }}>Market</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { hapticSelection(); setIsMarket(false); }}
            style={{ flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center", backgroundColor: !isMarket ? "rgba(0,229,255,0.2)" : "transparent" }}
          >
            <Text style={{ fontWeight: "600", color: !isMarket ? "#00E5FF" : muted }}>Limit</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginHorizontal: 24, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 14, color: muted, marginBottom: 8 }}>You Sell</Text>
            <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, backgroundColor: cardBg, borderWidth: 1, borderColor: borderClr }}>
              <TextInput
                style={{ flex: 1, fontSize: 20, fontWeight: "600", color: fg }}
                placeholder="0.00"
                placeholderTextColor={muted}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
              />
              <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, backgroundColor: bg }}>
                <Text style={{ fontWeight: "bold", color: fg }}>{crypto.symbol}</Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <TouchableOpacity
                key={pct}
                onPress={() => handlePercentage(pct)}
                activeOpacity={0.8}
                style={{ flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center", backgroundColor: cardBg, borderWidth: 1, borderColor: borderClr }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: muted }}>
                  {pct === 1 ? "Max" : `${pct * 100}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ alignItems: "center" }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: cardBg, borderWidth: 1, borderColor: borderClr }}>
              <Feather name="arrow-down" size={16} color={muted} />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 14, color: muted, marginBottom: 8 }}>You Receive</Text>
            <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 12, backgroundColor: cardBg, borderWidth: 1, borderColor: borderClr }}>
              <TextInput
                style={{ flex: 1, fontSize: 20, fontWeight: "600", color: fg }}
                placeholder="0.00"
                placeholderTextColor={muted}
                value={fiatValue}
                editable={false}
              />
              <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, backgroundColor: bg }}>
                <Text style={{ fontWeight: "bold", color: fg }}>USD</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ marginHorizontal: 24, padding: 16, borderRadius: 12, backgroundColor: `${cardBg}80`, borderWidth: 1, borderColor: borderClr }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: muted }}>Rate</Text>
            <Text style={{ fontSize: 14, color: fg }}>1 {crypto.symbol} ≈ ${crypto.price.toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: muted }}>Fee (0.1%)</Text>
            <Text style={{ fontSize: 14, color: fg }}>${getFee()}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: borderClr, marginVertical: 8 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "600", color: fg }}>Total Payout</Text>
            <Text style={{ color: "#00E5FF", fontWeight: "bold", fontSize: 18 }}>${getTotalPayout()}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSell}
          activeOpacity={0.8}
          style={{ marginHorizontal: 24, paddingVertical: 16, borderRadius: 12, backgroundColor: "#00E5FF", alignItems: "center" }}
        >
          <Text style={{ color: "#0A1428", fontWeight: "bold", fontSize: 18 }}>Sell Now</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderTopColor: borderClr, minHeight: 400 }}>
            <View style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: borderClr, alignSelf: "center", marginBottom: 24 }} />

            <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 24, color: fg }}>Transaction Summary</Text>

            {isProcessing ? (
              <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 48 }}>
                <ActivityIndicator size="large" color="#00E5FF" />
                <Text style={{ color: muted, marginTop: 16 }}>Processing transaction...</Text>
              </View>
            ) : (
              <>
                {txStatus === "success" && (
                  <View style={{ alignItems: "center", marginBottom: 24 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(34,197,94,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <Feather name="check-circle" size={32} color="#22C55E" />
                    </View>
                    <Text style={{ color: "#22C55E", fontWeight: "bold", fontSize: 18 }}>Order Completed</Text>
                  </View>
                )}

                <View style={{ gap: 12, marginBottom: 24 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: muted }}>Sold</Text>
                    <Text style={{ fontWeight: "600", color: fg }}>{amount} {crypto.symbol}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: muted }}>Rate</Text>
                    <Text style={{ color: fg }}>${crypto.price.toLocaleString()}</Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: muted }}>Fees</Text>
                    <Text style={{ color: fg }}>${getFee()}</Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: borderClr }} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "bold", color: fg }}>Total</Text>
                    <Text style={{ color: "#00E5FF", fontWeight: "bold", fontSize: 18 }}>${getTotalPayout()}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    setAmount("");
                    setFiatValue("0.00");
                  }}
                  style={{ paddingVertical: 16, borderRadius: 12, backgroundColor: "#00E5FF", alignItems: "center" }}
                >
                  <Text style={{ color: "#0A1428", fontWeight: "bold", fontSize: 18 }}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
