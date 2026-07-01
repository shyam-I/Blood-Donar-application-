import { AppNotification } from './types';

export const mockNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: '🚨 Emergency O- Blood Required',
    body: 'Urgent O-ve blood required at KMCH, Coimbatore for Subramaniam K. Tap for details.',
    type: 'Emergency',
    createdAt: '2026-06-27T10:30:00Z',
    read: false,
  },
  {
    id: 'n2',
    title: '🏆 Top Donator Recognition',
    body: 'Congratulations to Rotaract Club of Coimbatore Central for achieving 50+ donations this quarter!',
    type: 'Recognition',
    createdAt: '2026-06-26T15:00:00Z',
    read: true,
  },
];
