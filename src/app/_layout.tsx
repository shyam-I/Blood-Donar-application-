import { AppStatexProvider } from '@/context/AppState';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
function RootLayoutNav() {
  useProtectedRoute();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(donor)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(admin)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  let colorScheme = 'light' as 'light' | 'dark';

  return (
    <AppStatexProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <RootLayoutNav />
    </AppStatexProvider>
  );
}
