import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useNotifications, Notification } from "@/contexts/NotificationsContext";

const TYPE_CFG: Record<string, { bg: string; color: string; icon: string }> = {
  success: { bg: "rgba(17,141,69,0.12)",  color: "#118D45", icon: "check-circle" },
  info:    { bg: "rgba(16,114,234,0.12)", color: "#1072EA", icon: "info" },
  warning: { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", icon: "alert-triangle" },
  error:   { bg: "rgba(224,46,91,0.12)",  color: "#E02E5B", icon: "alert-circle" },
};

function NotificationItem({ item, onPress }: { item: Notification; onPress: () => void }) {
  const colors = useColors();
  const cfg = TYPE_CFG[item.type] || TYPE_CFG.info;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.item,
        {
          backgroundColor: item.read ? "transparent" : "rgba(16,114,234,0.04)",
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
        <Feather name={(item.icon || cfg.icon) as any} size={16} color={cfg.color} />
      </View>
      <View style={styles.textWrap}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.message, { color: colors.mutedForeground }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function NotificationsPanel() {
  const colors = useColors();
  const { notifications, unreadCount, showPanel, setShowPanel, markRead, markAllRead } =
    useNotifications();

  return (
    <Modal transparent visible={showPanel} animationType="fade" onRequestClose={() => setShowPanel(false)}>
      <Pressable style={styles.overlay} onPress={() => setShowPanel(false)}>
        <Pressable style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllRead} activeOpacity={0.8}>
                <Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowPanel(false)} activeOpacity={0.8}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {unreadCount > 0 && (
            <View style={[styles.countBadge, { backgroundColor: "rgba(16,114,234,0.1)" }]}>
              <Text style={[styles.countText, { color: colors.primary }]}>
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {notifications.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="bell-off" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No notifications yet
                </Text>
              </View>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  item={n}
                  onPress={() => markRead(n.id)}
                />
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-start", paddingTop: 100, paddingHorizontal: 16 },
  panel: { borderRadius: 20, borderWidth: 1, maxHeight: "70%", overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, gap: 12 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", flex: 1 },
  markAll: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  countBadge: { marginHorizontal: 16, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 8 },
  countText: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  list: { maxHeight: 400 },
  item: { flexDirection: "row", gap: 12, padding: 14, borderBottomWidth: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  textWrap: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 4 },
  message: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  time: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  empty: { padding: 40, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
