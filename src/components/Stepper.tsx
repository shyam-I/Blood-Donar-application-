import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { Minus, Plus } from 'lucide-react-native';

interface StepperProps {
  value: number;
  onValueChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export const Stepper: React.FC<StepperProps> = ({ value, onValueChange, min = 0, max = 100, step = 1, label }) => {
  const themeColors = Colors.light;

  const handleDecrement = () => {
    if (value - step >= min) {
      onValueChange(value - step);
    }
  };

  const handleIncrement = () => {
    if (value + step <= max) {
      onValueChange(value + step);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text>}
      <View style={[styles.stepperWrapper, { backgroundColor: themeColors.backgroundElement, borderColor: themeColors.border }]}>
        <Pressable 
          style={[styles.button, value <= min && styles.disabled]} 
          onPress={handleDecrement}
          disabled={value <= min}
        >
          <Minus size={20} color={value <= min ? themeColors.textSecondary : themeColors.text} />
        </Pressable>
        
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: themeColors.primary }]}>{value}</Text>
        </View>
        
        <Pressable 
          style={[styles.button, value >= max && styles.disabled]} 
          onPress={handleIncrement}
          disabled={value >= max}
        >
          <Plus size={20} color={value >= max ? themeColors.textSecondary : themeColors.text} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepperWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 50,
  },
  button: {
    width: 50,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
