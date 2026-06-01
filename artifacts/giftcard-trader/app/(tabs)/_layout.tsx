import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Svg, { Path, Circle, Rect } from "react-native-svg";

const ACTIVE = "#1A5AFF";
const INACTIVE = "rgba(255,255,255,0.45)";

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" fill={active ? `${ACTIVE}30` : "none"} />
      <Path d="M9 21V12h6v9" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function MarketsIcon({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="12" width="4" height="9" rx="1" stroke={c} strokeWidth={1.8} fill={active ? `${ACTIVE}30` : "none"} />
      <Rect x="10" y="6" width="4" height="15" rx="1" stroke={c} strokeWidth={1.8} fill={active ? `${ACTIVE}30` : "none"} />
      <Rect x="18" y="2" width="4" height="19" rx="1" stroke={c} strokeWidth={1.8} fill={active ? `${ACTIVE}30` : "none"} />
    </Svg>
  );
}

function TradeIcon({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M7 16V8m0 0L4 11m3-3l3 3" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 8v8m0 0l3-3m-3 3l-3-3" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function WalletIcon({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="5" width="20" height="14" rx="2" stroke={c} strokeWidth={1.8} fill={active ? `${ACTIVE}30` : "none"} />
      <Path d="M16 12a1 1 0 100 2 1 1 0 000-2z" fill={c} />
      <Path d="M2 9h20" stroke={c} strokeWidth={1.8} />
    </Svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={c} strokeWidth={1.8} fill={active ? `${ACTIVE}30` : "none"} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const TABS_CONFIG = [
  { name: "index",   title: "Home",    Icon: HomeIcon },
  { name: "markets", title: "Markets", Icon: MarketsIcon },
  { name: "rates",   title: "Trade",   Icon: TradeIcon },
  { name: "wallet",  title: "Wallet",  Icon: WalletIcon },
  { name: "profile", title: "Profile", Icon: ProfileIcon },
];

const webBlurStyle: object = Platform.OS === "web"
  ? ({ backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" } as object)
  : {};

function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <View style={[s.barContainer, { paddingBottom: bottomInset }]} pointerEvents="box-none">
      <View style={[s.pill, webBlurStyle]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const cfg = TABS_CONFIG.find((t) => t.name === route.name);
          if (!cfg) return null;

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              style={[s.tab, isFocused && s.tabActive]}
            >
              <cfg.Icon active={isFocused} />
              <Text style={[s.label, isFocused && s.labelActive]}>{cfg.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"   options={{ title: "Home" }} />
      <Tabs.Screen name="markets" options={{ title: "Markets" }} />
      <Tabs.Screen name="rates"   options={{ title: "Trade" }} />
      <Tabs.Screen name="wallet"  options={{ title: "Wallet" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="transactions" options={{ href: null }} />
      <Tabs.Screen name="settings"     options={{ href: null }} />
    </Tabs>
  );
}

const s = StyleSheet.create({
  barContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(14, 14, 22, 0.84)",
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 6,
    paddingVertical: 8,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 20,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 28,
  },
  tabActive: {
    backgroundColor: "rgba(26, 90, 255, 0.18)",
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: INACTIVE,
  },
  labelActive: {
    color: ACTIVE,
  },
});
