import { Tabs } from "expo-router";
import { Home, TrendingUp, Wallet, ArrowDownLeft, User } from "lucide-react-native";
import { cssInterop, useColorScheme } from "nativewind";

cssInterop(Home, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(TrendingUp, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(Wallet, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(ArrowDownLeft, { className: { target: "style", nativeStyleToProp: { color: true } } });
cssInterop(User, { className: { target: "style", nativeStyleToProp: { color: true } } });

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#0A1428" : "#FFFFFF",
          borderTopColor: isDark ? "#334155" : "#E2E8F0",
        },
        tabBarActiveTintColor: "#00E5FF",
        tabBarInactiveTintColor: isDark ? "#94A3B8" : "#64748B",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Home className={focused ? "text-[#00E5FF]" : "text-[#94A3B8]"} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: "Markets",
          tabBarIcon: ({ focused }) => (
            <TrendingUp className={focused ? "text-[#00E5FF]" : "text-[#94A3B8]"} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="rates"
        options={{
          title: "Trade",
          tabBarIcon: ({ focused }) => (
            <ArrowDownLeft className={focused ? "text-[#00E5FF]" : "text-[#94A3B8]"} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ focused }) => (
            <Wallet className={focused ? "text-[#00E5FF]" : "text-[#94A3B8]"} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <User className={focused ? "text-[#00E5FF]" : "text-[#94A3B8]"} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
