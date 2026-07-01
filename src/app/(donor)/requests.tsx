import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Colors } from '@/constants/theme';
import { getDaysSince, useAppState } from '@/context/AppState';
import { Calendar, CheckCircle2, Heart, MapPin, Phone, Share2, ShieldCheck, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmergencyRequests() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { requests, donors, currentUser, markNotificationsAsRead, acceptBloodRequest } = useAppState();

  const [activeTab, setActiveTab] = useState<'Active' | 'Fulfilled'>('Active');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mark notifications as read when entering this screen
  React.useEffect(() => {
    markNotificationsAsRead();
  }, []);

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
  const daysSince = getDaysSince(donor.lastDonationDate);
  const isEligible = donor.lastDonationDate === 'Never' || daysSince >= 60;

  const filteredRequests = (requests || []).filter((r) =>
    activeTab === 'Active' ? (r.status === 'Approved' || r.status === 'Partially Filled') : r.status === 'Completed' || r.status === 'Closed'
  );

  const handleCall = (phone: string, name: string) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Simulated Call', `Calling Coordinator for ${name} at ${phone}`);
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to open dialer.');
      });
  };

  const handleShare = (req: any) => {
    Alert.alert(
      'Share Request',
      `*EMERGENCY BLOOD REQUIRED*\n\nPatient: ${req.patientName}\nBlood Group: ${req.bloodGroup}\nUnits: ${req.unitsRequired}\nHospital: ${req.hospitalName}\nContact: ${req.contactNumber}\n\nShared via District Rotaract Blood Cell App.`
    );
  };

  const handleDonateIntent = (req: any) => {
    setSelectedRequest(req);
    setModalVisible(true);
  };

const confirmDonation = () => {
  const request = selectedRequest;

  if (!request) return;

  acceptBloodRequest(request.id, donor.id);
  setModalVisible(false);

  Alert.alert(
    'Thank You!',
    `Your request to donate ${donor.bloodGroup} blood for ${request.patientName} has been registered. The coordinator has been notified and will contact you shortly.`,
    [{ text: 'OK' }]
  );
};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Emergency Requests</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Respond to active blood emergencies in your area
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: themeColors.backgroundElement }]}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'Active' && [styles.activeTab, { backgroundColor: themeColors.card }],
          ]}
          onPress={() => setActiveTab('Active')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'Active' ? themeColors.text : themeColors.textSecondary,
                fontWeight: activeTab === 'Active' ? '700' : '500',
              },
            ]}
          >
            Active Alerts ({requests.filter((r) => r.status === 'Approved' || r.status === 'Partially Filled').length})
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            activeTab === 'Fulfilled' && [styles.activeTab, { backgroundColor: themeColors.card }],
          ]}
          onPress={() => setActiveTab('Fulfilled')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'Fulfilled' ? themeColors.text : themeColors.textSecondary,
                fontWeight: activeTab === 'Fulfilled' ? '700' : '500',
              },
            ]}
          >
            Fulfilled ({requests.filter((r) => r.status === 'Completed' || r.status === 'Closed').length})
          </Text>
        </Pressable>
      </View>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const hasAccepted = item.acceptedDonors?.includes(donor.id);
          
          return (
          <Card
            variant={item.status === 'Approved' || item.status === 'Partially Filled' ? 'emergency' : 'default'}
            style={styles.requestCard}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.bloodBadge, { backgroundColor: themeColors.primary }]}>
                <Text style={styles.bloodBadgeText}>{item.bloodGroup}</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={[styles.patientName, { color: themeColors.text }]}>
                  Patient: {item.patientName}
                </Text>
                <View style={styles.metaRow}>
                  <Calendar size={13} color={themeColors.textSecondary} />
                  <Text style={[styles.metaText, { color: themeColors.textSecondary }]}>
                    Required by: {item.requiredByDate}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <MapPin size={15} color={themeColors.primary} style={styles.infoIcon} />
                <Text style={[styles.infoText, { color: themeColors.text }]} numberOfLines={2}>
                  {item.hospitalName}
                </Text>
              </View>
              {item.notes && (
                <Text style={[styles.notesText, { color: themeColors.textSecondary }]}>
                  &quot;{item.notes}&quot;
                </Text>
              )}

              <View style={styles.unitsNeededRow}>
                <View style={{ gap: 4 }}>
                  <Text style={[styles.unitsLabel, { color: themeColors.textSecondary }]}>
                    Required Units = <Text style={[styles.unitsValue, { color: themeColors.primary }]}>{item.unitsRequired}</Text>
                  </Text>
                  <Text style={[styles.unitsLabel, { color: themeColors.textSecondary }]}>
                    Accepted Donors = <Text style={[styles.unitsValue, { color: themeColors.success }]}>{item.unitsAccepted}</Text>
                  </Text>
                  <Text style={[styles.unitsLabel, { color: themeColors.textSecondary }]}>
                    Remaining Units = <Text style={[styles.unitsValue, { color: themeColors.error }]}>{item.remainingUnits}</Text>
                  </Text>
                </View>
              </View>
            </View>

            {(item.status === 'Approved' || item.status === 'Partially Filled') && (
              <View style={[styles.cardFooter, { borderTopColor: themeColors.border }]}>
                <Button
                  title={hasAccepted ? "✓ Accepted" : "I Can Donate"}
                  onPress={() => !hasAccepted && handleDonateIntent(item)}
                  size="small"
                  style={styles.donateBtn}
                  icon={hasAccepted ? undefined : <Heart size={16} color="#FFFFFF" fill="#FFFFFF" />}
                  disabled={hasAccepted}
                />

                <Pressable
                  style={[styles.iconBtn, { backgroundColor: themeColors.backgroundElement }]}
                  onPress={() => handleCall(item.contactNumber, item.patientName)}
                >
                  <Phone size={16} color={themeColors.text} />
                </Pressable>

                <Pressable
                  style={[styles.iconBtn, { backgroundColor: themeColors.backgroundElement }]}
                  onPress={() => handleShare(item)}
                >
                  <Share2 size={16} color={themeColors.text} />
                </Pressable>
              </View>
            )}
            {(item.status === 'Completed' || item.status === 'Closed') && (
              <View style={styles.fulfilledBanner}>
                <CheckCircle2 size={16} color={themeColors.success} />
                <Text style={[styles.fulfilledText, { color: themeColors.success }]}>
                  Request Closed. Thank you, donors!
                </Text>
              </View>
            )}
          </Card>
        )}}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              No emergency requests in this category.
            </Text>
          </Card>
        }
      />

      {/* Donation Eligibility Modal */}
      {selectedRequest && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>Confirm Donation</Text>
                <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <X size={20} color={themeColors.text} />
                </Pressable>
              </View>

              <View style={styles.modalBody}>
                <Text style={[styles.modalSubtitle, { color: themeColors.textSecondary }]}>
                  You are responding to the emergency request for {selectedRequest?.patientName} ({selectedRequest?.bloodGroup}).
                </Text>

                <Card style={styles.eligibilityReport}>
                  <View style={styles.eligibilityReportRow}>
                    <ShieldCheck size={24} color={isEligible ? themeColors.success : themeColors.error} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.reportTitle, { color: themeColors.text }]}>
                        {isEligible ? 'Eligibility Verified' : 'Eligibility Restriction'}
                      </Text>
                      <Text style={[styles.reportDesc, { color: themeColors.textSecondary }]}>
                        {isEligible
                          ? `Your blood group is ${donor?.bloodGroup}. You are eligible to donate.`
                          : `You last donated on ${donor?.lastDonationDate}. You must wait 60 days between donations.`}
                      </Text>
                    </View>
                  </View>
                </Card>

                {isEligible ? (
                  <View style={styles.modalActions}>
                    <Button title="Confirm Availability" onPress={confirmDonation} style={styles.modalConfirmBtn} />
                    <Button
                      title="Cancel"
                      onPress={() => setModalVisible(false)}
                      variant="outline"
                      style={styles.modalCancelBtn}
                    />
                  </View>
                ) : (
                  <View style={styles.modalActions}>
                    <Text style={[styles.cooldownAlert, { color: themeColors.error }]}>
                      For your health safety, you cannot donate yet. Cooldown remaining: {60 - daysSince} days.
                    </Text>
                    <Button title="Close" onPress={() => setModalVisible(false)} style={styles.modalConfirmBtn} />
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTab: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  requestCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  bloodBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bloodBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  cardBody: {
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  notesText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 8,
  },
  unitsNeededRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  unitsLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  unitsValue: {
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 10,
  },
  donateBtn: {
    flex: 1,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fulfilledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
    marginTop: 4,
  },
  fulfilledText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    width: '100%',
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  eligibilityReport: {
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(141, 153, 174, 0.15)',
  },
  eligibilityReportRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  reportDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  modalActions: {
    gap: 10,
  },
  modalConfirmBtn: {
    width: '100%',
  },
  modalCancelBtn: {
    width: '100%',
  },
  cooldownAlert: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
});
