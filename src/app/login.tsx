import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/context/AppState';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ArrowLeft, Droplets, Key, Phone, Shield, User } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { loginWithGoogle, donors } = useAppState();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    // Mock Google Sign-In Payload
    const mockGoogleUser = {
      id: `google_${Date.now()}`,
      email: 'new.donor@gmail.com', // Change this to test different scenarios
      name: 'Google User',
      picture: 'https://via.placeholder.com/150',
    };

    setTimeout(async () => {
      const result = await loginWithGoogle(mockGoogleUser);
      setLoading(false);
      
      if (result === 'New_User') {
        Alert.alert('Not Registered', 'Redirecting to registration...');
        router.replace('/register');
      }
      // If result is Admin or Donor, useProtectedRoute will handle the redirect automatically.
    }, 1000);
  };

  const handleQuickFillAdmin = () => {
    // Override the mock payload to simulate an admin login
    const adminGoogleUser = {
      id: `google_admin`,
      email: 'admin1@rotaract.org', 
      name: 'Admin Rajesh',
    };
    loginWithGoogle(adminGoogleUser);
  };

  const handleQuickFillDonor = (emailAddress: string, fullName: string) => {
    const donorGoogleUser = {
      id: `google_donor_${Date.now()}`,
      email: emailAddress, 
      name: fullName,
    };
    loginWithGoogle(donorGoogleUser);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={themeColors.text} />
            </Pressable>

            <View style={styles.logoHeader}>
              <View style={styles.logoRow}>
                <Droplets size={28} color={themeColors.primary} />
                <Text style={[styles.logoText, { color: themeColors.primary }]}>BloodConnect</Text>
              </View>
              <Text style={[styles.logoSubtitle, { color: themeColors.textSecondary }]}>
                JOIN THE LIFESAVER NETWORK
              </Text>
            </View>

            <Text style={[styles.headerTitle, { color: themeColors.text }]}>Welcome Back</Text>
            <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
              Log in to continue saving lives
            </Text>
          </View>

          <View style={[styles.tabContainer, { backgroundColor: themeColors.backgroundElement }]}>
            <View
              style={[
                styles.tab,
                styles.activeTab,
                { backgroundColor: themeColors.card },
              ]}
            >
              <User size={18} color={themeColors.primary} />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: themeColors.text,
                    fontWeight: '700',
                  },
                ]}
              >
                LOGIN
              </Text>
            </View>
          </View>

          {/* Form */}
          <Card style={[styles.formCard, { borderRadius: 24 }]}>
            {/* Google Login Button */}
            <Pressable
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <FontAwesome
                name="google"
                size={20}
                color="#DB4437"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.googleText}>
                Continue with Google
              </Text>
            </Pressable>

            {/* <View style={styles.registerLink}>
              <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>New donor? </Text>
              <Pressable onPress={() => router.push('/register')}>
                <Text style={{ color: themeColors.primary, fontWeight: '700', fontSize: 14 }}>
                  Register Here
                </Text>
              </Pressable>
            </View> */}
          </Card>

          {/* Quick Login Section for Testing */}
          <View style={styles.quickLoginSection}>
            <Text style={[styles.quickLoginTitle, { color: themeColors.textSecondary }]}>
              Quick Demo Accounts
            </Text>
            <View style={styles.quickCardContainer}>
              <Pressable
                style={[styles.quickPill, { backgroundColor: themeColors.backgroundElement }]}
                onPress={handleQuickFillAdmin}
              >
                <Shield size={14} color={themeColors.primary} />
                <Text style={[styles.quickPillText, { color: themeColors.text }]}>Admin</Text>
              </Pressable>

              {donors.slice(0, 2).map((d) => (
                <Pressable
                  key={d.id}
                  style={[styles.quickPill, { backgroundColor: themeColors.backgroundElement }]}
                  onPress={() => handleQuickFillDonor(d.emailAddress, d.fullName)}
                >
                  <User size={14} color={themeColors.primary} />
                  <Text style={[styles.quickPillText, { color: themeColors.text, fontWeight: '600' }]}>
                    {d.fullName}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
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
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  logoHeader: {
    alignItems: 'center',
    marginTop: 10,
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
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
  },
  formCard: {
    padding: 24,
    marginBottom: 30,
    borderWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  loginButton: {
    marginTop: 12,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  quickLoginSection: {
    marginTop: 10,
  },
  quickLoginTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  quickCardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickScroll: {
    flexDirection: 'row',
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  quickPillText: {
    fontSize: 13,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  orText: {
    marginHorizontal: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e3e6f0',
  },
});
