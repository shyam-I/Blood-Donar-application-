import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { ChevronDown, Search, X, Check } from 'lucide-react-native';

interface DropdownPickerProps {
  label?: string;
  placeholder?: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  searchable?: boolean;
  error?: string;
}

export const DropdownPicker: React.FC<DropdownPickerProps> = ({ 
  label, 
  placeholder = "Select an option", 
  value, 
  options, 
  onSelect,
  searchable = false,
  error
}) => {
  const themeColors = Colors.light;
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (val: string) => {
    onSelect(val);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text>}
      
      <Pressable 
        style={[
          styles.inputContainer, 
          { backgroundColor: themeColors.backgroundElement, borderColor: error ? themeColors.error : themeColors.border }
        ]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.inputText, { color: value ? themeColors.text : themeColors.textSecondary }]}>
          {value || placeholder}
        </Text>
        <ChevronDown size={20} color={themeColors.textSecondary} />
      </Pressable>
      
      {error && <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalContent, { backgroundColor: themeColors.background }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>{label || 'Select'}</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <X size={24} color={themeColors.textSecondary} />
              </Pressable>
            </View>

            {searchable && (
              <View style={styles.searchContainer}>
                <View style={[styles.searchInputWrapper, { backgroundColor: themeColors.backgroundElement, borderColor: themeColors.border }]}>
                  <Search size={18} color={themeColors.textSecondary} />
                  <TextInput
                    style={[styles.searchInput, { color: themeColors.text }]}
                    placeholder="Search..."
                    placeholderTextColor={themeColors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                      <X size={16} color={themeColors.textSecondary} />
                    </Pressable>
                  )}
                </View>
              </View>
            )}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === value;
                return (
                  <Pressable 
                    style={[styles.optionItem, { borderBottomColor: themeColors.border }]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[
                      styles.optionText, 
                      { 
                        color: isSelected ? themeColors.primary : themeColors.text,
                        fontWeight: isSelected ? '700' : '400' 
                      }
                    ]}>
                      {item}
                    </Text>
                    {isSelected && <Check size={20} color={themeColors.primary} />}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No results found</Text>
                </View>
              }
            />
            
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: themeColors.background }} />
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 15,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
});
