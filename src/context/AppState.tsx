import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Cross-platform storage helper
const StorageAPI = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

// Import Types and Mock Data
import { mockAdmins } from '@/data/mockAdmins';
import { mockBloodRequests } from '@/data/mockBloodRequests';
import { mockDonations } from '@/data/mockDonations';
import { mockNotifications } from '@/data/mockNotifications';
import { mockUsers } from '@/data/mockUsers';
import { AppNotification, AuthResponse, DonationHistory, Donor, EmergencyRequest, UserSession } from '@/data/types';

export interface GoogleAuthData {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AppContextType {
  donors: Donor[];
  requests: EmergencyRequest[];
  donations: DonationHistory[];
  notifications: AppNotification[];
  currentUser: UserSession | null;
  isLoading: boolean; // Add loading state for initial auth check

  // Auth Methods
  pendingGoogleAuth: GoogleAuthData | null;
  setPendingGoogleAuth: (data: GoogleAuthData | null) => void;
  loginWithGoogle: (googleUser: GoogleAuthData) => Promise<'Admin' | 'Donor' | 'New_User'>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  getCurrentUser: () => UserSession | null;
  refreshToken: () => Promise<void>;

  registerDonor: (newDonor: Omit<Donor, 'id' | 'isActive' | 'totalDonations'>) => Promise<boolean>;
  createBloodRequest: (request: Omit<EmergencyRequest, 'id' | 'createdAt' | 'status' | 'createdBy' | 'unitsAccepted' | 'remainingUnits' | 'emergencyLevel' | 'approvedBy' | 'updatedAt' | 'interestedDonors' | 'approvedDonors' | 'createdById'> & { emergencyLevel?: EmergencyRequest['emergencyLevel'], createdByRole?: 'Admin' | 'Donor', createdById?: string }) => void;
  approveBloodRequest: (id: string) => void;
  rejectBloodRequest: (id: string) => void;
  updateBloodRequest: (id: string, updates: Partial<EmergencyRequest>) => void;
  markRequestComplete: (id: string) => void;
  markRequestPending: (id: string) => void;
  deleteBloodRequest: (id: string) => void;
  acceptBloodRequest: (id: string, donorId: string) => void;
  approveInterestedDonor: (requestId: string, donorId: string) => void;
  downloadDonationReport: (from: string, to: string) => Promise<void>;
  updateLastDonationDate: (donorId: string, date: string) => void;
  toggleDonorStatus: (donorId: string) => void;
  addDonationRecord: (record: Omit<DonationHistory, 'id'>) => void;
  deleteDonationRecord: (id: string) => void;
  markNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to calculate days between dates
export const getDaysSince = (dateString: string): number => {
  if (!dateString || dateString === 'Never') return 999;
  const lastDate = new Date(dateString);
  if (isNaN(lastDate.getTime())) return 999;
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Blood Compatibility Matrix
export const getCompatibleDonors = (requiredBloodGroup: string) => {
  const compatibility: Record<string, string[]> = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };
  return compatibility[requiredBloodGroup] || [];
};

const TOKEN_KEY = 'mock_jwt_access_token';
const REFRESH_TOKEN_KEY = 'mock_jwt_refresh_token';
const USER_KEY = 'mock_auth_user';

export const AppStatexProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [donors, setDonors] = useState<Donor[]>(mockUsers);
  const [requests, setRequests] = useState<EmergencyRequest[]>(mockBloodRequests);
  const [donations, setDonations] = useState<DonationHistory[]>(mockDonations);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [pendingGoogleAuth, setPendingGoogleAuth] = useState<GoogleAuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Auth Check
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const token = await StorageAPI.getItem(TOKEN_KEY);
        const storedUser = await StorageAPI.getItem(USER_KEY);

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to load auth state', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  const loginWithGoogle = async (googleUser: GoogleAuthData): Promise<'Admin' | 'Donor' | 'New_User'> => {
    const { email, name, id, picture } = googleUser;
    let authUser: UserSession | null = null;
    let roleResult: 'Admin' | 'Donor' | 'New_User' = 'New_User';

    // Check if Admin
    const foundAdmin = mockAdmins.find((a) => a.emailAddress.toLowerCase() === email.toLowerCase());
    if (foundAdmin) {
      authUser = {
        role: 'Admin',
        emailAddress: foundAdmin.emailAddress,
        name: foundAdmin.fullName,
        googleId: id,
        profilePicture: picture,
      };
      roleResult = 'Admin';
    } else {
      // Check if Donor
      const foundDonor = donors.find((d) => d.emailAddress.toLowerCase() === email.toLowerCase());
      if (foundDonor) {
        authUser = {
          role: 'Donor',
          emailAddress: foundDonor.emailAddress,
          name: foundDonor.fullName,
          googleId: id,
          profilePicture: picture,
          donorId: foundDonor.id,
        };
        roleResult = 'Donor';
      }
    }

    if (authUser) {
      // Create mock auth response
      const authResponse: AuthResponse = {
        accessToken: `mock-jwt-token-${Date.now()}`,
        refreshToken: `mock-refresh-token-${Date.now()}`,
        expiresIn: 3600,
        user: authUser
      };

      try {
        // Securely store the token and user data
        await StorageAPI.setItem(TOKEN_KEY, authResponse.accessToken);
        await StorageAPI.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
        await StorageAPI.setItem(USER_KEY, JSON.stringify(authUser));

        setCurrentUser(authUser);
      } catch (error) {
        console.error('Failed to save auth state', error);
      }
    } else {
      setPendingGoogleAuth(googleUser);
    }

    return roleResult;
  };

  const logout = async () => {
    try {
      await StorageAPI.removeItem(TOKEN_KEY);
      await StorageAPI.removeItem(REFRESH_TOKEN_KEY);
      await StorageAPI.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to clear auth state', error);
    } finally {
      setCurrentUser(null);
    }
  };

  const isAuthenticated = () => {
    return currentUser !== null;
  };

  const getCurrentUser = () => {
    return currentUser;
  };

  const refreshToken = async () => {
    // Mock refresh token logic. In a real app, you would make an API call to exchange the refresh token for a new access token.
    console.log("Mock: Refreshing token...");
    try {
      const newAccessToken = `mock-jwt-token-${Date.now()}`;
      await StorageAPI.setItem(TOKEN_KEY, newAccessToken);
    } catch (error) {
      console.error('Failed to refresh token', error);
    }
  };


  const registerDonor = async (newDonor: Omit<Donor, 'id' | 'isActive' | 'totalDonations'>): Promise<boolean> => {
    const emailExists = donors.some(
      (d) => d.emailAddress.toLowerCase() === newDonor.emailAddress.toLowerCase()
    );
    if (emailExists) {
      Alert.alert('Registration Failed', 'Email is already registered.');
      return false;
    }

    const id = `d${donors.length + 1}`;
    const addedDonor: Donor = {
      ...newDonor,
      id,
      isActive: true,
      totalDonations: 0,
    };

    setDonors((prev) => [addedDonor, ...prev]);

    // Automatically authenticate the user after registration
    const authUser: UserSession = {
      role: 'Donor',
      emailAddress: addedDonor.emailAddress,
      name: addedDonor.fullName,
      googleId: addedDonor.googleId,
      profilePicture: addedDonor.profilePicture,
      donorId: addedDonor.id,
    };

    const authResponse: AuthResponse = {
      accessToken: `mock-jwt-token-${Date.now()}`,
      refreshToken: `mock-refresh-token-${Date.now()}`,
      expiresIn: 3600,
      user: authUser
    };

    try {
      await StorageAPI.setItem(TOKEN_KEY, authResponse.accessToken);
      await StorageAPI.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
      await StorageAPI.setItem(USER_KEY, JSON.stringify(authUser));

      setCurrentUser(authUser);
      setPendingGoogleAuth(null);
    } catch (error) {
      console.error('Failed to save auth state after registration', error);
    }

    return true;
  };

  const createBloodRequest = (request: Omit<EmergencyRequest, 'id' | 'createdAt' | 'status' | 'createdBy' | 'unitsAccepted' | 'remainingUnits' | 'emergencyLevel' | 'approvedBy' | 'updatedAt' | 'interestedDonors' | 'approvedDonors' | 'createdById'> & { emergencyLevel?: EmergencyRequest['emergencyLevel'], createdByRole?: 'Admin' | 'Donor', createdById?: string }) => {
    const id = `r${requests.length + 1}`;
    const isDonor = request.createdByRole === 'Donor';
    
    const newRequest: EmergencyRequest = {
      ...request,
      id,
      unitsAccepted: 0,
      remainingUnits: request.unitsRequired,
      interestedDonors: [],
      approvedDonors: [],
      emergencyLevel: request.emergencyLevel || 'High',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: isDonor ? 'Pending Verification' : 'Pending',
      createdBy: currentUser?.name || 'Unknown',
      createdById: request.createdById,
    };

    setRequests((prev) => [newRequest, ...prev]);

    if (!isDonor) {
      // Send targeted notifications upon creation to compatible donors
      const compatibleBloodGroups = getCompatibleDonors(request.bloodGroup);
      const eligibleDonors = donors.filter(d =>
        d.isActive &&
        compatibleBloodGroups.includes(d.bloodGroup) &&
        (d.lastDonationDate === 'Never' || getDaysSince(d.lastDonationDate) >= 60)
      );

      const newNotifications = eligibleDonors.map((donor, idx) => ({
        id: `n${Date.now()}_${idx}`,
        userId: donor.id,
        title: `Emergency Blood Request`,
        body: `Blood Group: ${request.bloodGroup}\nHospital: ${request.hospitalName}\nLocation: Coimbatore\n${request.unitsRequired} Units Required\nTap to View`,
        type: 'Emergency' as const,
        createdAt: new Date().toISOString(),
        read: false,
      }));

      setNotifications((prevNotifs) => [...newNotifications, ...prevNotifs]);
    }
  };

  const approveBloodRequest = (id: string) => {
    const request = requests.find((req) => req.id === id);
    if (!request) return;

    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'Pending', updatedAt: new Date().toISOString() } : req))
    );

    // Send targeted notifications to compatible donors
    const compatibleBloodGroups = getCompatibleDonors(request.bloodGroup);
    const eligibleDonors = donors.filter(d =>
      d.isActive &&
      compatibleBloodGroups.includes(d.bloodGroup) &&
      (d.lastDonationDate === 'Never' || getDaysSince(d.lastDonationDate) >= 60)
    );

    const newNotifications = eligibleDonors.map((donor, idx) => ({
      id: `n${Date.now()}_approve_${idx}`,
      userId: donor.id,
      title: `Emergency Blood Request`,
      body: `Blood Group: ${request.bloodGroup}\nHospital: ${request.hospitalName}\nLocation: Coimbatore\n${request.unitsRequired} Units Required\nTap to View`,
      type: 'Emergency' as const,
      createdAt: new Date().toISOString(),
      read: false,
    }));

    setNotifications((prevNotifs) => [...newNotifications, ...prevNotifs]);
  };

  const rejectBloodRequest = (id: string) => {
    const request = requests.find((req) => req.id === id);
    if (!request) return;

    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'Rejected', updatedAt: new Date().toISOString() } : req))
    );

    if (request.createdById) {
      const rejectNotif: AppNotification = {
        id: `n_rejected_${Date.now()}`,
        userId: request.createdById,
        title: 'Blood Request Rejected',
        body: 'Your Blood Request has not been approved.\n\nPlease contact the BloodConnect Admin for more information.',
        type: 'System',
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((prevNotifs) => [rejectNotif, ...prevNotifs]);
    }
  };

  const updateBloodRequest = (id: string, updates: Partial<EmergencyRequest>) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, ...updates, updatedAt: new Date().toISOString() } : req))
    );
  };

  const markRequestComplete = (id: string) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'Completed', updatedAt: new Date().toISOString() } : req))
    );
  };

  const markRequestPending = (id: string) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'Pending', updatedAt: new Date().toISOString() } : req))
    );
  };

  const deleteBloodRequest = (id: string) => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
  };

  const acceptBloodRequest = (id: string, donorId: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          const alreadyInterested = req.interestedDonors?.includes(donorId) || req.approvedDonors?.includes(donorId);
          if (alreadyInterested) {
            return req;
          }

          const newInterestedDonors = [...(req.interestedDonors || []), donorId];

          return {
            ...req,
            interestedDonors: newInterestedDonors,
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      })
    );
  };

  const approveInterestedDonor = (requestId: string, donorId: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const newInterested = (req.interestedDonors || []).filter(id => id !== donorId);
          const newApproved = [...(req.approvedDonors || []), donorId];
          const newAccepted = req.unitsAccepted + 1;
          const newRemaining = Math.max(0, req.unitsRequired - newAccepted);

          const successNotif: AppNotification = {
            id: `n_approved_${Date.now()}`,
            userId: donorId,
            title: 'Donation Request Approved',
            body: `Your request to donate blood for ${req.patientName} has been approved. Patient details are now available.`,
            type: 'System',
            createdAt: new Date().toISOString(),
            read: false,
          };
          setNotifications((prevNotifs) => [successNotif, ...prevNotifs]);

          return {
            ...req,
            interestedDonors: newInterested,
            approvedDonors: newApproved,
            unitsAccepted: newAccepted,
            remainingUnits: newRemaining,
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      })
    );
  };

  const downloadDonationReport = async (from: string, to: string) => {
    try {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      // Ensure the time doesn't skew the date
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      const allCompleted = requests.filter(req => req.status === 'Completed');
      const completedRequests = allCompleted.filter(req => {
        if (!req.updatedAt) return false;
        const reqDate = new Date(req.updatedAt);
        return reqDate >= fromDate && reqDate <= toDate;
      });

      console.log("--- DONATION REPORT LOGGING ---");
      console.log("Selected From Date:", fromDate);
      console.log("Selected To Date:", toDate);
      console.log("Total Completed Records in DB:", allCompleted.length);
      console.log("Filtered Records Count:", completedRequests.length);
      console.log("-------------------------------");

      const donationRecords: any[] = [];
      let totalUnits = 0;
      let uniqueDonors = new Set<string>();

      completedRequests.forEach(req => {
        const donorCounts: Record<string, number> = {};
        (req.approvedDonors || []).forEach(donorId => {
          donorCounts[donorId] = (donorCounts[donorId] || 0) + 1;
        });

        Object.keys(donorCounts).forEach(donorId => {
          const d = donors.find(d => d.id === donorId);
          if (d) {
            const units = donorCounts[donorId];
            donationRecords.push({
              date: new Date(req.updatedAt!).toLocaleDateString(),
              donorName: d.fullName,
              bloodGroup: d.bloodGroup,
              patientName: req.patientName,
              hospitalName: req.hospitalName,
              units: units,
              status: req.status
            });
            totalUnits += units;
            uniqueDonors.add(donorId);
          }
        });
      });

      if (donationRecords.length === 0) {
        Alert.alert("No Records", "No donation records found for the selected date range.");
        return;
      }

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
              h1 { color: #E63946; text-align: center; }
              .header { text-align: center; margin-bottom: 40px; }
              .summary { display: flex; justify-content: space-between; background-color: #F8F9FA; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
              .summary-box { text-align: center; }
              .summary-title { font-size: 12px; color: #666; text-transform: uppercase; }
              .summary-value { font-size: 24px; font-weight: bold; color: #1D3557; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #1D3557; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>BloodConnect Donation Report</h1>
              <p>Selected Date Range</p>
              <p>From: <strong>${fromDate.toLocaleDateString()}</strong> To: <strong>${new Date(to).toLocaleDateString()}</strong></p>
              <p>Generated On: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="summary">
              <div class="summary-box">
                <div class="summary-title">Total Donations</div>
                <div class="summary-value">${donationRecords.length}</div>
              </div>
              <div class="summary-box">
                <div class="summary-title">Total Blood Units Donated</div>
                <div class="summary-value">${totalUnits}</div>
              </div>
              <div class="summary-box">
                <div class="summary-title">Total Donors</div>
                <div class="summary-value">${uniqueDonors.size}</div>
              </div>
              <div class="summary-box">
                <div class="summary-title">Total Patients Helped</div>
                <div class="summary-value">${completedRequests.length}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor Name</th>
                  <th>Blood Group</th>
                  <th>Patient Name</th>
                  <th>Hospital</th>
                  <th>Units</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${donationRecords.map(record => `
                  <tr>
                    <td>${record.date}</td>
                    <td>${record.donorName}</td>
                    <td>${record.bloodGroup}</td>
                    <td>${record.patientName}</td>
                    <td>${record.hospitalName}</td>
                    <td>${record.units}</td>
                    <td>${record.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      try {
        if (Platform.OS === 'web') {
          await Print.printAsync({ html: htmlContent });
          return;
        }

        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        console.log("Generated PDF URI:", uri);

        try {
          const isAvailable = await Sharing.isAvailableAsync();
          if (!isAvailable) {
            Alert.alert("Notice", "PDF generated successfully, but sharing is not supported on this device.");
            return;
          }

          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (!fileInfo.exists) {
            throw new Error("Generated PDF file does not exist or is unreadable.");
          }

          await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (shareError) {
          console.error("Share error:", shareError);
          Alert.alert("Error", "Failed to share the generated report.");
        }
      } catch (printError) {
        console.error("Print error:", printError);
        Alert.alert("Error", "Failed to generate report PDF.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to generate report.");
    }
  };

  const updateLastDonationDate = (donorId: string, date: string) => {
    setDonors((prev) =>
      prev.map((donor) => {
        if (donor.id === donorId) {
          const donationId = `h${donations.length + 1}`;
          const newDonation: DonationHistory = {
            id: donationId,
            donorId: donor.id,
            donorName: donor.fullName,
            bloodGroup: donor.bloodGroup,
            donationDate: date,
            units: 1,
            venue: 'Blood Bank / Hospital',
            status: 'Completed',
          };
          setDonations((prevHistory) => [newDonation, ...prevHistory]);

          return {
            ...donor,
            lastDonationDate: date,
            totalDonations: donor.totalDonations + 1,
          };
        }
        return donor;
      })
    );
  };

  const toggleDonorStatus = (donorId: string) => {
    setDonors((prev) =>
      prev.map((donor) => (donor.id === donorId ? { ...donor, isActive: !donor.isActive } : donor))
    );
  };

  const addDonationRecord = (record: Omit<DonationHistory, 'id'>) => {
    const id = `h${donations.length + 1}`;
    const newRecord: DonationHistory = {
      ...record,
      id,
    };
    setDonations((prev) => [newRecord, ...prev]);

    if (record.status === 'Completed') {
      setDonors((prev) =>
        prev.map((d) => {
          if (d.id === record.donorId) {
            return {
              ...d,
              lastDonationDate: record.donationDate,
              totalDonations: d.totalDonations + 1,
            };
          }
          return d;
        })
      );
    }
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteDonationRecord = (id: string) => {
    setDonations((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        donors,
        requests,
        donations,
        notifications,
        currentUser,
        isLoading,
        pendingGoogleAuth,
        setPendingGoogleAuth,
        loginWithGoogle,
        logout,
        isAuthenticated,
        getCurrentUser,
        refreshToken,
        registerDonor,
        createBloodRequest,
        approveBloodRequest,
        rejectBloodRequest,
        updateBloodRequest,
        markRequestComplete,
        markRequestPending,
        deleteBloodRequest,
        acceptBloodRequest,
        approveInterestedDonor,
        downloadDonationReport,
        updateLastDonationDate,
        toggleDonorStatus,
        addDonationRecord,
        deleteDonationRecord,
        markNotificationsAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
