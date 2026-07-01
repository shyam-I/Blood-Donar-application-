import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Users, Heart, AlertCircle, Calendar, LogOut } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useAppState, getDaysSince } from '@/context/AppState';
import { Card } from '@/components/Card';
import { BarChart, BloodDistributionGrid, ClubLeaderboard } from '@/components/CustomChart';

export default function AdminDashboard() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { donors, requests, donations, currentUser, logout, approveBloodRequest, rejectBloodRequest } = useAppState();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // 1. Calculate the total number of donors, donations, and active requests
  const totalDonors = donors.length;
  const totalDonationsCount = donations.length;

  const pendingRequestsCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedRequestsCount = requests.filter((r) => r.status === 'Approved' || r.status === 'Partially Filled').length;
  const completedRequestsCount = requests.filter((r) => r.status === 'Completed').length;
  const rejectedRequestsCount = requests.filter((r) => r.status === 'Rejected').length;
  


  const activeAvailableDonors = donors.filter((d) => {
    const daysSince = getDaysSince(d.lastDonationDate);
    const isEligible = d.lastDonationDate === 'Never' || daysSince >= 90;
    return d.isActive && isEligible;
  }).length;

  // 2. Calculate blood group percentages for the pie chart
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const bloodGroupStats = bloodGroups.map((group) => {
    const count = donors.filter((d) => d.bloodGroup === group).length;
    const percentage = totalDonors > 0 ? Math.round((count / totalDonors) * 100) : 0;
    return { group, count, percentage };
  });

  // 3. Prepare the data for the monthly donations bar chart
  const monthlyData = [
    { label: 'Jan', value: 12 },
    { label: 'Feb', value: 18 },
    { label: 'Mar', value: 15 },
    { label: 'Apr', value: 24 },
    { label: 'May', value: 20 },
    { label: 'Jun', value: totalDonationsCount + 5 }, // Adds current actual donations to June
  ];

  // 4. Find out which Rotaract clubs have the most donations
  const clubDonationMap: Record<string, number> = {};
  donors.forEach((d) => {
    const club = d.clubName || 'Independent Donors';
    clubDonationMap[club] = (clubDonationMap[club] || 0) + d.totalDonations;
  });
  const clubLeaderboardData = Object.keys(clubDonationMap)
    .map((clubName) => ({
      clubName,
      donations: clubDonationMap[clubName],
    }))
    .sort((a, b) => b.donations - a.donations)
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  // 5. Get the 3 most recently registered donors to show on the dashboard
  const recentRegistrations = donors.slice(0, 3);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: themeColors.textSecondary }]}>District Admin Portal</Text>
            <Text style={[styles.adminName, { color: themeColors.text }]}>{currentUser?.name || 'Administrator'}</Text>
          </View>
          <Pressable
            style={[styles.logoutBtn, { backgroundColor: themeColors.backgroundElement }]}
            onPress={handleLogout}
          >
            <LogOut size={18} color={themeColors.primary} />
            <Text style={[styles.logoutText, { color: themeColors.primary }]}>Logout</Text>
          </Pressable>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Pressable style={[styles.statCard, { padding: 0 }]} onPress={() => router.push('/(admin)/pending-requests')}>
            <Card style={{ width: '100%', padding: 14 }}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 183, 3, 0.1)' }]}>
                <AlertCircle size={20} color={themeColors.accent} />
              </View>
              <Text style={[styles.statValue, { color: themeColors.text }]}>{pendingRequestsCount}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Pending</Text>
            </Card>
          </Pressable>

          <Card style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(0, 180, 216, 0.1)' }]}>
              <Heart size={20} color="#00B4D8" />
            </View>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{approvedRequestsCount}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Approved</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Users size={20} color={themeColors.success} />
            </View>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{completedRequestsCount}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Completed</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 35, 60, 0.1)' }]}>
              <AlertCircle size={20} color={themeColors.primary} />
            </View>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{rejectedRequestsCount}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Rejected</Text>
          </Card>
        </View>

        {/* Monthly Donation Statistics */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Monthly Donation Trend</Text>
        <Card style={styles.chartCard}>
          <BarChart data={monthlyData} />
        </Card>

        {/* Blood Group Distribution */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Blood Group Statistics</Text>
        <BloodDistributionGrid data={bloodGroupStats} />

        {/* Top Donating Clubs */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 16 }]}>Top Donating Clubs</Text>
        <Card style={styles.leaderboardCard}>
          {clubLeaderboardData.length > 0 ? (
            <ClubLeaderboard data={clubLeaderboardData} />
          ) : (
            <Text style={{ color: themeColors.textSecondary, textAlign: 'center', padding: 10 }}>
              No donation records found.
            </Text>
          )}
        </Card>

        {/* Recent Registrations */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 16 }]}>Recent Registrations</Text>
        <View style={styles.recentContainer}>
          {recentRegistrations.map((d) => (
            <Card key={d.id} style={styles.recentCard}>
              <View style={styles.recentHeader}>
                <View style={[styles.recentBloodBadge, { backgroundColor: themeColors.primary }]}>
                  <Text style={styles.recentBloodText}>{d.bloodGroup}</Text>
                </View>
                <View style={styles.recentDetails}>
                  <Text style={[styles.recentName, { color: themeColors.text }]}>{d.fullName}</Text>
                  <Text style={[styles.recentClub, { color: themeColors.textSecondary }]} numberOfLines={1}>
                    {d.clubDesignation || 'Member'} • {(d.clubName || 'Independent').replace('Rotaract Club of ', '')}
                  </Text>
                </View>
                <View style={styles.recentDateContainer}>
                  <Calendar size={12} color={themeColors.textSecondary} />
                  <Text style={[styles.recentDate, { color: themeColors.textSecondary }]}>New</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
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
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 14,
    marginVertical: 0,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 12,
  },
  chartCard: {
    padding: 16,
    marginBottom: 10,
  },
  leaderboardCard: {
    padding: 16,
    marginBottom: 10,
  },
  recentContainer: {
    gap: 8,
  },
  recentCard: {
    padding: 12,
    marginVertical: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentBloodBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentBloodText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  recentDetails: {
    flex: 1,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '700',
  },
  recentClub: {
    fontSize: 11,
    marginTop: 2,
  },
  recentDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentDate: {
    fontSize: 10,
    fontWeight: '700',
  },
});
