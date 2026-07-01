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
import { User, Shield, Phone, MapPin, Calendar, PlusCircle, History, Info } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/context/AppState';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function DonorProfile() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { currentUser, donors, donations, updateLastDonationDate, toggleDonorStatus } = useAppState();

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

  const [newDonationDate, setNewDonationDate] = useState('');
  const [loggingDonation, setLoggingDonation] = useState(false);

  const myHistory = donations.filter((d) => d.donorId === donor.id);

  const handleLogDonation = () => {
    if (!newDonationDate.trim()) {
      Alert.alert('Error', 'Please enter a valid date (YYYY-MM-DD)');
      return;
    }

    // Basic date regex check
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newDonationDate)) {
      Alert.alert('Error', 'Please use YYYY-MM-DD format (e.g., 2026-06-28)');
      return;
    }

    updateLastDonationDate(donor.id, newDonationDate);
    Alert.alert('Success', 'Blood donation logged successfully!');
    setNewDonationDate('');
    setLoggingDonation(false);
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

        {/* Log Donation Card */}
        <Card style={styles.logDonationCard}>
          <View style={styles.cardTitleRow}>
            <PlusCircle size={20} color={themeColors.primary} />
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>Log New Donation</Text>
          </View>

          {!loggingDonation ? (
            <Button
              title="Log Blood Donation"
              onPress={() => {
                setLoggingDonation(true);
                // Set default to today's date in YYYY-MM-DD
                const today = new Date().toISOString().split('T')[0];
                setNewDonationDate(today);
              }}
              variant="outline"
              size="small"
            />
          ) : (
            <View style={styles.logForm}>
              <Input
                label="Donation Date"
                placeholder="YYYY-MM-DD"
                value={newDonationDate}
                onChangeText={setNewDonationDate}
              />
              <View style={styles.logActions}>
                <Button
                  title="Cancel"
                  onPress={() => setLoggingDonation(false)}
                  variant="text"
                  style={styles.logCancelBtn}
                />
                <Button title="Save Record" onPress={handleLogDonation} style={styles.logSaveBtn} />
              </View>
            </View>
          )}
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
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Donation Timeline</Text>
          </View>

          {myHistory.length > 0 ? (
            myHistory.map((h) => (
              <Card key={h.id} style={styles.historyItem}>
                <View style={styles.historyRow}>
                  <View style={[styles.historyIconCircle, { backgroundColor: themeColors.primaryLight }]}>
                    <Calendar size={16} color={themeColors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.historyVenue, { color: themeColors.text }]}>{h.venue}</Text>
                    <Text style={[styles.historyDate, { color: themeColors.textSecondary }]}>
                      {h.donationDate}
                    </Text>
                  </View>
                  <Text style={[styles.historyUnits, { color: themeColors.primary }]}>+{h.units} Unit</Text>
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyHistoryCard}>
              <Text style={[styles.emptyHistoryText, { color: themeColors.textSecondary }]}>
                No donation history logged yet.
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
  logDonationCard: {
    padding: 16,
    marginBottom: 16,
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
  logForm: {
    width: '100%',
  },
  logActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 10,
  },
  logCancelBtn: {
    width: 80,
  },
  logSaveBtn: {
    width: 120,
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
  historySection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
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
    fontSize: 11,
    marginTop: 2,
  },
  historyUnits: {
    fontSize: 13,
    fontWeight: '800',
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
