import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, useColorScheme, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AlertCircle, LogOut, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useAppState } from '@/context/AppState';
import { Card } from '@/components/Card';

export default function PendingRequestsScreen() {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;
  const { requests, approveBloodRequest, rejectBloodRequest } = useAppState();

  const pendingRequestsList = requests.filter((r) => r.status === 'Pending');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={themeColors.text} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>Pending Requests</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.recentContainer}>
          {pendingRequestsList.length > 0 ? (
            pendingRequestsList.map((r) => (
              <Pressable key={r.id} onPress={() => setSelectedRequest(r)}>
                <Card style={styles.recentCard}>
                  <View style={styles.recentHeader}>
                    <View style={[styles.recentBloodBadge, { backgroundColor: themeColors.primary }]}>
                      <Text style={styles.recentBloodText}>{r.bloodGroup}</Text>
                    </View>
                    <View style={styles.recentDetails}>
                      <Text style={[styles.recentName, { color: themeColors.text }]}>{r.patientName}</Text>
                      <Text style={[styles.recentClub, { color: themeColors.textSecondary }]} numberOfLines={1}>
                        {r.hospitalName} • Units: {r.unitsRequired}
                      </Text>
                    </View>
                    <View style={styles.recentDateContainer}>
                      <AlertCircle size={12} color={themeColors.error} />
                      <Text style={[styles.recentDate, { color: themeColors.error }]}>Pending</Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))
          ) : (
            <Text style={{ color: themeColors.textSecondary, textAlign: 'center', padding: 20 }}>
              No pending blood requests.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedRequest}
          onRequestClose={() => setSelectedRequest(null)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: themeColors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: themeColors.text }}>Review Request</Text>
                <Pressable onPress={() => setSelectedRequest(null)}>
                  <LogOut size={24} color={themeColors.textSecondary} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <View style={[styles.recentBloodBadge, { backgroundColor: themeColors.primary, width: 60, height: 60, borderRadius: 16, marginRight: 16 }]}>
                    <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '800' }}>{selectedRequest.bloodGroup}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: themeColors.text }}>{selectedRequest.patientName}</Text>
                    <Text style={{ fontSize: 14, color: themeColors.textSecondary, marginTop: 4 }}>
                      {selectedRequest.hospitalName}
                    </Text>
                  </View>
                </View>

                <View style={{ marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>Guardian Name</Text>
                    <Text style={{ color: themeColors.text, fontSize: 14, fontWeight: '600' }}>{selectedRequest.guardianName || 'N/A'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>Units Required</Text>
                    <Text style={{ color: themeColors.text, fontSize: 14, fontWeight: '600' }}>{selectedRequest.unitsRequired}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>Required By Date</Text>
                    <Text style={{ color: themeColors.text, fontSize: 14, fontWeight: '600' }}>{selectedRequest.requiredByDate}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>Contact Number</Text>
                    <Text style={{ color: themeColors.text, fontSize: 14, fontWeight: '600' }}>{selectedRequest.contactNumber}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: themeColors.textSecondary, fontSize: 14 }}>Emergency Level</Text>
                    <Text style={{ color: themeColors.error, fontSize: 14, fontWeight: '600' }}>{selectedRequest.emergencyLevel}</Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: themeColors.textSecondary, fontSize: 14, marginBottom: 4 }}>Hospital Address</Text>
                    <Text style={{ color: themeColors.text, fontSize: 14, lineHeight: 20 }}>{selectedRequest.hospitalAddress || 'N/A'}</Text>
                  </View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ color: themeColors.textSecondary, fontSize: 14, marginBottom: 4 }}>Notes</Text>
                    <Text style={{ color: themeColors.text, fontSize: 14, lineHeight: 20 }}>{selectedRequest.notes || 'None'}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                  <Pressable 
                    style={{ flex: 1, backgroundColor: 'rgba(239, 35, 60, 0.1)', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                    onPress={() => { rejectBloodRequest(selectedRequest.id); setSelectedRequest(null); }}
                  >
                    <Text style={{ color: themeColors.primary, fontWeight: '700', fontSize: 16 }}>Reject</Text>
                  </Pressable>
                  <Pressable 
                    style={{ flex: 1, backgroundColor: themeColors.success, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                    onPress={() => { approveBloodRequest(selectedRequest.id); setSelectedRequest(null); }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>Approve</Text>
                  </Pressable>
                </View>
              </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
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
