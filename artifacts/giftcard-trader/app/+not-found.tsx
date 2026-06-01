import { Link, Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: "Not Found", headerShown: false }} />
      <View style={s.card}>
        <View style={s.badge}>
          <Text style={s.emoji}>🧭</Text>
        </View>
        <Text style={s.code}>404</Text>
        <Text style={s.title}>Page Not Found</Text>
        <Text style={s.sub}>This screen doesn't exist or may have moved.</Text>
        <Link href="/" asChild>
          <View style={s.btn}>
            <Text style={s.btnTxt}>Return to Home</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F2F7", alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 24, padding: 32, alignItems: "center", width: "100%",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  badge: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#EEF3FF", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  emoji: { fontSize: 36 },
  code: { fontSize: 52, fontFamily: "Inter_700Bold", color: "#1A5AFF", letterSpacing: -2, marginBottom: 4 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#1C1C1E", marginBottom: 8, letterSpacing: -0.3 },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#8E8E93", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  btn: { backgroundColor: "#1A5AFF", borderRadius: 12, paddingVertical: 13, paddingHorizontal: 32 },
  btnTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
});
