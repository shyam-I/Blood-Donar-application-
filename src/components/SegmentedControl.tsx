import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface SegmentedControlProps {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, selectedValue, onSelect }) => {
  const themeColors = Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.backgroundElement }]}>
      {options.map((option) => {
        const isSelected = option === selectedValue;
        return (
          <Pressable
            key={option}
            style={[
              styles.segment,
              isSelected && { backgroundColor: themeColors.primary },
            ]}
            onPress={() => onSelect(option)}
          >
            <Text
              style={[
                styles.text,
                { color: isSelected ? '#FFFFFF' : themeColors.textSecondary, fontWeight: isSelected ? '700' : '500' },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    width: '100%',
    flexWrap: 'wrap',
    gap: 4,
  },
  segment: {
    flex: 1,
    minWidth: '20%',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
  },
});
