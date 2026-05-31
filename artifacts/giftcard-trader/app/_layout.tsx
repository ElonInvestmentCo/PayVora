import "@/global.css";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { KycProvider } from "@/contexts/KycContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { NotificationsPanel } from "@/components/NotificationsPanel";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function SyncDarkMode() {
  const { isDark } = useTheme();
  const { setColorScheme } = useColorScheme();
  useEffect(() => {
    setColorScheme(isDark ? "dark" : "light");
  }, [isDark, setColorScheme]);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.backgroundColor = isDark ? "#0A1428" : "#F8FAFC";
      document.body.style.backgroundColor = isDark ? "#0A1428" : "#F8FAFC";
    }
  }, [isDark]);
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false, animation: "none" }} />
      <Stack.Screen name="auth" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="sell"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="buy"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="sell-crypto"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="buy-crypto"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="virtual-card"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="bills"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="transactions"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="kyc"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="leaderboard"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="support"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <WalletProvider>
                    <NotificationsProvider>
                      <KycProvider>
                        <SyncDarkMode />
                        <RootLayoutNav />
                        <NotificationsPanel />
                      </KycProvider>
                    </NotificationsProvider>
                  </WalletProvider>
                </KeyboardProvider>
              </GestureHandlerRootView>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
