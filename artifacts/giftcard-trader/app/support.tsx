import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Platform, KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hapticLight } from "@/utils/haptics";

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
];

const INITIAL_MESSAGES: Message[] = [
  { id: "1", sender: "agent", text: "Hi there! 👋 I'm Alex, your PayVora support agent. How can I help you today?", time: "10:00 AM", status: "read" },
  { id: "2", sender: "agent", text: "You can ask me about transactions, account issues, KYC verification, or anything else. I'm here to help!", time: "10:00 AM", status: "read" },
];

let idCount = 100;
function genId() { return String(++idCount); }

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const getTime = () => {
    const d = new Date();
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
  };

  const simulateReply = useCallback((userText: string) => {
    setTyping(true);
    setTimeout(() => {
      const key = Object.keys(AGENT_RESPONSES).find((k) => userText.toLowerCase().includes(k));
      const text = key ? AGENT_RESPONSES[key] : DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
      setTyping(false);
      setMessages((prev) => [...prev, { id: genId(), sender: "agent", text, time: getTime(), status: "delivered" }]);
    }, 1800 + Math.random() * 800);
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    hapticLight();
    const text = input.trim();
    setInput("");
    const msg: Message = { id: genId(), sender: "user", text, time: getTime(), status: "sent" };
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: "delivered" } : m)), 800);
    simulateReply(text);
  }, [input, simulateReply]);

  const handleQuickReply = useCallback((qr: string) => {
    hapticLight();
    const msg: Message = { id: genId(), sender: "user", text: qr, time: getTime(), status: "sent" };
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: "delivered" } : m)), 800);
    simulateReply(qr.toLowerCase());
  }, [simulateReply]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, typing]);

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: topPad }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={s.agentAvatar}>
            <Text style={s.agentAvatarTxt}>A</Text>
          </View>
          <View>
            <Text style={s.headerName}>Support Agent</Text>
            <View style={s.onlineRow}>
              <View style={s.onlineDot} />
              <Text style={s.onlineTxt}>Online</Text>
            </View>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.msgScroll}
        contentContainerStyle={[s.msgContent, { paddingBottom: 12 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date divider */}
        <View style={s.dateDivider}>
          <View style={s.dateLine} />
          <Text style={s.dateTxt}>Today</Text>
          <View style={s.dateLine} />
        </View>

        {messages.map((msg) => {
          const isAgent = msg.sender === "agent";
          return (
            <View key={msg.id} style={[s.msgRow, isAgent ? s.msgRowAgent : s.msgRowUser]}>
              {isAgent && (
                <View style={s.agentBubbleAvatar}>
                  <Text style={s.agentBubbleAvatarTxt}>A</Text>
                </View>
              )}
              <View style={{ maxWidth: "75%", alignItems: isAgent ? "flex-start" : "flex-end" }}>
                <View style={[s.bubble, isAgent ? s.bubbleAgent : s.bubbleUser]}>
                  <Text style={[s.bubbleTxt, isAgent ? s.bubbleTxtAgent : s.bubbleTxtUser]}>{msg.text}</Text>
                </View>
                <View style={s.msgMeta}>
                  <Text style={s.msgTime}>{msg.time}</Text>
                  {!isAgent && (
                    <Text style={[s.msgStatus, msg.status === "read" && { color: "#1072EA" }]}>
                      {msg.status === "sent" ? "✓" : msg.status === "delivered" ? "✓✓" : "✓✓"}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <View style={[s.msgRow, s.msgRowAgent]}>
            <View style={s.agentBubbleAvatar}>
              <Text style={s.agentBubbleAvatarTxt}>A</Text>
            </View>
            <View style={[s.bubble, s.bubbleAgent, s.typingBubble]}>
              <Text style={s.typingDots}>• • •</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Replies */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.qrRow} style={s.qrScroll}>
        {QUICK_REPLIES.map((qr) => (
          <TouchableOpacity key={qr} onPress={() => handleQuickReply(qr)} activeOpacity={0.8} style={s.qrBtn}>
            <Text style={s.qrTxt}>{qr}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input Bar */}
      <View style={[s.inputBar, { paddingBottom: botPad + 8 }]}>
        <TouchableOpacity activeOpacity={0.8} style={s.attachBtn}>
          <Text style={s.attachEmoji}>📎</Text>
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message…"
          placeholderTextColor="#8E8E93"
          style={s.textInput}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={handleSend}
          activeOpacity={0.8}
          disabled={!input.trim()}
          style={[s.sendBtn, !input.trim() && { opacity: 0.4 }]}
        >
          <Text style={s.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F9FC" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#FFFFFF", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F7F9FC", alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 20, color: "#1C1C1E" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
  agentAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1072EA", alignItems: "center", justifyContent: "center" },
  agentAvatarTxt: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  headerName: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1C1C1E" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#118D45" },
  onlineTxt: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#118D45" },
  msgScroll: { flex: 1 },
  msgContent: { paddingHorizontal: 16, paddingTop: 16, gap: 4 },
  dateDivider: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  dateLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#E5E5EA" },
  dateTxt: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#8E8E93" },
  msgRow: { flexDirection: "row", marginBottom: 8 },
  msgRowAgent: { justifyContent: "flex-start", gap: 8, alignItems: "flex-end" },
  msgRowUser: { justifyContent: "flex-end" },
  agentBubbleAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#1072EA", alignItems: "center", justifyContent: "center" },
  agentBubbleAvatarTxt: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  bubble: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAgent: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 4, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  bubbleUser: { backgroundColor: "#1072EA", borderBottomRightRadius: 4 },
  bubbleTxt: { fontSize: 14, lineHeight: 20 },
  bubbleTxtAgent: { fontFamily: "Inter_400Regular", color: "#1C1C1E" },
  bubbleTxtUser: { fontFamily: "Inter_400Regular", color: "#FFFFFF" },
  msgMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3, paddingHorizontal: 4 },
  msgTime: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#8E8E93" },
  msgStatus: { fontSize: 11, color: "#8E8E93" },
  typingBubble: { paddingVertical: 12 },
  typingDots: { fontSize: 16, letterSpacing: 4, color: "#8E8E93" },
  qrScroll: { backgroundColor: "#FFFFFF", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E5EA" },
  qrRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  qrBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#E8F1FD", borderWidth: 1, borderColor: "#1072EA20" },
  qrTxt: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#1072EA" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: "#FFFFFF", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E5EA" },
  attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F7F9FC", alignItems: "center", justifyContent: "center" },
  attachEmoji: { fontSize: 18 },
  textInput: { flex: 1, maxHeight: 100, backgroundColor: "#F7F9FC", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular", color: "#1C1C1E" },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1072EA", alignItems: "center", justifyContent: "center" },
  sendIcon: { fontSize: 20, color: "#FFFFFF", fontWeight: "700" },
});
