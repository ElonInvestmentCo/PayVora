import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useNotifications } from "@/contexts/NotificationsContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  time: string;
  status?: "sent" | "delivered" | "read";
}

const QUICK_REPLIES = [
  "Check transaction",
  "KYC issue",
  "Payment failed",
  "Card frozen",
  "Withdrawal delay",
];

const AGENT_RESPONSES: Record<string, string> = {
  "check transaction": "Sure! Please share your transaction ID (e.g., TXN-XXXXXX) and I'll look it up for you right away.",
  "kyc issue": "I understand KYC can be frustrating. Could you tell me what specific issue you're facing? Is it a document upload error, a rejection, or a pending review?",
  "payment failed": "I'm sorry about the failed payment. This can happen due to insufficient balance, network issues, or bank restrictions. Let me check your recent transactions.",
  "card frozen": "I can help with your frozen card. For security purposes, can you confirm the last 4 digits of your virtual card? I'll review the freeze status.",
  "withdrawal delay": "Withdrawal delays can occur during high traffic periods. Standard processing takes 1-3 business days. Let me check your withdrawal status.",
};

const DEFAULT_RESPONSES = [
  "Thanks for reaching out! Let me look into that for you. Could you provide more details?",
  "I understand your concern. Our team is working on this and I'll have an update for you shortly.",
  "That's a great question! Let me check our system and get back to you with the most accurate information.",
  "I've noted your issue. A specialist will review this and we'll follow up within 24 hours if needed.",
  "Thanks for your patience! I'm pulling up your account details now to better assist you.",
];

const INITIAL_MESSAGES: Message[] = [
  { id: "1", text: "Hello! 👋 Welcome to GiftCard Trader support. How can I help you today?", sender: "agent", time: "10:00 AM" },
  { id: "2", text: "I'm here 24/7 to assist with transactions, KYC, payments, cards, and more.", sender: "agent", time: "10:00 AM" },
];

function getTimeNow(): string {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function StatusIcon({ status }: { status?: string }) {
  if (!status) return null;
  const color = status === "read" ? "#00E5FF" : status === "delivered" ? "#00FF88" : "#94A3B8";
  return (
    <View style={siStyles.row}>
      {status === "read" || status === "delivered" ? (
        <View style={siStyles.row}>
          <Feather name="check" size={10} color={color} style={{ marginRight: -6 }} />
          <Feather name="check" size={10} color={color} />
        </View>
      ) : (
        <Feather name="check" size={10} color={color} />
      )}
    </View>
  );
}
const siStyles = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center" } });

export default function SupportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;
  const scrollRef = useRef<ScrollView>(null);

  const { addNotification } = useNotifications();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const nextId = useRef(3);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const simulateReply = useCallback((userText: string) => {
    setTyping(true);
    scrollToEnd();

    const lower = userText.toLowerCase();
    let reply = DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
    for (const [key, val] of Object.entries(AGENT_RESPONSES)) {
      if (lower.includes(key)) { reply = val; break; }
    }

    setTimeout(() => {
      setMessages((prev) => prev.map((m) =>
        m.sender === "user" && m.status === "sent" ? { ...m, status: "delivered" } : m
      ));
    }, 800);

    setTimeout(() => {
      setMessages((prev) => prev.map((m) =>
        m.sender === "user" && m.status === "delivered" ? { ...m, status: "read" } : m
      ));
    }, 1500);

    setTimeout(() => {
      setTyping(false);
      const id = String(nextId.current++);
      setMessages((prev) => [...prev, { id, text: reply, sender: "agent", time: getTimeNow() }]);
      addNotification({ title: "Support Reply", message: reply.slice(0, 80) + (reply.length > 80 ? "..." : ""), type: "info" });
      scrollToEnd();
    }, 2000 + Math.random() * 1500);
  }, [scrollToEnd, addNotification]);

  const handleSend = useCallback((text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    const id = String(nextId.current++);
    setMessages((prev) => [...prev, { id, text: msg, sender: "user", time: getTimeNow(), status: "sent" }]);
    setInput("");
    scrollToEnd();
    simulateReply(msg);
  }, [input, scrollToEnd, simulateReply]);

  useEffect(() => { scrollToEnd(); }, []);

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Support Chat</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={[styles.onlineText, { color: "#00FF88" }]}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
          <Feather name="more-vertical" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.chatContent, { paddingBottom: 10 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date separator */}
        <View style={styles.dateSep}>
          <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dateText, { color: colors.mutedForeground, backgroundColor: colors.background }]}>Today</Text>
          <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
        </View>

        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          return (
            <View key={msg.id} style={[styles.bubbleRow, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
              {!isUser && (
                <View style={[styles.agentAvatar, { backgroundColor: "rgba(0,229,255,0.12)" }]}>
                  <Feather name="headphones" size={14} color={colors.primary} />
                </View>
              )}
              <View style={[
                styles.bubble,
                isUser
                  ? [styles.userBubble, { backgroundColor: "rgba(0,229,255,0.12)", borderColor: "rgba(0,229,255,0.2)" }]
                  : [styles.agentBubble, { backgroundColor: colors.card, borderColor: colors.border }],
              ]}>
                <Text style={[styles.bubbleText, { color: colors.foreground }]}>{msg.text}</Text>
                <View style={styles.bubbleMeta}>
                  <Text style={[styles.bubbleTime, { color: colors.mutedForeground }]}>{msg.time}</Text>
                  {isUser && <StatusIcon status={msg.status} />}
                </View>
              </View>
            </View>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <View style={[styles.bubbleRow, styles.bubbleLeft]}>
            <View style={[styles.agentAvatar, { backgroundColor: "rgba(0,229,255,0.12)" }]}>
              <Feather name="headphones" size={14} color={colors.primary} />
            </View>
            <View style={[styles.bubble, styles.agentBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1, { backgroundColor: colors.primary }]} />
                <View style={[styles.dot, styles.dot2, { backgroundColor: colors.primary }]} />
                <View style={[styles.dot, styles.dot3, { backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.typingText, { color: colors.mutedForeground }]}>Support is typing…</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Replies */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
        {QUICK_REPLIES.map((qr) => (
          <TouchableOpacity
            key={qr}
            onPress={() => handleSend(qr)}
            activeOpacity={0.8}
            style={[styles.quickChip, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.quickText, { color: colors.primary }]}>{qr}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: botPad + 8 }]}>
        <TouchableOpacity activeOpacity={0.8} style={[styles.attachBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="paperclip" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: input ? colors.primary : colors.border }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.textInput, { color: colors.foreground }]}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
        </View>
        <TouchableOpacity
          onPress={() => handleSend()}
          activeOpacity={0.8}
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.card, borderColor: input.trim() ? colors.primary : colors.border }]}
        >
          <Feather name="send" size={18} color={input.trim() ? "#0A1428" : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  headerCenter: { alignItems: "center", gap: 2 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00FF88" },
  onlineText: { fontSize: 11, fontFamily: "Inter_500Medium" },

  chatContent: { padding: 16, gap: 6 },

  dateSep: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 10 },
  dateLine: { flex: 1, height: 1 },
  dateText: { fontSize: 11, fontFamily: "Inter_500Medium", paddingHorizontal: 10 },

  bubbleRow: { flexDirection: "row", marginBottom: 6, maxWidth: "85%" },
  bubbleLeft: { alignSelf: "flex-start", alignItems: "flex-end", gap: 8 },
  bubbleRight: { alignSelf: "flex-end", justifyContent: "flex-end" },

  agentAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },

  bubble: { borderRadius: 16, padding: 12, borderWidth: 1, maxWidth: "100%" },
  userBubble: { borderBottomRightRadius: 4 },
  agentBubble: { borderBottomLeftRadius: 4 },

  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  bubbleMeta: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 4 },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular" },

  typingDots: { flexDirection: "row", gap: 4, marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, opacity: 0.5 },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.8 },
  typingText: { fontSize: 12, fontFamily: "Inter_400Regular" },

  quickRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  quickChip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  quickText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  inputBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1,
  },
  attachBtn: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  inputWrap: { flex: 1, borderRadius: 14, borderWidth: 1.5, height: 46, justifyContent: "center", paddingHorizontal: 14 },
  textInput: { fontSize: 14, fontFamily: "Inter_400Regular" },
  sendBtn: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
