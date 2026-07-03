import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  Switch,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, Phone, MapPin, Calendar, History, Info, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/context/AppState';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { DatePickerInput } from '@/components/DatePickerInput';

export default function DonorProfile() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const router = useRouter();
  const { currentUser, donors, donations, toggleDonorStatus, deleteDonationRecord } = useAppState();

  const currentDonor = donors.find((d) => d.id === currentUser?.donorId);
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

  const myHistory = donations.filter((d) => d.donorId === donor.id);

  const groupedHistory = myHistory.reduce((acc: Record<string, typeof myHistory>, h) => {
    const d = new Date(h.donationDate);
    const monthYear = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(h);
    return acc;
  }, {});

  const handleDeleteDonation = (id: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this donation record? This is for testing purposes only.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteDonationRecord(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Profile Info */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarCircle, { backgroundColor: themeColors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: themeColors.primary }]}>
              {donor.fullName.charAt(0)}
            </Text>
          </View>
          <Text style={[styles.name, { color: themeColors.text }]}>{donor.fullName}</Text>
          <Text style={[styles.designation, { color: themeColors.textSecondary }]}>
            {donor.clubDesignation} • {(donor.clubName || 'Independent').replace('Rotaract Club of ', '')}
          </Text>
        </View>

        {/* Status Toggle Card */}
        <Card style={styles.statusToggleCard}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={[styles.toggleTitle, { color: themeColors.text }]}>Available to Donate</Text>
              <Text style={[styles.toggleDesc, { color: themeColors.textSecondary }]}>
                Toggle off if you are temporarily unavailable or sick.
              </Text>
            </View>
            <Switch
              value={donor.isActive}
              onValueChange={() => toggleDonorStatus(donor.id)}
              trackColor={{ false: themeColors.border, true: themeColors.primaryLight }}
              thumbColor={donor.isActive ? themeColors.primary : themeColors.accent}
            />
          </View>
        </Card>


        {/* Personal Details Accordion/Section */}
        <Card style={styles.detailsCard}>
          <View style={styles.cardTitleRow}>
            <Info size={20} color={themeColors.primary} />
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>Personal & Contact Details</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Age</Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>{donor.age} Years</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Profession</Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>{donor.profession}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Phone Number</Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>{donor.phoneNumber}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Email Address</Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>{donor.emailAddress}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Address</Text>
            <Text style={[styles.detailValue, { color: themeColors.text, lineHeight: 18 }]}>
              {donor.address}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Emergency Contact</Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>{donor.parentContact}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Emergency Phone</Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>{donor.emergencyNumber}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>Health Issues</Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>{donor.healthIssues}</Text>
          </View>
        </Card>

        {/* Donation History */}
        <View style={styles.historySection}>
          <View style={styles.cardTitleRow}>
            <History size={20} color={themeColors.primary} />
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Donation History</Text>
          </View>

          {Object.keys(groupedHistory).length > 0 ? (
            Object.keys(groupedHistory).map((monthYear) => (
              <View key={monthYear} style={styles.monthGroup}>
                <Text style={[styles.monthTitle, { color: themeColors.textSecondary }]}>{monthYear}</Text>
                {groupedHistory[monthYear].map((h) => (
                  <Card key={h.id} style={styles.historyItem}>
                    <View style={styles.historyRow}>
                      <View style={[styles.historyIconCircle, { backgroundColor: themeColors.primaryLight }]}>
                        <Calendar size={16} color={themeColors.primary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.historyVenue, { color: themeColors.text }]}>{h.venue}</Text>
                        <Text style={[styles.historyDate, { color: themeColors.textSecondary }]}>
                          {h.donationDate} • {h.bloodGroup}
                        </Text>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>{h.status}</Text>
                        </View>
                      </View>
                      <View style={styles.rightActions}>
                        <Text style={[styles.historyUnits, { color: themeColors.primary }]}>{h.units} Unit{h.units > 1 ? 's' : ''}</Text>
                        <Pressable onPress={() => handleDeleteDonation(h.id)} style={styles.deleteBtn}>
                          <Trash2 size={18} color="#FF3B30" />
                        </Pressable>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            ))
          ) : (
            <Card style={styles.emptyHistoryCard}>
              <Text style={[styles.emptyHistoryText, { color: themeColors.textSecondary }]}>
                No donation history available yet.
              </Text>
            </Card>
          )}
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
  profileHeader: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
  },
  designation: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  statusToggleCard: {
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },

  detailsCard: {
    padding: 16,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '65%',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(141, 153, 174, 0.1)',
    marginVertical: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  historySection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  monthGroup: {
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  historyItem: {
    padding: 14,
    marginVertical: 4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyVenue: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '700',
  },
  rightActions: {
    alignItems: 'flex-end',
    gap: 6,
    flexDirection: 'row',
  },
  deleteBtn: {
    padding: 4,
  },
  historyUnits: {
    fontSize: 13,
    fontWeight: '800',
    marginRight: 4,
  },
  emptyHistoryCard: {
    padding: 20,
    alignItems: 'center',
    marginVertical: 4,
  },
  emptyHistoryText: {
    fontSize: 12,
  },
});
