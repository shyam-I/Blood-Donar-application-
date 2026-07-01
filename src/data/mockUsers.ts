import { Donor } from './types';

export const mockUsers: Donor[] = [
  {
    id: 'd1',
    fullName: 'Rahul Sharma',
    phoneNumber: '9876543210',
    emailAddress: 'rahul.sharma@gmail.com',
    age: 24,
    gender: 'Male',
    profession: 'Software Engineer',
    address: '12, Race Course Road, Coimbatore - 641018',
    clubName: 'Rotaract Club of Coimbatore Central',
    clubDesignation: 'President',
    bloodGroup: 'O+',
    lastDonationDate: '2026-04-15', // ~74 days ago
    healthIssues: 'None',
    parentContact: 'Anil Sharma (Father)',
    emergencyNumber: '9876543211',
    isActive: true,
    totalDonations: 4,
  },
  {
    id: 'd2',
    fullName: 'Sneha Ramakrishnan',
    phoneNumber: '9845612345',
    emailAddress: 'sneha.r@outlook.com',
    age: 26,
    gender: 'Female',
    profession: 'Architect',
    address: '45, Gandhi Nagar, Adyar, Chennai - 600020',
    clubName: 'Rotaract Club of Chennai Midtown',
    clubDesignation: 'Secretary',
    bloodGroup: 'A-',
    lastDonationDate: '2026-01-10', // Eligible (>60 days)
    healthIssues: 'Mild Asthma (Controlled)',
    parentContact: 'R. Ramakrishnan (Father)',
    emergencyNumber: '9845612346',
    isActive: true,
    totalDonations: 6,
  }
];
