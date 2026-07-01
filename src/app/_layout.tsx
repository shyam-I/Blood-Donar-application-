import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { AppStateProvider } from '@/context/AppState';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

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
    <AppStateProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <RootLayoutNav />
    </AppStateProvider>
  );
}
