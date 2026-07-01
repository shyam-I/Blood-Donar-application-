import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'glass' | 'gradient' | 'emergency';
  gradientColors?: string[];
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  gradientColors,
}) => {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;

  if (variant === 'gradient' || variant === 'emergency') {
    const defaultColors = (
      variant === 'emergency'
        ? colorScheme === 'dark'
          ? ['#47121B', '#1C060A'] // Deep Crimson to dark obsidian
          : ['#FFCCD5', '#FFF0F2'] // Soft rose to light pink
        : colorScheme === 'dark'
        ? ['#1A1B23', '#0F1016']
        : ['#FFFFFF', '#F9FAFB']
    ) as [string, string, ...string[]];

    return (
      <LinearGradient
        colors={(gradientColors || defaultColors) as [string, string, ...string[]]}
        style={[
          styles.card,
          {
            borderColor: variant === 'emergency' ? themeColors.primary : themeColors.border,
            borderWidth: variant === 'emergency' ? 1.5 : 1,
            shadowColor: themeColors.shadow,
          },
          styles.shadow,
          style,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }

  if (variant === 'glass') {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colorScheme === 'dark' ? 'rgba(26, 27, 35, 0.75)' : 'rgba(255, 255, 255, 0.75)',
            borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
            borderWidth: 1,
            shadowColor: themeColors.shadow,
          },
          styles.shadow,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Default Card
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
          borderWidth: 1,
          shadowColor: themeColors.shadow,
        },
        styles.shadow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
  },
  shadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
