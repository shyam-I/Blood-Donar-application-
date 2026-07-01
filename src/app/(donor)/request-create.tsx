import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Megaphone } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/context/AppState';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DropdownPicker } from '@/components/DropdownPicker';
import { SegmentedControl } from '@/components/SegmentedControl';
import { DatePickerInput } from '@/components/DatePickerInput';
import { TimePickerInput } from '@/components/TimePickerInput';
import { Stepper } from '@/components/Stepper';

export default function DonorCreateEmergencyRequest() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { createBloodRequest } = useAppState();

  const [patientName, setPatientName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [contactNumber, setContactNumber] = useState('');
  const [requiredByDate, setRequiredByDate] = useState<Date | null>(null);
  const [requiredByTime, setRequiredByTime] = useState<Date | null>(null);
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
    
    if (!contactNumber.trim() || contactNumber.length < 10) {
      tempErrors.contactNumber = 'Enter a valid contact number';
    }

    if (!requiredByDate) {
      tempErrors.requiredByDate = 'Required By Date is required';
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
      unitsRequired,
      contactNumber,
      requiredByDate: requiredByDate ? requiredByDate.toISOString().split('T')[0] : '',
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
  const hospitals = [
    'KMCH', 'Ganga Hospital', 'PSG Hospitals', 'Ramakrishna Hospital', 'KG Hospital', 'Apollo Hospitals'
  ];
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

            <DropdownPicker
              label="Hospital Name"
              placeholder="Select Hospital"
              value={hospitalName}
              options={hospitals}
              onSelect={setHospitalName}
              searchable={true}
              error={errors.hospitalName}
            />

            <Input
              label="Hospital Address / Location"
              placeholder="e.g. Avinashi Road, Coimbatore"
              value={hospitalAddress}
              onChangeText={setHospitalAddress}
              error={errors.hospitalAddress}
            />

            <DropdownPicker
              label="Required Blood Group"
              placeholder="Select Blood Group"
              value={bloodGroup}
              options={bloodGroups}
              onSelect={setBloodGroup}
              error={errors.bloodGroup}
            />

            <Stepper
              label="Units Required"
              value={unitsRequired}
              onValueChange={setUnitsRequired}
              min={1}
              max={20}
            />

            <View style={styles.row}>
              <View style={styles.col}>
                <DatePickerInput
                  label="Required By Date"
                  value={requiredByDate}
                  onChange={setRequiredByDate}
                />
                {errors.requiredByDate && <Text style={[styles.errorText, { color: themeColors.error, marginTop: -12 }]}>{errors.requiredByDate}</Text>}
              </View>
              <View style={styles.col}>
                <TimePickerInput
                  label="Required By Time"
                  value={requiredByTime}
                  onChange={setRequiredByTime}
                />
              </View>
            </View>

            <Input
              label="Contact Phone Number"
              placeholder="e.g. 9876598765"
              value={contactNumber}
              onChangeText={(text) => setContactNumber(text.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="number-pad"
              error={errors.contactNumber}
            />

            <Text style={[styles.selectorLabel, { color: themeColors.textSecondary }]}>
              Emergency Level
            </Text>
            <SegmentedControl
              options={emergencyLevels}
              selectedValue={emergencyLevel}
              onSelect={setEmergencyLevel}
            />
            <View style={{ marginBottom: 16 }} />

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
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
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
