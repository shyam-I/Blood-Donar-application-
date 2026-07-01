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

    const segs = segments as string[];
    const inAuthGroup = segs[0] === '(admin)' || segs[0] === '(donor)';
    const authStatus = isAuthenticated();

    if (!authStatus && inAuthGroup) {
      // Redirect to the login page if the user is not authenticated but tries to access a protected route.
      router.replace('/login');
    } else if (authStatus) {
      // If the user is authenticated, redirect them away from auth screens (like login or index)
      const isAuthScreen = segs[0] === 'login' || segs.length === 0 || (segs.length === 1 && (segs[0] === 'index' || segs[0] === ''));
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
