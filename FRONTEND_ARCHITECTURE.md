# BloodConnect Frontend Architecture & Flow

This document provides a clear overview of the frontend architecture, business logic, and workflows implemented in the **Blood Donation App (BloodConnect)**. It is designed to help any incoming developer (frontend or backend) understand how the application works, what has been built, and how to continue development.

## 📌 Technology Stack

- **Framework**: React Native with Expo (Expo Router for navigation)
- **Styling**: StyleSheet (React Native default) with a centralized theme system (`src/constants/theme.ts`)
- **Icons**: Lucide React Native
- **State Management**: React Context API (`src/context/AppState.tsx`)
- **Backend Readiness**: Currently running on centralized Mock Data (`src/data/`), fully prepared to be replaced with real API calls.

---

## 📂 Project Structure

```text
src/
├── app/                  # Expo Router file-based routing
│   ├── _layout.tsx       # Root layout wrapping the app with AppStateProvider
│   ├── index.tsx         # Splash / Initial Entry Screen
│   ├── login.tsx         # Universal Login Screen (Mobile + OTP)
│   ├── register.tsx      # 3-Step Registration Flow
│   ├── (admin)/          # Admin specific screens (Tabs)
│   │   ├── dashboard.tsx # Analytics, stats, recent donors
│   │   ├── donors.tsx    # Manage/Search donors, toggle status
│   │   ├── request-create.tsx # Broadcast blood emergency
│   │   └── notifications.tsx # Admin alerts
│   └── (donor)/          # Donor specific screens (Tabs)
│       ├── dashboard.tsx # Eligibility status, Active alerts
│       ├── search.tsx    # Search donors by blood group/club
│       ├── requests.tsx  # View active/fulfilled blood requests
│       ├── recognition.tsx # Rewards, leaderboard, digital card
│       └── profile.tsx   # View/Edit personal details, log donation
├── components/           # Reusable UI components
│   ├── Button.tsx        # Standardized button
│   ├── Input.tsx         # Standardized text input
│   ├── Card.tsx          # Card container with shadows/borders
│   └── CustomChart.tsx   # Visual data representations (Admin)
├── context/
│   └── AppState.tsx      # Global state, authentication logic, business logic
├── data/                 # Centralized Mock Database
│   ├── types.ts          # TypeScript interfaces (Donor, Request, etc.)
│   ├── mockUsers.ts      # Array of mock donor profiles
│   ├── mockAdmins.ts     # Array of mock admin profiles
│   ├── mockBloodRequests.ts # Active and fulfilled emergency requests
│   ├── mockDonations.ts  # History of logged donations
│   └── ...
└── constants/
    └── theme.ts          # Color palettes and typography constants
```

---

## 🔄 Core Application Flows

### 1. Authentication Flow
- **Single Entry Point**: All users (Donors and Admins) log in through `login.tsx`.
- **Identifier**: Mobile Number (Email is only used for communication).
- **OTP Verification**: A simulated OTP step requires a 6-digit code (Use `123456` for testing).
- **Role Resolution**: 
  - Upon successful OTP, `AppState.tsx` checks if the number exists in `mockAdmins`. If yes, redirects to `/(admin)/dashboard`.
  - If not in Admins, it checks `mockUsers`. If found, redirects to `/(donor)/dashboard`.
  - If not found in either, alerts the user to register.

### 2. Registration Flow (Donors)
- **3-Step Process** (`register.tsx`):
  1. **Personal**: Full Name, Gender, Age/DOB, Mobile, Email, Address.
  2. **Affiliation**: Rotaract Club Name, Designation (Optional).
  3. **Medical**: Blood Group, Last Donation Date, Health Issues, Emergency Contact.
- **Completion**: Adds the new user to the global `donors` array in memory and redirects to the Login screen.

### 3. Donor Workflow
- **Dashboard**: Displays a visual indicator of their **Donation Eligibility**.
  - *Logic*: A donor must wait **60 Days** between donations. If `lastDonationDate` is within 60 days, they are marked as "On Cooldown".
- **Emergency Requests**: Donors can view broadcasted emergency requests (`Open`). They can click "I Can Donate" to simulate an intent to donate, which verifies their eligibility first.
- **Logging Donations**: From the Profile tab, donors can log a past donation by providing a date. This updates their `lastDonationDate` and recounts their eligibility cooldown.

### 4. Admin Workflow
- **Dashboard**: Generates real-time statistics (Total Donors, Active Requests, Monthly Trends, Club Leaderboards).
- **Manage Donors**: Search donors by Name, Blood Group, or Club. View full profiles and toggle their active status (if a donor is sick, an admin can temporarily disable their availability).
- **Broadcast Requests**: Create urgent blood requests specifying Patient Name, Blood Group, Units Needed, and Deadline. This immediately pushes the request to the Donor Requests feed.

---

## ✅ What Has Been Completed So Far

1. **Complete UI Implementation**: All screens for Auth, Donors, and Admins are built, styled, and responsive.
2. **Global State Integration**: The UI components are completely detached from local dummy variables and are now hooked up to the `useAppState()` hook.
3. **Mock Backend (`src/data`)**: A robust relational mock database using TypeScript arrays handles relationships between Donors, Requests, Donations, and Notifications.
4. **Business Logic Hooks**:
   - Universal Phone + OTP Login.
   - 3-Step Profile Registration.
   - 60-Day Cooldown Eligibility Calculator.
   - Status filtering (`Open`, `Completed`, `Closed` for requests).
5. **Type Safety & Stability**: All TypeScript errors across major components (`dashboard`, `search`, `profile`, `donors`) have been resolved, including safe handling of optional fields like `clubName`.

---

## 🚀 Next Steps for Backend Integration

To swap out the mock data for a real backend (e.g., Node.js + MongoDB or Firebase):

1. **Replace Initial State Loading**:
   In `src/context/AppState.tsx`, replace the static imports (`mockUsers`, `mockAdmins`) with a `useEffect` that fetches data from your API on app load.

2. **Update Auth Methods**:
   Update `login(phone, otp)` to make an HTTP POST request to `/api/auth/verify-otp`. Store the returned JWT token securely (e.g., `expo-secure-store`).

3. **Convert Synchronous Actions to Asynchronous**:
   Functions like `createEmergencyRequest` or `updateLastDonationDate` in `AppState.tsx` simply push to local arrays right now. They should be updated to `await fetch('/api/...')` endpoints.

4. **WebSockets / Push Notifications**:
   Currently, emergency requests populate the screen instantly because of React State. For real devices, implement real-time listeners (like Firebase Cloud Messaging or Socket.io) to trigger push notifications when an admin broadcasts a request.
