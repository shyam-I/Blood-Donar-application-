import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Animated, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplet, Heart } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/Button';

export default function LandingScreen() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;

  // Animation values
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(30));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Fade in and slide up welcome content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Loop pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/login');
  };

  const bgGradient = (
    colorScheme === 'dark'
      ? ['#0F1016', '#1A080C', '#0F1016'] // Dark obsidian with subtle crimson tint
      : ['#FFF5F5', '#FFE3E3', '#FAFAFC'] // Warm rose-tinted light theme
  ) as [string, string, ...string[]];

  return (
    <LinearGradient colors={bgGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={['#EF233C', '#D90429']}
              style={styles.logoGradient}
            >
              <Droplet size={60} color="#FFFFFF" fill="#FFFFFF" />
              <View style={styles.heartOverlay}>
                <Heart size={20} color="#D90429" fill="#D90429" />
              </View>
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.title, { color: themeColors.text }]}>District Rotaract</Text>
          <Text style={[styles.subtitle, { color: themeColors.primary }]}>Blood Donor Cell</Text>
        </View>

        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor:
                colorScheme === 'dark' ? 'rgba(22, 23, 32, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            Saves Lives in a Pulse
          </Text>
          <Text style={[styles.cardDescription, { color: themeColors.textSecondary }]}>
            Connect instantly with emergency blood requests in your district. Register as a donor, track your eligibility, and earn recognition for your life-saving contributions.
          </Text>

          <Button
            title="Get Started"
            onPress={handleGetStarted}
            size="large"
            style={styles.button}
          />
        </Animated.View>

        <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
          Prepared by Zevyn Technologies
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  pulseCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(239, 35, 60, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#D90429',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  heartOverlay: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 4,
  },
  cardContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  button: {
    width: '100%',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 20,
    opacity: 0.6,
  },
});
