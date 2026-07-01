import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAppState } from '@/context/AppState';

export function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, getCurrentUser } = useAppState();

  useEffect(() => {
    // Prevent redirecting while we are still checking if the user is authenticated from SecureStore
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(admin)' || segments[0] === '(donor)';
    const authStatus = isAuthenticated();

    if (!authStatus && inAuthGroup) {
      // Redirect to the login page if the user is not authenticated but tries to access a protected route.
      router.replace('/login');
    } else if (authStatus) {
      // If the user is authenticated, redirect them away from auth screens (like login or index)
      const isAuthScreen = segments[0] === 'login' || segments.length === 0 || (segments.length === 1 && segments[0] === 'index');
      if (isAuthScreen) {
        const user = getCurrentUser();
        if (user?.role === 'Admin') {
          router.replace('/(admin)/dashboard');
        } else if (user?.role === 'Donor') {
          router.replace('/(donor)/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, segments, getCurrentUser, router]);
}
