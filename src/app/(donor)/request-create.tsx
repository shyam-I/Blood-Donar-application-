import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Megaphone, Calendar, Heart } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/context/AppState';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function DonorCreateEmergencyRequest() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { createBloodRequest } = useAppState();

  const [patientName, setPatientName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [unitsRequired, setUnitsRequired] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [requiredByDate, setRequiredByDate] = useState('');
  const [emergencyLevel, setEmergencyLevel] = useState('Normal');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};

    if (!patientName.trim()) tempErrors.patientName = 'Patient Name is required';
    if (!guardianName.trim()) tempErrors.guardianName = 'Guardian Name is required';
    if (!hospitalName.trim()) tempErrors.hospitalName = 'Hospital Name is required';
    if (!hospitalAddress.trim()) tempErrors.hospitalAddress = 'Hospital Address is required';
    if (!bloodGroup.trim()) tempErrors.bloodGroup = 'Select a blood group';
    
    if (!unitsRequired.trim() || isNaN(Number(unitsRequired)) || Number(unitsRequired) <= 0) {
      tempErrors.unitsRequired = 'Enter a valid number of units';
    }
    
    if (!contactNumber.trim() || contactNumber.length < 10) {
      tempErrors.contactNumber = 'Enter a valid contact number';
    }

    if (!requiredByDate.trim()) {
      tempErrors.requiredByDate = 'Required By Date is required';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(requiredByDate)) {
        tempErrors.requiredByDate = 'Use YYYY-MM-DD format (e.g. 2026-06-29)';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    createBloodRequest({
      patientName,
      guardianName,
      hospitalName,
      hospitalAddress,
      bloodGroup,
      unitsRequired: Number(unitsRequired),
      contactNumber,
      requiredByDate,
      emergencyLevel: emergencyLevel as any,
      notes,
    });

    Alert.alert(
      "Success",
      "Your blood request has been submitted successfully and is waiting for Admin approval.",
      [{ text: "OK", onPress: () => router.replace('/(donor)/dashboard') }]
    );
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const emergencyLevels = ['Normal', 'Urgent', 'Critical'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text }]}>Request Blood</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Submit a blood request for admin approval
            </Text>
          </View>

          {/* Form Card */}
          <Card style={styles.formCard}>
            <Input
              label="Patient Name"
              placeholder="Enter patient full name"
              value={patientName}
              onChangeText={setPatientName}
              error={errors.patientName}
            />

            <Input
              label="Guardian Name"
              placeholder="Enter guardian name"
              value={guardianName}
              onChangeText={setGuardianName}
              error={errors.guardianName}
            />

            <Input
              label="Hospital Name"
              placeholder="e.g. KMCH"
              value={hospitalName}
              onChangeText={setHospitalName}
              error={errors.hospitalName}
            />

            <Input
              label="Hospital Address / Location"
              placeholder="e.g. Avinashi Road, Coimbatore"
              value={hospitalAddress}
              onChangeText={setHospitalAddress}
              error={errors.hospitalAddress}
            />

            {/* Blood Group Selector */}
            <Text style={[styles.selectorLabel, { color: themeColors.textSecondary }]}>
              Required Blood Group
            </Text>
            <View style={styles.bloodGroupContainer}>
              {bloodGroups.map((bg) => (
                <Pressable
                  key={bg}
                  style={[
                    styles.bloodPill,
                    {
                      backgroundColor:
                        bloodGroup === bg ? themeColors.primary : themeColors.backgroundElement,
                      borderColor: themeColors.border,
                    },
                  ]}
                  onPress={() => setBloodGroup(bg)}
                >
                  <Text
                    style={[
                      styles.bloodPillText,
                      {
                        color: bloodGroup === bg ? '#FFFFFF' : themeColors.text,
                        fontWeight: bloodGroup === bg ? '700' : '500',
                      },
                    ]}
                  >
                    {bg}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.bloodGroup && (
              <Text style={[styles.errorText, { color: themeColors.error }]}>
                {errors.bloodGroup}
              </Text>
            )}

            <View style={styles.row}>
              <View style={styles.col}>
                <Input
                  label="Units Required"
                  placeholder="e.g. 3"
                  value={unitsRequired}
                  onChangeText={setUnitsRequired}
                  keyboardType="numeric"
                  error={errors.unitsRequired}
                />
              </View>
              <View style={styles.col}>
                <Input
                  label="Required By Date"
                  placeholder="YYYY-MM-DD"
                  value={requiredByDate}
                  onChangeText={setRequiredByDate}
                  error={errors.requiredByDate}
                />
              </View>
            </View>

            <Input
              label="Contact Phone Number"
              placeholder="e.g. +91 98765 98765"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
              error={errors.contactNumber}
            />

            {/* Emergency Level Selector */}
            <Text style={[styles.selectorLabel, { color: themeColors.textSecondary }]}>
              Emergency Level
            </Text>
            <View style={styles.bloodGroupContainer}>
              {emergencyLevels.map((lvl) => (
                <Pressable
                  key={lvl}
                  style={[
                    styles.bloodPill,
                    {
                      width: '30%',
                      backgroundColor:
                        emergencyLevel === lvl ? themeColors.primary : themeColors.backgroundElement,
                      borderColor: themeColors.border,
                    },
                  ]}
                  onPress={() => setEmergencyLevel(lvl)}
                >
                  <Text
                    style={[
                      styles.bloodPillText,
                      {
                        color: emergencyLevel === lvl ? '#FFFFFF' : themeColors.text,
                        fontWeight: emergencyLevel === lvl ? '700' : '500',
                      },
                    ]}
                  >
                    {lvl}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Input
              label="Additional Notes (Optional)"
              placeholder="e.g. Heart surgery. Immediate requirement."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
              inputStyle={{ height: 60, textAlignVertical: 'top' }}
            />

            <Button
              title="Submit Request"
              onPress={handleSubmit}
              size="large"
              style={styles.broadcastBtn}
              icon={<Megaphone size={20} color="#FFFFFF" />}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  formCard: {
    padding: 20,
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  bloodPill: {
    width: '22%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  bloodPillText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 4,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  broadcastBtn: {
    marginTop: 20,
  },
});
