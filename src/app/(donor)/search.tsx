import { Card } from '@/components/Card';
import { DropdownPicker } from '@/components/DropdownPicker';
import { Colors } from '@/constants/theme';
import { getDaysSince, useAppState } from '@/context/AppState';
import { Award, MessageSquare, Phone, ShieldAlert } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DonorSearch() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { donors } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('All');
  const [selectedClub, setSelectedClub] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  // Extract unique clubs from the donor list, defaulting to Independent Donors if missing
  const clubs = ['All', ...Array.from(new Set(donors.map((d) => d.clubName || 'Independent Donors')))] as string[];
  
  // Mock locations since it wasn't explicitly modeled in the mocked donor data yet
  const locations = ['All', 'Coimbatore', 'Chennai', 'Madurai', 'Trichy', 'Salem'];

  // Filter donors
  const filteredDonors = donors.filter((d) => {
    const daysSince = getDaysSince(d.lastDonationDate);
    const isEligible = d.lastDonationDate === 'Never' || daysSince >= 90;
    const isAvailable = isEligible && d.isActive;

    const matchesName = d.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlood = selectedBloodGroup === 'All' || d.bloodGroup === selectedBloodGroup;
    const matchesClub = selectedClub === 'All' || d.clubName === selectedClub;
    // We don't have location on donor currently but we can simulate passing if 'All' is selected
    const matchesLocation = selectedLocation === 'All'; 
    const matchesAvailability = showOnlyAvailable ? isAvailable : true;

    return matchesName && matchesBlood && matchesClub && matchesLocation && matchesAvailability;
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Find Donors</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Find available blood donors in your district
        </Text>
      </View>

      <View style={styles.searchSection}>
        {/* <Input
          placeholder="Search donor by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Search size={20} color={themeColors.textSecondary} />}
          containerStyle={styles.searchInput}
        /> */}

        <View style={styles.row}>
          <View style={styles.col}>
            <DropdownPicker
              label="Blood Group"
              placeholder="All"
              value={selectedBloodGroup}
              options={bloodGroups}
              onSelect={setSelectedBloodGroup}
            />
          </View>
          <View style={styles.col}>
            <DropdownPicker
              label="Location"
              placeholder="All Locations"
              value={selectedLocation}
              options={locations}
              onSelect={setSelectedLocation}
              searchable={true}
            />
          </View>
        </View>

        <DropdownPicker
          label="Rotaract Club"
          placeholder="All Clubs"
          value={selectedClub}
          options={clubs}
          onSelect={setSelectedClub}
          searchable={true}
        />

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: themeColors.text }]}>Show Only Available Donors</Text>
          <Switch
            value={showOnlyAvailable}
            onValueChange={setShowOnlyAvailable}
            trackColor={{ false: themeColors.border, true: themeColors.primary + '80' }}
            thumbColor={showOnlyAvailable ? themeColors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Donors List */}
      <FlatList
        data={filteredDonors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const daysSince = getDaysSince(item.lastDonationDate);
          const isEligible = item.lastDonationDate === 'Never' || daysSince >= 90;
          const statusText = isEligible ? 'Available' : 'On Cooldown';

          return (
            <Card style={styles.donorCard}>
              <View style={styles.cardMain}>
                <View style={[styles.bloodBadge, { backgroundColor: themeColors.primary }]}>
                  <Text style={styles.bloodBadgeText}>{item.bloodGroup}</Text>
                </View>

                <View style={styles.donorDetails}>
                  <Text style={[styles.donorName, { color: themeColors.text }]}>{item.fullName}</Text>
                  <Text style={[styles.donorClub, { color: themeColors.textSecondary }]}>
                    {item.clubDesignation}, {(item.clubName || 'Independent').replace('Rotaract Club of ', '')}
                  </Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.indicatorDot,
                        { backgroundColor: isEligible && item.isActive ? themeColors.success : themeColors.error },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: isEligible && item.isActive ? themeColors.success : themeColors.error },
                      ]}
                    >
                      {!item.isActive ? 'Unavailable' : statusText}
                    </Text>
                    {item.totalDonations > 5 && (
                      <View style={styles.badgePill}>
                        <Award size={12} color={themeColors.accent} fill={themeColors.accent + '30'} />
                        <Text style={[styles.badgeText, { color: themeColors.text }]}>Star Donor</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={[styles.cardFooter, { borderTopColor: themeColors.border }]}>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: themeColors.backgroundElement }]}
                  onPress={() => handleCall(item.phoneNumber, item.fullName)}
                >
                  <Phone size={16} color={themeColors.primary} />
                  <Text style={[styles.actionBtnText, { color: themeColors.text }]}>Call</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionBtn, { backgroundColor: themeColors.backgroundElement }]}
                  onPress={() => handleSMS(item.phoneNumber, item.fullName)}
                >
                  <MessageSquare size={16} color="#00B4D8" />
                  <Text style={[styles.actionBtnText, { color: themeColors.text }]}>Message</Text>
                </Pressable>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <ShieldAlert size={48} color={themeColors.textSecondary} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No Donors Found</Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
              Try adjusting your filters or search query.
            </Text>
          </Card>
        }
      />
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
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchInput: {
    marginVertical: 0,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  donorCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloodBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bloodBadgeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  donorDetails: {
    flex: 1,
  },
  donorName: {
    fontSize: 16,
    fontWeight: '700',
  },
  donorClub: {
    fontSize: 13,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 183, 3, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 10,
    gap: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
