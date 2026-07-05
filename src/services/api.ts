/**
 * BloodConnect API Service (Future Integration)
 * 
 * This service implements the exact API contract finalized by the backend team.
 * It is structured to seamlessly replace the mock functions in AppState 
 * once the backend is fully deployed and ready for integration.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }
  return response.json();
}

// ==========================================================
// AUTH
// ==========================================================
export const AuthAPI = {
  loginWithGoogle: (googleData: { id: string; email: string; name: string; picture?: string }) => 
    fetchWithAuth('/api/auth/google', { method: 'POST', body: JSON.stringify(googleData) }),
  getMe: () => fetchWithAuth('/api/auth/me')
};

// ==========================================================
// USER
// ==========================================================
export const UserAPI = {
  getProfile: () => fetchWithAuth('/api/users/profile'),
  updateProfile: (profileData: any) => 
    fetchWithAuth('/api/users/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
  registerFCM: (fcmToken: string) =>
    fetchWithAuth('/api/users/fcm', { method: 'POST', body: JSON.stringify({ token: fcmToken }) })
};

// ==========================================================
// BLOOD REQUESTS (DONOR VIEW)
// ==========================================================
export const DonorRequestsAPI = {
  getRequests: () => fetchWithAuth('/api/requests'),
  getRequestDetails: (id: string) => fetchWithAuth(`/api/requests/${id}`)
};

// ==========================================================
// ADMIN
// ==========================================================
export const AdminAPI = {
  getDashboardStats: () => fetchWithAuth('/api/admin/dashboard'),
  getUsers: () => fetchWithAuth('/api/admin/users'),
  getUserDetails: (id: string) => fetchWithAuth(`/api/admin/users/${id}`),
  createRequest: (requestData: any) => 
    fetchWithAuth('/api/admin/requests', { method: 'POST', body: JSON.stringify(requestData) }),
  getRequests: () => fetchWithAuth('/api/admin/requests'),
  updateRequest: (id: string, requestData: any) => 
    fetchWithAuth(`/api/admin/requests/${id}`, { method: 'PUT', body: JSON.stringify(requestData) }),
  markRequestComplete: (id: string) => fetchWithAuth(`/api/admin/requests/${id}/complete`, { method: 'PATCH' }),
  markRequestPending: (id: string) => fetchWithAuth(`/api/admin/requests/${id}/pending`, { method: 'PATCH' }),
  deleteRequest: (id: string) => fetchWithAuth(`/api/admin/requests/${id}`, { method: 'DELETE' }),
};

// ==========================================================
// ANALYTICS
// ==========================================================
export const AnalyticsAPI = {
  getMonthlyAnalytics: () => fetchWithAuth('/api/admin/analytics/monthly'),
  getAnalyticsPDF: (from: string, to: string) => fetchWithAuth(`/api/admin/analytics/pdf?from=${from}&to=${to}`)
};
