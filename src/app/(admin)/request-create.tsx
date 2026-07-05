import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
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
import { DatePickerInput } from '@/components/DatePickerInput';
import { TimePickerInput } from '@/components/TimePickerInput';
import { Stepper } from '@/components/Stepper';
import { SegmentedControl } from '@/components/SegmentedControl';

export default function CreateEmergencyRequest() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { createBloodRequest } = useAppState();

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [locationLink, setLocationLink] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [contactNumber1, setContactNumber1] = useState('');
  const [contactNumber2, setContactNumber2] = useState('');
  const [contactNumber3, setContactNumber3] = useState('');
  const [medicalCondition, setMedicalCondition] = useState('');
  const [requiredByDate, setRequiredByDate] = useState<Date | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};

    if (!patientName.trim()) tempErrors.patientName = 'Patient Name is required';
    if (!patientAge.trim() || isNaN(Number(patientAge))) tempErrors.patientAge = 'Enter a valid age';
    if (!hospitalName.trim()) tempErrors.hospitalName = 'Hospital Name is required';
    if (!bloodGroup.trim()) tempErrors.bloodGroup = 'Select a blood group';
    
    if (!contactNumber1.trim() || contactNumber1.length < 10) {
      tempErrors.contactNumber1 = 'Enter a valid primary contact number';
    }

    if (!requiredByDate) {
      tempErrors.requiredByDate = 'Required By Date is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleBroadcast = () => {
    if (!validateForm()) return;

    const fullNotes = JSON.stringify({
      age: patientAge,
      condition: medicalCondition
    });

    const allContacts = [contactNumber1, contactNumber2, contactNumber3]
      .filter(c => c && c.trim().length > 0)
      .join(', ');

    createBloodRequest({
      patientName,
      hospitalName,
      hospitalAddress: locationLink,
      bloodGroup,
      unitsRequired,
      contactNumber: allContacts,
      requiredByDate: requiredByDate ? requiredByDate.toISOString().split('T')[0] : '',
      notes: fullNotes,
    });

    // Clear form
    setPatientName('');
    setPatientAge('');
    setHospitalName('');
    setLocationLink('');
    setBloodGroup('');
    setUnitsRequired(1);
    setContactNumber1('');
    setContactNumber2('');
    setContactNumber3('');
    setMedicalCondition('');
    setRequiredByDate(null);

    // Go back to dashboard
    router.replace('/(admin)/dashboard');
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
            <Text style={[styles.title, { color: themeColors.text }]}>Create Emergency Request</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Broadcast an urgent blood requirement to all matching donors in the district
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
              label="Age"
              placeholder="e.g. 35"
              value={patientAge}
              onChangeText={(text) => setPatientAge(text.replace(/[^0-9]/g, '').slice(0, 3))}
              keyboardType="number-pad"
              error={errors.patientAge}
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
              max={50}
            />

            <Input
              label="Problem / Medical Condition"
              placeholder="e.g. Heart Surgery, Dengue, Accident"
              value={medicalCondition}
              onChangeText={setMedicalCondition}
              multiline
              numberOfLines={2}
              inputStyle={{ height: 60, textAlignVertical: 'top' }}
            />

            <Input
              label="Contact Number 1"
              placeholder="e.g. 9876598765"
              value={contactNumber1}
              onChangeText={(text) => setContactNumber1(text.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="number-pad"
              error={errors.contactNumber1}
            />
            
            <Input
              label="Contact Number 2 (Optional)"
              placeholder="e.g. 9876543210"
              value={contactNumber2}
              onChangeText={(text) => setContactNumber2(text.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="number-pad"
            />
            
            <Input
              label="Contact Number 3 (Optional)"
              placeholder="e.g. 9111122222"
              value={contactNumber3}
              onChangeText={(text) => setContactNumber3(text.replace(/[^0-9]/g, '').slice(0, 10))}
              keyboardType="number-pad"
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
              label="Location Link (Optional)"
              placeholder="Google Maps URL"
              value={locationLink}
              onChangeText={setLocationLink}
            />

            <DatePickerInput
              label="Required Date"
              value={requiredByDate}
              onChange={setRequiredByDate}
            />
            {errors.requiredByDate && <Text style={[styles.errorText, { color: themeColors.error }]}>{errors.requiredByDate}</Text>}

            <Button
              title="Broadcast Emergency Request"
              onPress={handleBroadcast}
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
