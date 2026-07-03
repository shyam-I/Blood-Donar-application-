import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Import Types and Mock Data
import { Donor, Admin, EmergencyRequest, DonationHistory, AppNotification, UserSession, AuthResponse } from '@/data/types';
import { mockUsers } from '@/data/mockUsers';
import { mockAdmins } from '@/data/mockAdmins';
import { mockBloodRequests } from '@/data/mockBloodRequests';
import { mockDonations } from '@/data/mockDonations';
import { mockNotifications } from '@/data/mockNotifications';

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
  createBloodRequest: (request: Omit<EmergencyRequest, 'id' | 'createdAt' | 'status' | 'createdBy' | 'unitsAccepted' | 'remainingUnits' | 'emergencyLevel' | 'approvedBy' | 'updatedAt' | 'acceptedDonors'> & { emergencyLevel?: EmergencyRequest['emergencyLevel'] }) => void;
  approveBloodRequest: (id: string) => void;
  rejectBloodRequest: (id: string) => void;
  acceptBloodRequest: (id: string, donorId: string) => void;
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

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);
        
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
        await SecureStore.setItemAsync(TOKEN_KEY, authResponse.accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, authResponse.refreshToken);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(authUser));
        
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
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
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
       await SecureStore.setItemAsync(TOKEN_KEY, newAccessToken);
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
      await SecureStore.setItemAsync(TOKEN_KEY, authResponse.accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, authResponse.refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(authUser));
      
      setCurrentUser(authUser);
      setPendingGoogleAuth(null);
    } catch (error) {
      console.error('Failed to save auth state after registration', error);
    }

    return true;
  };

  const createBloodRequest = (request: Omit<EmergencyRequest, 'id' | 'createdAt' | 'status' | 'createdBy' | 'unitsAccepted' | 'remainingUnits' | 'emergencyLevel' | 'approvedBy' | 'updatedAt' | 'acceptedDonors'> & { emergencyLevel?: EmergencyRequest['emergencyLevel'] }) => {
    const id = `r${requests.length + 1}`;
    const newRequest: EmergencyRequest = {
      ...request,
      id,
      unitsAccepted: 0,
      remainingUnits: request.unitsRequired,
      acceptedDonors: [],
      emergencyLevel: request.emergencyLevel || 'High',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Pending',
      createdBy: currentUser?.name || 'Unknown',
    };

    setRequests((prev) => [newRequest, ...prev]);
  };

  const approveBloodRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          const updatedReq = {
            ...req,
            status: 'Approved' as const,
            approvedBy: currentUser?.name || 'Admin',
            updatedAt: new Date().toISOString(),
          };
          
          // Send targeted notifications upon approval to compatible donors
          const compatibleBloodGroups = getCompatibleDonors(req.bloodGroup);
          const eligibleDonors = donors.filter(d => 
            d.isActive && 
            compatibleBloodGroups.includes(d.bloodGroup) && 
            (d.lastDonationDate === 'Never' || getDaysSince(d.lastDonationDate) >= 60)
          );

          const newNotifications = eligibleDonors.map((donor, idx) => ({
            id: `n${Date.now()}_${idx}`,
            userId: donor.id,
            title: `Emergency Blood Request`,
            body: `Blood Group: ${req.bloodGroup}\nHospital: ${req.hospitalName}\nLocation: Coimbatore\n${req.unitsRequired} Units Required\nTap to View`,
            type: 'Emergency' as const,
            createdAt: new Date().toISOString(),
            read: false,
          }));

          setNotifications((prevNotifs) => [...newNotifications, ...prevNotifs]);

          return updatedReq;
        }
        return req;
      })
    );
  };

  const rejectBloodRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: 'Rejected', updatedAt: new Date().toISOString() } : req
      )
    );
  };

  const acceptBloodRequest = (id: string, donorId: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          const alreadyAccepted = req.acceptedDonors?.includes(donorId);
          if (alreadyAccepted) {
            Alert.alert("Already Accepted", "You have already accepted this blood request.");
            return req;
          }

          const newAccepted = req.unitsAccepted + 1;
          const newRemaining = Math.max(0, req.unitsRequired - newAccepted);
          const newStatus = newRemaining === 0 ? 'Completed' : 'Partially Filled';
          const newAcceptedDonors = [...(req.acceptedDonors || []), donorId];

          if (newRemaining === 0) {
            const successNotif: AppNotification = {
              id: `n_success_${Date.now()}`,
              title: 'Blood Request Successfully Completed',
              body: `The request for ${req.patientName} (${req.bloodGroup}) has been fulfilled.`,
              type: 'System',
              createdAt: new Date().toISOString(),
              read: false,
            };
            setNotifications((prevNotifs) => [successNotif, ...prevNotifs]);
          }

          return {
            ...req,
            unitsAccepted: newAccepted,
            remainingUnits: newRemaining,
            acceptedDonors: newAcceptedDonors,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      })
    );
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
        acceptBloodRequest,
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
