export interface ClubRanking {
  rank: number;
  clubName: string;
  totalUnitsDonated: number;
  totalRegisteredDonors: number;
  totalSuccessfulDonations: number;
  progressPercentage: number;
}

export interface DistrictStats {
  totalUnitsDonated: number;
  totalRegisteredDonors: number;
  totalLivesSaved: number;
  totalActiveClubs: number;
}

export interface RecentAchievement {
  id: string;
  description: string;
}

export const mockClubRankings: ClubRanking[] = [
  {
    rank: 1,
    clubName: 'Rotaract Club of Coimbatore Central',
    totalUnitsDonated: 42,
    totalRegisteredDonors: 120,
    totalSuccessfulDonations: 42,
    progressPercentage: 100,
  },
  {
    rank: 2,
    clubName: 'Rotaract Club of Chennai Midtown',
    totalUnitsDonated: 34,
    totalRegisteredDonors: 95,
    totalSuccessfulDonations: 34,
    progressPercentage: 81,
  },
  {
    rank: 3,
    clubName: 'Rotaract Club of Madurai Greater',
    totalUnitsDonated: 28,
    totalRegisteredDonors: 80,
    totalSuccessfulDonations: 28,
    progressPercentage: 66,
  },
  {
    rank: 4,
    clubName: 'Rotaract Club of Trichy Rockcity',
    totalUnitsDonated: 21,
    totalRegisteredDonors: 60,
    totalSuccessfulDonations: 21,
    progressPercentage: 50,
  },
  {
    rank: 5,
    clubName: 'Rotaract Club of Salem Steel City',
    totalUnitsDonated: 15,
    totalRegisteredDonors: 45,
    totalSuccessfulDonations: 15,
    progressPercentage: 35,
  },
];

export const mockDistrictStats: DistrictStats = {
  totalUnitsDonated: 1045,
  totalRegisteredDonors: 2500,
  totalLivesSaved: 3135,
  totalActiveClubs: 45,
};

export const mockRecentAchievements: RecentAchievement[] = [
  { id: '1', description: 'Rotaract Club of Coimbatore Central reached 50 donations.' },
  { id: '2', description: 'Rotaract Club of Chennai Midtown completed 10 emergency requests.' },
  { id: '3', description: 'District crossed 1000 blood units donated.' },
];
