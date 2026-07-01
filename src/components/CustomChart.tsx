import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

// 1. Monthly Bar Chart Component
interface BarChartProps {
  data: { label: string; value: number }[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.chartContainer}>
      <View style={styles.barContainer}>
        {data.map((item, idx) => {
          const heightPercent = (item.value / maxValue) * 100;
          return (
            <View key={idx} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: themeColors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barValue, { color: themeColors.text }]}>{item.value}</Text>
              <Text style={[styles.barLabel, { color: themeColors.textSecondary }]} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// 2. Blood Group Distribution Pill Grid
interface DistributionGridProps {
  data: { group: string; count: number; percentage: number }[];
}

export const BloodDistributionGrid: React.FC<DistributionGridProps> = ({ data }) => {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;

  return (
    <View style={styles.gridContainer}>
      {data.map((item, idx) => (
        <View
          key={idx}
          style={[
            styles.gridItem,
            {
              backgroundColor: themeColors.backgroundElement,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={[styles.groupBadge, { backgroundColor: themeColors.primary }]}>
            <Text style={styles.groupBadgeText}>{item.group}</Text>
          </View>
          <View style={styles.groupInfo}>
            <Text style={[styles.groupCount, { color: themeColors.text }]}>{item.count} Donors</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: themeColors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.groupPercent, { color: themeColors.textSecondary }]}>
              {item.percentage}% of total
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

// 3. Club Leaderboard
interface LeaderboardProps {
  data: { clubName: string; donations: number; rank: number }[];
}

export const ClubLeaderboard: React.FC<LeaderboardProps> = ({ data }) => {
  let colorScheme = 'light' as 'light' | 'dark';
  const themeColors = Colors.light;

  const maxDonations = Math.max(...data.map((d) => d.donations), 1);

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

  return (
    <View style={styles.leaderboardContainer}>
      {data.map((item, idx) => {
        const widthPercent = (item.donations / maxDonations) * 100;
        return (
          <View key={idx} style={styles.leaderboardRow}>
            <View
              style={[
                styles.rankBadge,
                {
                  backgroundColor:
                    item.rank <= 3 ? getRankColor(item.rank) : themeColors.backgroundElement,
                },
              ]}
            >
              <Text
                style={[
                  styles.rankText,
                  { color: item.rank <= 3 ? '#000000' : themeColors.text, fontWeight: '700' },
                ]}
              >
                {item.rank}
              </Text>
            </View>
            <View style={styles.leaderboardInfo}>
              <View style={styles.leaderboardHeader}>
                <Text style={[styles.clubName, { color: themeColors.text }]} numberOfLines={1}>
                  {item.clubName}
                </Text>
                <Text style={[styles.donationCount, { color: themeColors.primary }]}>
                  {item.donations} bags
                </Text>
              </View>
              <View style={styles.leaderboardBarBg}>
                <View
                  style={[
                    styles.leaderboardBarFill,
                    {
                      width: `${widthPercent}%`,
                      backgroundColor: item.rank === 1 ? '#FFD700' : themeColors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  // Bar Chart
  chartContainer: {
    height: 200,
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 14,
    height: '75%',
    backgroundColor: 'rgba(141, 153, 174, 0.15)',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 10,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 2,
    width: '100%',
    textAlign: 'center',
  },

  // Grid Distribution
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  gridItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 6,
  },
  groupBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  groupInfo: {
    flex: 1,
    marginLeft: 10,
  },
  groupCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(141, 153, 174, 0.15)',
    borderRadius: 2,
    marginVertical: 4,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  groupPercent: {
    fontSize: 9,
  },

  // Leaderboard
  leaderboardContainer: {
    marginVertical: 4,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 13,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  clubName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  donationCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  leaderboardBarBg: {
    height: 6,
    backgroundColor: 'rgba(141, 153, 174, 0.15)',
    borderRadius: 3,
    width: '100%',
  },
  leaderboardBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
