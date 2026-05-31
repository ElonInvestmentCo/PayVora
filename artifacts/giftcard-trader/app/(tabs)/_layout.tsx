import { Tabs } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";

const ACTIVE = "#1A5AFF";
const INACTIVE = "#9A9A9A";

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" fill={active ? `${ACTIVE}22` : "none"} />
      <Path d="M9 21V12h6v9" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

function MarketsIcon({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="12" width="4" height="9" rx="1" stroke={c} strokeWidth={1.8} fill={active ? `${ACTIVE}22` : "none"} />
      <Rect x="10" y="6" width="4" height="15" rx="1" stroke={c} strokeWidth={1.8} fill={active ? `${ACTIVE}22` : "none"} />
      <Rect x="18" y="2" width="4" height="19" rx="1" stroke={c} strokeWidth={1.8} fill={active ? `${ACTIVE}22` : "none"} />
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
      <Rect x="2" y="5" width="20" height="14" rx="2" stroke={c} strokeWidth={1.8} fill={active ? `${ACTIVE}22` : "none"} />
      <Path d="M16 12a1 1 0 100 2 1 1 0 000-2z" fill={c} />
      <Path d="M2 9h20" stroke={c} strokeWidth={1.8} />
    </Svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={c} strokeWidth={1.8} fill={active ? `${ACTIVE}22` : "none"} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 0,
          height: 82,
          paddingBottom: 24,
          paddingTop: 10,
        },
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter_600SemiBold",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <HomeIcon active={focused} />,
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: "Markets",
          tabBarIcon: ({ focused }) => <MarketsIcon active={focused} />,
        }}
      />
      <Tabs.Screen
        name="rates"
        options={{
          title: "Trade",
          tabBarIcon: ({ focused }) => <TradeIcon active={focused} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ focused }) => <WalletIcon active={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <ProfileIcon active={focused} />,
        }}
      />
      <Tabs.Screen name="transactions" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
