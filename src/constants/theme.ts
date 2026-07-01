/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// @ts-ignore
import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1F2937',
    background: '#FAFAFC',
    backgroundElement: '#F3F4F6', // Used for input background
    backgroundSelected: '#E5E7EB',
    textSecondary: '#6B7280',
    primary: '#B30000', // Deep red matching the logo
    primaryLight: '#FFCCD5',
    secondary: '#EF233C',
    accent: '#FFB703',
    success: '#10B981',
    error: '#EF4444',
    card: '#FFFFFF',
    border: '#E5E7EB',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    text: '#F3F4F6',
    background: '#0F1016',
    backgroundElement: '#1A1B23',
    backgroundSelected: '#2A2C39',
    textSecondary: '#9CA3AF',
    primary: '#EF233C',
    primaryLight: '#47121B',
    secondary: '#D90429',
    accent: '#FFB703',
    success: '#34D399',
    error: '#F87171',
    card: '#161720',
    border: '#2A2C39',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
