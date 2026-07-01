export interface Donor {
  id: string;
  fullName: string;
  phoneNumber: string; // Used for Login
  emailAddress: string; // Used for Communication only
  age: number; // Used to validate if 18-65
  gender: string;
  profession: string;
  address: string;
  
  // Rotaract Info (Optional)
  clubName?: string;
  clubDesignation?: string;
  
  // Medical Info
  bloodGroup: string;
  lastDonationDate: string; // ISO string or YYYY-MM-DD
  healthIssues: string;
  parentContact: string; // Emergency Contact Name
  emergencyNumber: string; // Emergency Contact Number
  
  // App Logic
  isActive: boolean; // Active & Available
  totalDonations: number;
}

export interface Admin {
  id: string;
  fullName: string;
  phoneNumber: string; // Used for Login
  emailAddress: string;
}

export interface EmergencyRequest {
  id: string;
  patientName: string;
  guardianName?: string;
  bloodGroup: string;
  hospitalName: string;
  hospitalAddress?: string;
  unitsRequired: number;
  unitsAccepted: number;
  remainingUnits: number;
  acceptedDonors?: string[];
  contactNumber: string;
  requiredByDate: string;
  notes: string;
  status: 'Pending' | 'Open' | 'Approved' | 'Partially Filled' | 'Completed' | 'Closed' | 'Rejected';
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  approvedBy?: string;
  emergencyLevel: 'Normal' | 'Urgent' | 'Critical' | 'High';
}

export interface DonationHistory {
  id: string;
  donorId: string;
  donorName: string;
  bloodGroup: string;
  donationDate: string;
  units: number;
  venue: string;
  status: 'Accepted' | 'Hospital Reached' | 'Guardian OTP Verified' | 'Admin Verified' | 'Completed';
  requestId?: string; // Optional link to a specific request
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'Emergency' | 'Event' | 'Recognition' | 'System';
  createdAt: string;
  read: boolean;
  userId?: string; // If undefined, it's a global notification
}

export interface AppSettings {
  notificationsEnabled: boolean;
  darkTheme: boolean;
  language: string;
}

export interface UserSession {
  role: 'Admin' | 'Donor';
  phoneNumber: string;
  name: string;
  donorId?: string; // If role is Donor
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserSession;
}
