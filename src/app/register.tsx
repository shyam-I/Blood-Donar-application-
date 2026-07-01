import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/context/AppState';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Award, Briefcase, Calendar, ChevronDown, Droplets, FileText, Heart, Mail, MapPin, Phone, User, Users } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { registerDonor } = useAppState();

  const [step, setStep] = useState(1);

  // Step 1: Personal Info
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState(''); // Serves as Age/DOB in UI to avoid redesign
  const [gender, setGender] = useState(''); // Replaces profession in UI state visually but using same layout
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [address, setAddress] = useState(''); // Optional if kept

  // Step 2: Rotaract Info
  const [clubName, setClubName] = useState('');
  const [clubDesignation, setClubDesignation] = useState('');

  // Step 3: Medical & Emergency Contact
  const [bloodGroup, setBloodGroup] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [healthIssues, setHealthIssues] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [emergencyNumber, setEmergencyNumber] = useState('');

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number) => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!fullName.trim()) stepErrors.fullName = 'Full Name is required';
      if (!phoneNumber.trim() || phoneNumber.length < 10) {
        stepErrors.phoneNumber = 'Enter a valid mobile number';
      }
      if (!emailAddress.trim() || !emailAddress.includes('@')) {
        stepErrors.emailAddress = 'Enter a valid email address';
      }
    } else if (currentStep === 2) {
      // Skippable step
    } else if (currentStep === 3) {
      if (!bloodGroup.trim()) stepErrors.bloodGroup = 'Select a blood group';
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

    const success = await registerDonor({
      fullName,
      age: Number(age) || 18,
      gender: gender || 'Not Specified',
      profession: 'Not Specified', // Defaults
      phoneNumber,
      emailAddress,
      address,
      clubName,
      clubDesignation,
      bloodGroup,
      lastDonationDate: lastDonationDate.trim() || 'Never',
      healthIssues: healthIssues.trim() || 'None',
      parentContact,
      emergencyNumber,
    });

    if (success) {
      Alert.alert('Registration Successful', 'Mock token generated. Redirecting to Login...', [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChangeText={setFullName}
                  error={errors.fullName}
                  icon={<User size={18} color={themeColors.textSecondary} />}
                />

                <View style={styles.row}>
                  <View style={styles.halfFlex}>
                    <Input
                      label="Gender"
                      placeholder="e.g. Male"
                      value={gender}
                      onChangeText={setGender}
                      error={errors.gender}
                      icon={<Briefcase size={18} color={themeColors.textSecondary} />}
                    />
                  </View>
                  <View style={styles.halfFlex}>
                    <Input
                      label="Age / DOB"
                      placeholder="25"
                      value={age}
                      onChangeText={setAge}
                      keyboardType="numeric"
                      error={errors.age}
                      rightIcon={<ChevronDown size={18} color={themeColors.textSecondary} />}
                    />
                  </View>
                </View>

                <Input
                  label="Mobile Number"
                  placeholder="e.g. +91 98765 43210"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  error={errors.phoneNumber}
                  icon={<Phone size={18} color={themeColors.textSecondary} />}
                />
                <Input
                  label="Email Address"
                  placeholder="e.g. john.doe@gmail.com"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.emailAddress}
                  icon={<Mail size={18} color={themeColors.textSecondary} />}
                />
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
                <Input
                  label="Club Name (Optional)"
                  placeholder="e.g. Red Cross"
                  value={clubName}
                  onChangeText={setClubName}
                  icon={<Users size={18} color={themeColors.textSecondary} />}
                />
                <Input
                  label="Designation (Optional)"
                  placeholder="e.g. Volunteer"
                  value={clubDesignation}
                  onChangeText={setClubDesignation}
                  icon={<Award size={18} color={themeColors.textSecondary} />}
                />
              </View>
            )}

            {step === 3 && (
              <View>
                {/* Blood Group Selector */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: 4 }}>
                  <Droplets size={16} color={themeColors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={[styles.selectorLabel, { color: themeColors.textSecondary, marginBottom: 0, marginLeft: 0 }]}>
                    BLOOD GROUP
                  </Text>
                </View>
                <View style={styles.bloodGroupContainer}>
                  {bloodGroups.map((bg) => (
                    <Pressable
                      key={bg}
                      style={[
                        styles.bloodPill,
                        {
                          backgroundColor:
                            bloodGroup === bg ? themeColors.primary : '#FFFFFF',
                          borderColor: bloodGroup === bg ? themeColors.primary : themeColors.border,
                        },
                      ]}
                      onPress={() => setBloodGroup(bg)}
                    >
                      <Text
                        style={[
                          styles.bloodPillText,
                          {
                            color: bloodGroup === bg ? '#FFFFFF' : themeColors.text,
                            fontWeight: bloodGroup === bg ? '700' : '600',
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

                <Input
                  label="Last Blood Donation Date"
                  placeholder="YYYY-MM-DD (or leave blank)"
                  value={lastDonationDate}
                  onChangeText={setLastDonationDate}
                  icon={<Calendar size={18} color={themeColors.textSecondary} />}
                />
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
                  label="Emergency Contact Number"
                  placeholder="e.g. +91 98765 43211"
                  value={emergencyNumber}
                  onChangeText={setEmergencyNumber}
                  keyboardType="phone-pad"
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfFlex: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  bloodPill: {
    width: '22%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
  },
  bloodPillText: {
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 4,
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
});
