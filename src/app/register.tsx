import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DatePickerInput } from '@/components/DatePickerInput';
import { DropdownPicker } from '@/components/DropdownPicker';
import { Input } from '@/components/Input';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/context/AppState';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Droplets, FileText, Heart, Mail, MapPin, Phone, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const calculateAge = (dob: Date) => {
  const diffMs = Date.now() - dob.getTime();
  return Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
};

export default function RegisterScreen() {
  const themeColors = Colors.light;
  const { registerDonor, pendingGoogleAuth } = useAppState();

  const [step, setStep] = useState(1);

  // Step 1: Personal Info
  const [fullName, setFullName] = useState(pendingGoogleAuth?.name || '');
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState('Male'); // Segmented control default
  const [phoneNumber, setPhoneNumber] = useState('');
  const emailAddress = pendingGoogleAuth?.email || '';
  const [address, setAddress] = useState('');

  // Step 2: Rotaract Info
  const [clubName, setClubName] = useState('');
  const [clubDesignation, setClubDesignation] = useState('');

  // Step 3: Medical & Emergency Contact
  const [bloodGroup, setBloodGroup] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState<Date | null>(null);
  const [neverDonated, setNeverDonated] = useState(false);
  const [healthIssues, setHealthIssues] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!fullName.trim()) stepErrors.fullName = 'Full Name is required';
      if (!dob) {
        stepErrors.dob = 'Date of birth is required';
      } else {
        const computedAge = calculateAge(dob);
        if (computedAge < 18 || computedAge > 65) {
           stepErrors.dob = 'You must be between 18 and 65 years old to register';
        }
      }
      if (!phoneNumber.trim() || phoneNumber.length < 10) {
        stepErrors.phoneNumber = 'Enter a valid mobile number';
      }
    } else if (currentStep === 2) {
      // Skippable step
    } else if (currentStep === 3) {
      if (!bloodGroup.trim()) stepErrors.bloodGroup = 'Select a blood group';
      if (!neverDonated && !lastDonationDate) stepErrors.lastDonationDate = 'Select date or mark never donated';
      if (!parentContact.trim()) stepErrors.parentContact = 'Emergency contact name is required';
      if (!emergencyNumber.trim() || emergencyNumber.length < 10) {
        stepErrors.emergencyNumber = 'Enter a valid emergency contact number';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleRegister = async () => {
    if (!validateStep(3)) return;

    let computedAge = 18;
    if (dob) {
      computedAge = calculateAge(dob);
    }

    const success = await registerDonor({
      fullName,
      dob: dob ? dob.toISOString().split('T')[0] : '1990-01-01',
      age: computedAge,
      gender: gender,
      profession: 'Not Specified', // Defaults
      phoneNumber,
      emailAddress,
      googleId: pendingGoogleAuth?.id,
      profilePicture: pendingGoogleAuth?.picture,
      address,
      clubName,
      clubDesignation,
      bloodGroup,
      lastDonationDate: neverDonated ? 'Never' : (lastDonationDate ? lastDonationDate.toISOString().split('T')[0] : 'Never'),
      healthIssues: healthIssues.trim() || 'None',
      parentContact,
      emergencyNumber,
    });

    if (success) {
      Alert.alert('Registration Successful', 'Welcome to the lifesaver network!', [
        { text: 'OK' }, // Redirection will be handled automatically by useProtectedRoute
      ]);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const clubOptions = [
    'Rotaract Club of Coimbatore Central',
    'Rotaract Club of Chennai Midtown',
    'Rotaract Club of Madurai Greater',
    'Rotaract Club of Trichy Rockcity',
    'Rotaract Club of Salem Steel City'
  ];
  const designationOptions = ['President', 'Secretary', 'Treasurer', 'Member', 'Director', 'Chairperson', 'Other'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Logo Header */}
        <View style={styles.logoHeader}>
          <View style={styles.logoRow}>
            <Droplets size={28} color={themeColors.primary} />
            <Text style={[styles.logoText, { color: themeColors.primary }]}>BloodConnect</Text>
          </View>
          <Text style={[styles.logoSubtitle, { color: themeColors.textSecondary }]}>
            JOIN THE LIFESAVER NETWORK
          </Text>
        </View>

        {/* Top Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.stepsWrapper}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={styles.stepIndicatorWrapper}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor:
                        s <= step
                          ? themeColors.primary
                          : themeColors.backgroundSelected,
                    },
                  ]}
                >
                  <Text style={[styles.stepDotText, { color: s <= step ? '#FFFFFF' : themeColors.textSecondary }]}>
                    {s}
                  </Text>
                </View>
                {s < 3 && (
                  <View
                    style={[
                      styles.stepLine,
                      {
                        backgroundColor: s < step ? themeColors.primary : themeColors.backgroundSelected,
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
          <View style={styles.stepTextContainer}>
            <Text style={[styles.stepTextLabel, { color: themeColors.primary }]}>STEP</Text>
            <Text style={[styles.stepTextValue, { color: themeColors.primary }]}>{step} OF 3</Text>
            <Text style={[styles.stepTextName, { color: themeColors.primary }]}>
              {step === 1 ? 'PERSONAL' : step === 2 ? 'AFFILIATION' : 'MEDICAL'}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Card style={[styles.formCard, { borderRadius: 24 }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              Information Details
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Complete your profile to help us match you with the right donors or recipients in real-time.
            </Text>
            {step === 1 && (
              <View>
                <Input
                  label="Full Name"
                  placeholder="e.g. shyam I"
                  value={fullName}
                  onChangeText={setFullName}
                  error={errors.fullName}
                  icon={<User size={18} color={themeColors.textSecondary} />}
                />

                <Text style={[styles.selectorLabel, { color: themeColors.textSecondary }]}>GENDER</Text>
                <SegmentedControl
                  options={['Male', 'Female', 'Other', 'Unspecified']}
                  selectedValue={gender}
                  onSelect={setGender}
                />
                <View style={{ marginBottom: 16 }} />

                <DatePickerInput
                  label="Date of Birth"
                  value={dob}
                  onChange={setDob}
                />
                {errors.dob && <Text style={[styles.errorText, { color: themeColors.error }]}>{errors.dob}</Text>}
                {dob && !errors.dob && (
                  <Text style={{ fontSize: 13, color: themeColors.textSecondary, marginBottom: 16, marginLeft: 4 }}>
                    Calculated Age: {calculateAge(dob)} years
                  </Text>
                )}

                <Input
                  label="Mobile Number"
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, '').slice(0, 10))}
                  keyboardType="number-pad"
                  error={errors.phoneNumber}
                  icon={<Phone size={18} color={themeColors.textSecondary} />}
                />
                <View style={styles.readOnlyEmailContainer}>
                  <Text style={[styles.selectorLabel, { color: themeColors.textSecondary }]}>EMAIL ADDRESS</Text>
                  <View style={[styles.readOnlyEmailBox, { backgroundColor: themeColors.backgroundSelected }]}>
                    <Mail size={18} color={themeColors.textSecondary} />
                    <Text style={[styles.readOnlyEmailText, { color: themeColors.textSecondary }]}>
                      {emailAddress}
                    </Text>
                  </View>
                  <Text style={[styles.readOnlyEmailHelper, { color: themeColors.textSecondary }]}>
                    Verified by Google Sign-In
                  </Text>
                </View>
                <Input
                  label="Address (Optional)"
                  placeholder="Street, City, Pincode"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                  inputStyle={{ height: 40, textAlignVertical: 'top' }}
                  error={errors.address}
                  icon={<MapPin size={18} color={themeColors.textSecondary} style={{ marginTop: 12 }} />}
                  containerStyle={{ alignItems: 'flex-start' }}
                />
              </View>
            )}

            {step === 2 && (
              <View>
                <DropdownPicker
                  label="Club Name (Optional)"
                  placeholder="Search Club..."
                  value={clubName}
                  options={clubOptions}
                  onSelect={setClubName}
                  searchable={true}
                />

                <DropdownPicker
                  label="Designation (Optional)"
                  placeholder="Select Designation"
                  value={clubDesignation}
                  options={designationOptions}
                  onSelect={setClubDesignation}
                />
              </View>
            )}

            {step === 3 && (
              <View>
                <DropdownPicker
                  label="Blood Group"
                  placeholder="Select Blood Group"
                  value={bloodGroup}
                  options={bloodGroups}
                  onSelect={setBloodGroup}
                  error={errors.bloodGroup}
                />

                <DatePickerInput
                  label="Last Blood Donation Date"
                  value={lastDonationDate}
                  onChange={setLastDonationDate}
                  disabled={neverDonated}
                />
                {errors.lastDonationDate && <Text style={[styles.errorText, { color: themeColors.error, marginTop: -8 }]}>{errors.lastDonationDate}</Text>}

                <View style={styles.switchRow}>
                  <Text style={[styles.switchLabel, { color: themeColors.text }]}>I have never donated before</Text>
                  <Switch
                    value={neverDonated}
                    onValueChange={(val) => {
                      setNeverDonated(val);
                      if (val) setLastDonationDate(null);
                    }}
                    trackColor={{ false: themeColors.border, true: themeColors.primary + '80' }}
                    thumbColor={neverDonated ? themeColors.primary : '#f4f3f4'}
                  />
                </View>

                <Input
                  label="Diseases / Medical Conditions"
                  placeholder="e.g. None, Asthma, Diabetes"
                  value={healthIssues}
                  onChangeText={setHealthIssues}
                  icon={<FileText size={18} color={themeColors.textSecondary} />}
                />
                <Input
                  label="Emergency Contact Name"
                  placeholder="e.g. Richard Doe (Father)"
                  value={parentContact}
                  onChangeText={setParentContact}
                  error={errors.parentContact}
                  icon={<User size={18} color={themeColors.textSecondary} />}
                />
                <Input
                  label="Alternative Mobile Number (Emergency Contact)"
                  placeholder="e.g. 9876543211"
                  value={emergencyNumber}
                  onChangeText={(text) => setEmergencyNumber(text.replace(/[^0-9]/g, '').slice(0, 10))}
                  keyboardType="number-pad"
                  error={errors.emergencyNumber}
                  icon={<Phone size={18} color={themeColors.textSecondary} />}
                />
              </View>
            )}

            <View style={styles.buttonRow}>
              <View style={styles.halfButton}>
                <Button
                  title={step === 1 ? 'Back' : step === 2 ? 'Skip' : 'Back'}
                  variant="soft"
                  onPress={() => (step === 1 ? router.back() : step === 2 ? handleSkip() : handleBack())}
                  icon={step === 2 ? undefined : <ArrowLeft size={18} color={themeColors.primary} />}
                />
              </View>
              <View style={styles.halfButton}>
                <Button
                  title={step === 3 ? 'Register' : 'Next Step'}
                  variant="primary"
                  onPress={step === 3 ? handleRegister : handleNext}
                  icon={
                    step < 3
                      ? <ArrowRight size={18} color="#FFFFFF" />
                      : <Heart size={18} color="#FFFFFF" />
                  }
                />
              </View>
            </View>
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
  logoHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
  },
  logoSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 1.2,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 10,
  },
  stepsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepLine: {
    width: 30,
    height: 2,
    marginHorizontal: 8,
  },
  stepTextContainer: {
    alignItems: 'flex-end',
  },
  stepTextLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  stepTextValue: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: -2,
  },
  stepTextName: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  scrollContainer: {
    padding: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  formCard: {
    padding: 24,
    marginBottom: 40,
    borderWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  readOnlyEmailContainer: {
    marginBottom: 16,
  },
  readOnlyEmailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  readOnlyEmailText: {
    fontSize: 15,
    fontWeight: '500',
  },
  readOnlyEmailHelper: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
