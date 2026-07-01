import { DonationHistory } from './types';

export const mockDonations: DonationHistory[] = [
  {
    id: 'h1',
    donorId: 'd1',
    donorName: 'Rahul Sharma',
    bloodGroup: 'O+',
    donationDate: '2026-04-15',
    units: 1,
    venue: 'GKNM Hospital, Coimbatore',
    status: 'Completed',
  },
  {
    id: 'h2',
    donorId: 'd2',
    donorName: 'Sneha Ramakrishnan',
    bloodGroup: 'A-',
    donationDate: '2026-01-10',
    units: 1,
    venue: 'Rotary Blood Bank, Adyar',
    status: 'Completed',
  },
];
