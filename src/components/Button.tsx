import React, { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  useColorScheme,
  ViewStyle,
} from 'react-native';
import { Colors } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'soft';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;

  // Animation ref
  const [scaleValue] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  // Styles based on variant
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: themeColors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: themeColors.backgroundElement,
        };
      case 'soft':
        return {
          backgroundColor: themeColors.primaryLight || themeColors.backgroundElement,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: themeColors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          paddingHorizontal: 0,
        };
    }
  };

  // Text colors based on variant
  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return {
          color: '#FFFFFF',
          fontWeight: '700',
        };
      case 'secondary':
        return {
          color: themeColors.text,
          fontWeight: '600',
        };
      case 'soft':
        return {
          color: themeColors.primary,
          fontWeight: '700',
        };
      case 'outline':
        return {
          color: themeColors.primary,
          fontWeight: '700',
        };
      case 'text':
        return {
          color: themeColors.primary,
          fontWeight: '600',
        };
    }
  };

  // Padding & Height based on size
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 };
      case 'medium':
        return { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 28, borderRadius: 16 };
    }
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleValue }] },
        style,
      ]}
    >
      <Pressable
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={disabled || loading ? undefined : handlePressIn}
        onPressOut={disabled || loading ? undefined : handlePressOut}
        style={({ pressed }) => [
          styles.button,
          getVariantStyle(),
          getSizeStyle(),
          disabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : themeColors.primary} size="small" />
        ) : (
          <>
            {icon && <Animated.View style={styles.iconContainer}>{icon}</Animated.View>}
            <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: 8,
  },
});
