import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/theme';
import { Calendar } from 'lucide-react-native';

interface DatePickerInputProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({ label, value, onChange, placeholder = 'Select Date', disabled }) => {
  const themeColors = Colors.light;
  const [show, setShow] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text>}
      <Pressable 
        style={[
          styles.inputContainer, 
          { backgroundColor: themeColors.backgroundElement, borderColor: themeColors.border },
          disabled && styles.disabled
        ]} 
        onPress={() => !disabled && setShow(true)}
      >
        <Text style={[styles.inputText, { color: value ? themeColors.text : themeColors.textSecondary }]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Calendar size={20} color={themeColors.textSecondary} />
      </Pressable>
      
      {show && !disabled && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputText: {
    fontSize: 15,
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
