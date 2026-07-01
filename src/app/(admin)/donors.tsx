import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useColorScheme,
  FlatList,
  Linking,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Phone, MessageSquare, ShieldAlert, Award, User, Info, X, MapPin, Heart } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useAppState, getDaysSince } from '@/context/AppState';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function AdminDonorsList() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { donors, toggleDonorStatus } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('All');
  const [selectedClub, setSelectedClub] = useState<string>('All');
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const clubs = ['All', ...Array.from(new Set(donors.map((d) => d.clubName)))];

  const filteredDonors = donors.filter((d) => {
    const matchesName = d.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlood = selectedBloodGroup === 'All' || d.bloodGroup === selectedBloodGroup;
    const matchesClub = selectedClub === 'All' || d.clubName === selectedClub;
    return matchesName && matchesBlood && matchesClub;
  });

  const handleCall = (phone: string, name: string) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Simulated Call', `Calling ${name} at ${phone}`);
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to open dialer.');
      });
  };

  const handleSMS = (phone: string, name: string) => {
    const url = `sms:${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Simulated SMS', `Sending text message to ${name} at ${phone}`);
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Unable to open messaging.');
      });
  };

  const handleViewDetails = (donor: any) => {
    setSelectedDonor(donor);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Manage Donors</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          View, contact, and update registered blood donors ({donors.length} total)
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <Input
          placeholder="Search by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Search size={20} color={themeColors.textSecondary} />}
          containerStyle={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingRight: 20 }}>
        {/* Blood Filter */}
        <View style={styles.filterBlock}>
          {bloodGroups.slice(0, 5).map((bg) => (
            <Pressable
              key={bg}
              style={[
                styles.filterPill,
                selectedBloodGroup === bg && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
              ]}
              onPress={() => setSelectedBloodGroup(bg)}
            >
              <Text style={[styles.filterPillText, { color: selectedBloodGroup === bg ? '#FFFFFF' : themeColors.text }]}>
                {bg}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Donors List */}
      <FlatList
        data={filteredDonors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const daysSince = getDaysSince(item.lastDonationDate);
          const isEligible = item.lastDonationDate === 'Never' || daysSince >= 90;
          const statusText = isEligible ? 'Eligible' : 'Cooldown';

          return (
            <Card style={styles.donorCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.bloodBadge, { backgroundColor: themeColors.primary }]}>
                  <Text style={styles.bloodText}>{item.bloodGroup}</Text>
                </View>
                <View style={styles.donorInfo}>
                  <Text style={[styles.donorName, { color: themeColors.text }]}>{item.fullName}</Text>
                  <Text style={[styles.donorClub, { color: themeColors.textSecondary }]} numberOfLines={1}>
                    {item.clubDesignation} • {(item.clubName || 'Independent').replace('Rotaract Club of ', '')}
                  </Text>
                </View>
                <View style={styles.actionSwitches}>
                  <Switch
                    value={item.isActive}
                    onValueChange={() => toggleDonorStatus(item.id)}
                    trackColor={{ false: themeColors.border, true: themeColors.primaryLight }}
                    thumbColor={item.isActive ? themeColors.primary : themeColors.accent}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>
              </View>

              <View style={styles.cardStatsRow}>
                <View style={styles.miniStat}>
                  <Text style={[styles.miniValue, { color: themeColors.text }]}>{item.totalDonations}</Text>
                  <Text style={[styles.miniLabel, { color: themeColors.textSecondary }]}>Donations</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={[styles.miniValue, { color: isEligible && item.isActive ? themeColors.success : themeColors.error }]}>
                    {item.isActive ? statusText : 'Inactive'}
                  </Text>
                  <Text style={[styles.miniLabel, { color: themeColors.textSecondary }]}>Status</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={[styles.miniValue, { color: themeColors.text }]} numberOfLines={1}>
                    {item.lastDonationDate === 'Never' ? 'Never' : item.lastDonationDate}
                  </Text>
                  <Text style={[styles.miniLabel, { color: themeColors.textSecondary }]}>Last Donated</Text>
                </View>
              </View>

              <View style={[styles.cardFooter, { borderTopColor: themeColors.border }]}>
                <Button
                  title="Full Profile"
                  onPress={() => handleViewDetails(item)}
                  size="small"
                  variant="outline"
                  style={styles.detailBtn}
                  icon={<Info size={14} color={themeColors.primary} />}
                />
                <Pressable
                  style={[styles.iconBtn, { backgroundColor: themeColors.backgroundElement }]}
                  onPress={() => handleCall(item.phoneNumber, item.fullName)}
                >
                  <Phone size={15} color={themeColors.text} />
                </Pressable>
                <Pressable
                  style={[styles.iconBtn, { backgroundColor: themeColors.backgroundElement }]}
                  onPress={() => handleSMS(item.phoneNumber, item.fullName)}
                >
                  <MessageSquare size={15} color={themeColors.text} />
                </Pressable>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <ShieldAlert size={40} color={themeColors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: themeColors.text, marginTop: 12 }]}>No Donors Match Filters</Text>
          </Card>
        }
      />

      {/* Donor Details Modal */}
      {selectedDonor && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: themeColors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>Donor Profile Details</Text>
                <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <X size={20} color={themeColors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalCardHeader}>
                  <View style={[styles.modalAvatar, { backgroundColor: themeColors.primaryLight }]}>
                    <Text style={[styles.modalAvatarText, { color: themeColors.primary }]}>
                      {selectedDonor.fullName.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[styles.modalName, { color: themeColors.text }]}>{selectedDonor.fullName}</Text>
                  <Text style={[styles.modalClub, { color: themeColors.textSecondary }]}>
                    {selectedDonor.clubDesignation} • {selectedDonor.clubName}
                  </Text>
                </View>

                <View style={styles.sectionDivider} />

                <Text style={[styles.modalSecTitle, { color: themeColors.primary }]}>Medical & Contact Info</Text>

                <View style={styles.infoBlock}>
                  <View style={styles.infoGridRow}>
                    <View style={styles.infoGridCol}>
                      <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Blood Group</Text>
                      <Text style={[styles.infoVal, { color: themeColors.text, fontWeight: '800' }]}>
                        {selectedDonor.bloodGroup}
                      </Text>
                    </View>
                    <View style={styles.infoGridCol}>
                      <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Age</Text>
                      <Text style={[styles.infoVal, { color: themeColors.text }]}>{selectedDonor.age} Years</Text>
                    </View>
                  </View>

                  <View style={styles.infoGridRow}>
                    <View style={styles.infoGridCol}>
                      <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Phone</Text>
                      <Text style={[styles.infoVal, { color: themeColors.text }]}>{selectedDonor.phoneNumber}</Text>
                    </View>
                    <View style={styles.infoGridCol}>
                      <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Email</Text>
                      <Text style={[styles.infoVal, { color: themeColors.text }]} numberOfLines={1}>
                        {selectedDonor.emailAddress}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoGridRow}>
                    <View style={styles.infoGridCol}>
                      <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Profession</Text>
                      <Text style={[styles.infoVal, { color: themeColors.text }]}>{selectedDonor.profession}</Text>
                    </View>
                    <View style={styles.infoGridCol}>
                      <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Health Issues</Text>
                      <Text style={[styles.infoVal, { color: themeColors.text }]}>{selectedDonor.healthIssues}</Text>
                    </View>
                  </View>

                  <View style={styles.fullWidthCol}>
                    <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Address</Text>
                    <Text style={[styles.infoVal, { color: themeColors.text, lineHeight: 18 }]}>
                      {selectedDonor.address}
                    </Text>
                  </View>
                </View>

                <View style={styles.sectionDivider} />

                <Text style={[styles.modalSecTitle, { color: themeColors.primary }]}>Parent / Emergency Contact</Text>
                <View style={styles.infoBlock}>
                  <View style={styles.infoGridRow}>
                    <View style={styles.infoGridCol}>
                      <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Contact Name</Text>
                      <Text style={[styles.infoVal, { color: themeColors.text }]}>{selectedDonor.parentContact}</Text>
                    </View>
                    <View style={styles.infoGridCol}>
                      <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Contact Phone</Text>
                      <Text style={[styles.infoVal, { color: themeColors.text }]}>
                        {selectedDonor.emergencyNumber}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>

              <View style={styles.modalActions}>
                <Button title="Close Profile" onPress={() => setModalVisible(false)} />
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
    fontSize: 13,
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchInput: {
    marginVertical: 0,
  },
  filterScroll: {
    paddingHorizontal: 20,
    height: 48,
    marginBottom: 4,
  },
  filterBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: 'rgba(141,153,174,0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
    height: 32,
    justifyContent: 'center',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  donorCard: {
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloodBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bloodText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  donorClub: {
    fontSize: 12,
    marginTop: 2,
  },
  actionSwitches: {
    justifyContent: 'center',
  },
  cardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(141,153,174,0.06)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  miniStat: {
    alignItems: 'center',
    flex: 1,
  },
  miniValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  detailBtn: {
    flex: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
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
    maxHeight: '85%',
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
    marginBottom: 12,
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
  modalCardHeader: {
    alignItems: 'center',
    marginVertical: 14,
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalAvatarText: {
    fontSize: 24,
    fontWeight: '800',
  },
  modalName: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalClub: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(141,153,174,0.1)',
    marginVertical: 14,
  },
  modalSecTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBlock: {
    gap: 12,
  },
  infoGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoGridCol: {
    width: '48%',
  },
  fullWidthCol: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  modalActions: {
    marginTop: 16,
  },
});
