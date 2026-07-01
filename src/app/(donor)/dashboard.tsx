import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, useColorScheme, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heart, Calendar, Award, AlertTriangle, ChevronRight, Bell } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useAppState, getDaysSince } from '@/context/AppState';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function DonorDashboard() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { currentUser, donors, requests, notifications, logout } = useAppState();

  // Find current donor details
  const currentDonor = donors.find((d) => d.id === currentUser?.donorId);

  // Fallback if no logged in donor (for development)
  const donor = currentDonor || donors[0] || {
    id: '',
    fullName: 'Guest Donor',
    clubName: 'Rotaract Club',
    clubDesignation: 'Member',
    profession: '',
    bloodGroup: 'O+',
    age: 18,
    phoneNumber: '',
    emailAddress: '',
    address: '',
    parentContact: '',
    emergencyNumber: '',
    lastDonationDate: 'Never',
    healthIssues: 'None',
    isActive: true,
    totalDonations: 0,
  };

  const daysSince = getDaysSince(donor.lastDonationDate);
  const isEligible = donor.lastDonationDate === 'Never' || daysSince >= 60;
  const daysRemaining = Math.max(0, 60 - daysSince);
  const eligibilityProgress = isEligible ? 1 : daysSince / 60;

  const activeRequests = requests.filter((r) => r.status === 'Open');
  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greetingText, { color: themeColors.textSecondary }]}>Hello,</Text>
            <Text style={[styles.nameText, { color: themeColors.text }]}>{donor.fullName}</Text>
            <Text style={[styles.clubText, { color: themeColors.primary }]} numberOfLines={1}>
              {donor.clubName}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.iconButton, { backgroundColor: themeColors.backgroundElement }]}
              onPress={() => router.push('/(donor)/requests')}
            >
              <Bell size={20} color={themeColors.text} />
              {unreadNotifications.length > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: themeColors.primary }]} />
              )}
            </Pressable>
            <Pressable onPress={handleLogout} style={styles.logoutTextBtn}>
              <Text style={[styles.logoutText, { color: themeColors.textSecondary }]}>Logout</Text>
            </Pressable>
          </View>
        </View>

        {/* Emergency Banner Alert */}
        {unreadNotifications.length > 0 && (
          <Pressable onPress={() => router.push('/(donor)/requests')}>
            <Card variant="emergency" style={styles.alertBanner}>
              <View style={styles.alertBannerContent}>
                <AlertTriangle size={20} color="#EF233C" />
                <Text style={[styles.alertBannerText, { color: colorScheme === 'dark' ? '#FFF' : '#D90429' }]}>
                  {unreadNotifications[0].title}
                </Text>
                <ChevronRight size={16} color={themeColors.primary} />
              </View>
            </Card>
          </Pressable>
        )}

        {/* Eligibility Card */}
        <Card variant="gradient" style={styles.eligibilityCard}>
          <View style={styles.eligibilityHeader}>
            <Text style={[styles.eligibilityTitle, { color: themeColors.text }]}>Donation Eligibility</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isEligible ? themeColors.success + '20' : themeColors.error + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: isEligible ? themeColors.success : themeColors.error },
                ]}
              >
                {isEligible ? 'Eligible' : 'On Cooldown'}
              </Text>
            </View>
          </View>

          <View style={styles.eligibilityBody}>
            {/* Progress Bar Display */}
            <View style={styles.progressSection}>
              <View style={styles.progressBarWrapper}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${eligibilityProgress * 100}%`,
                      backgroundColor: isEligible ? themeColors.success : themeColors.primary,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                  {isEligible ? 'Ready to save lives!' : `${daysSince} days since last donation`}
                </Text>
                {!isEligible && (
                  <Text style={[styles.daysLeftText, { color: themeColors.primary }]}>
                    {daysRemaining} days left
                  </Text>
                )}
              </View>
            </View>

            {isEligible ? (
              <View style={styles.eligibleAction}>
                <Text style={[styles.eligibleDesc, { color: themeColors.textSecondary }]}>
                  You are fully eligible to donate blood. Your single donation can save up to 3 lives.
                </Text>
                <Button
                  title="View Emergency Requests"
                  onPress={() => router.push('/(donor)/requests')}
                  size="medium"
                />
              </View>
            ) : (
              <View style={styles.eligibleAction}>
                <Text style={[styles.eligibleDesc, { color: themeColors.textSecondary }]}>
                  Rotaract safety guidelines require a 60-day interval between blood donations to protect your health.
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Request Blood Action */}
        <Button
          title="Request Blood"
          onPress={() => router.push('/(donor)/request-create')}
          size="large"
          style={{ marginBottom: 20 }}
          icon={<Heart size={20} color="#FFFFFF" fill="#FFFFFF" />}
        />

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Heart size={24} color={themeColors.primary} fill={themeColors.primary} />
            <Text style={[styles.statValue, { color: themeColors.text }]}>{donor.bloodGroup}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Blood Group</Text>
          </Card>

          <Card style={styles.statCard}>
            <Award size={24} color={themeColors.accent} fill={themeColors.accent + '30'} />
            <Text style={[styles.statValue, { color: themeColors.text }]}>{donor.totalDonations}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Total Donations</Text>
          </Card>

          <Card style={styles.statCard}>
            <Calendar size={24} color="#00B4D8" />
            <Text style={[styles.statValue, { color: themeColors.text, fontSize: 13 }]} numberOfLines={1}>
              {donor.lastDonationDate === 'Never' ? 'Never' : donor.lastDonationDate}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Last Donated</Text>
          </Card>
        </View>

        {/* Active Emergency Requests Slider */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Active Emergency Requests</Text>
          <Pressable onPress={() => router.push('/(donor)/requests')}>
            <Text style={[styles.seeAllText, { color: themeColors.primary }]}>See All</Text>
          </Pressable>
        </View>

        {activeRequests.length > 0 ? (
          <FlatList
            data={activeRequests}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push('/(donor)/requests')}>
                <Card variant="emergency" style={styles.requestSlideCard}>
                  <View style={styles.slideHeader}>
                    <View style={[styles.bloodBadge, { backgroundColor: themeColors.primary }]}>
                      <Text style={styles.bloodBadgeText}>{item.bloodGroup}</Text>
                    </View>
                    <View style={styles.urgencyPill}>
                      <Text style={styles.urgencyText}>URGENT</Text>
                    </View>
                  </View>
                  <Text style={[styles.patientName, { color: themeColors.text }]} numberOfLines={1}>
                    {item.patientName}
                  </Text>
                  <Text style={[styles.hospitalName, { color: themeColors.textSecondary }]} numberOfLines={2}>
                    {item.hospitalName}
                  </Text>
                  <View style={styles.slideFooter}>
                    <Text style={[styles.unitsText, { color: themeColors.text }]}>
                      Required: <Text style={{ color: themeColors.primary, fontWeight: '700' }}>{item.unitsRequired} units</Text>
                    </Text>
                  </View>
                </Card>
              </Pressable>
            )}
            contentContainerStyle={styles.sliderContainer}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              No active emergency blood requests at the moment.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  clubText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    maxWidth: 220,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  logoutTextBtn: {
    paddingVertical: 6,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
  },
  alertBanner: {
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  alertBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  eligibilityCard: {
    marginBottom: 20,
  },
  eligibilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eligibilityTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  eligibilityBody: {
    width: '100%',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBarWrapper: {
    height: 8,
    backgroundColor: 'rgba(141, 153, 174, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  daysLeftText: {
    fontSize: 12,
    fontWeight: '700',
  },
  eligibleAction: {
    width: '100%',
  },
  eligibleDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '31%',
    alignItems: 'center',
    padding: 14,
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sliderContainer: {
    gap: 12,
    paddingRight: 20,
  },
  requestSlideCard: {
    width: 200,
    padding: 14,
    marginVertical: 4,
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloodBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  urgencyPill: {
    backgroundColor: '#EF233C',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  urgencyText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  hospitalName: {
    fontSize: 12,
    lineHeight: 16,
    height: 32,
    marginBottom: 10,
  },
  slideFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(141, 153, 174, 0.1)',
    paddingTop: 8,
  },
  unitsText: {
    fontSize: 11,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
