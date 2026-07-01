import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Users, Heart, Droplets, Target, Activity } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { Card } from '@/components/Card';
import { ClubLeaderboard } from '@/components/CustomChart';
import { mockClubRankings, mockDistrictStats, mockRecentAchievements } from '@/data/mockLeaderboard';

export default function LeaderboardScreen() {
  const themeColors = Colors.light; // Ensure it respects the theme if possible, but matching original code

  // Helper function to render rank badges for Top 3
  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return themeColors.textSecondary;
    }
  };

  const chartData = mockClubRankings.map(club => ({
    clubName: club.clubName,
    donations: club.totalSuccessfulDonations,
    rank: club.rank,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>Leaderboard</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            See which Rotaract clubs are making the biggest impact through blood donation.
          </Text>
        </View>

        {/* SECTION 1 – TOP DONATING CLUBS */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Top Donating Clubs</Text>
        <View style={styles.topClubsContainer}>
          {mockClubRankings.map((club) => {
            const isTop3 = club.rank <= 3;
            const rankColor = getRankColor(club.rank);
            
            return (
              <Card key={club.rank} style={styles.clubCard}>
                <View style={styles.clubHeader}>
                  <View style={[styles.rankCircle, { backgroundColor: isTop3 ? rankColor + '20' : themeColors.backgroundElement }]}>
                    <Text style={[styles.rankEmoji, !isTop3 && { color: themeColors.text, fontSize: 14, fontWeight: '700' }]}>
                      {renderRankBadge(club.rank)}
                    </Text>
                  </View>
                  <Text style={[styles.clubNameTitle, { color: themeColors.text }]} numberOfLines={2}>
                    {club.clubName}
                  </Text>
                </View>

                <View style={styles.unitsContainer}>
                  <Droplets size={24} color={themeColors.primary} />
                  <Text style={[styles.unitsText, { color: themeColors.primary }]}>
                    {club.totalUnitsDonated} Units Donated
                  </Text>
                </View>

                <View style={styles.progressBg}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${club.progressPercentage}%`, backgroundColor: isTop3 ? rankColor : themeColors.primary }
                    ]} 
                  />
                </View>

                <View style={styles.clubStatsRow}>
                  <View style={styles.clubStatItem}>
                    <Users size={16} color={themeColors.textSecondary} />
                    <Text style={[styles.clubStatValue, { color: themeColors.textSecondary }]}>
                      {club.totalRegisteredDonors} Donors
                    </Text>
                  </View>
                  <View style={styles.clubStatItem}>
                    <Heart size={16} color={themeColors.textSecondary} />
                    <Text style={[styles.clubStatValue, { color: themeColors.textSecondary }]}>
                      {club.totalSuccessfulDonations} Successful
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* SECTION 2 – DISTRICT STATISTICS */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 10 }]}>District Statistics</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: themeColors.primary + '15' }]}>
              <Droplets size={24} color={themeColors.primary} />
            </View>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{mockDistrictStats.totalUnitsDonated}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Units Donated</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: themeColors.success + '15' }]}>
              <Heart size={24} color={themeColors.success} />
            </View>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{mockDistrictStats.totalLivesSaved}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Lives Saved</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#3A86C815' }]}>
              <Users size={24} color="#3A86C8" />
            </View>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{mockDistrictStats.totalRegisteredDonors}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Registered Donors</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIconWrapper, { backgroundColor: '#FFB70315' }]}>
              <Target size={24} color="#FFB703" />
            </View>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{mockDistrictStats.totalActiveClubs}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Active Clubs</Text>
          </Card>
        </View>

        {/* SECTION 3 – RECENT ACHIEVEMENTS */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 10 }]}>Recent Achievements</Text>
        <Card style={styles.achievementsCard}>
          {mockRecentAchievements.map((achievement, index) => (
            <View key={achievement.id} style={[styles.achievementRow, index !== mockRecentAchievements.length - 1 && { borderBottomWidth: 1, borderBottomColor: themeColors.border }]}>
              <View style={[styles.achievementIcon, { backgroundColor: themeColors.backgroundElement }]}>
                <Activity size={18} color={themeColors.primary} />
              </View>
              <Text style={[styles.achievementText, { color: themeColors.text }]}>{achievement.description}</Text>
            </View>
          ))}
        </Card>

        {/* SECTION 4 – CLUB PERFORMANCE */}
        <View style={styles.performanceSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 10, marginBottom: 4 }]}>
            Club Performance
          </Text>
          <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary, marginBottom: 14 }]}>
            Comparison of total donations across top clubs
          </Text>
          <Card>
            <ClubLeaderboard data={chartData} />
          </Card>
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
    paddingTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: -8,
  },
  
  // Top Clubs
  topClubsContainer: {
    marginBottom: 16,
  },
  clubCard: {
    marginBottom: 16,
    padding: 16,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rankCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankEmoji: {
    fontSize: 20,
  },
  clubNameTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  unitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitsText: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  progressBg: {
    height: 8,
    backgroundColor: 'rgba(141, 153, 174, 0.15)',
    borderRadius: 4,
    marginBottom: 16,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  clubStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clubStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubStatValue: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Achievements
  achievementsCard: {
    padding: 16,
    marginBottom: 24,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  achievementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  
  // Performance
  performanceSection: {
    marginTop: 10,
  },
});
