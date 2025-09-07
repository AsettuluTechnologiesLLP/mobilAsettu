// src/navigation/routes.ts
const ROUTES = {
  // Root
  SPLASH: 'Splash',
  AUTH_ROOT: 'Auth',
  APP_ROOT: 'App',

  // Tabs
  HOME_TAB: 'HomeTab',
  SERVICES_TAB: 'ServicesTab',
  ASSETS_TAB: 'AssetsTab',
  PROFILE_TAB: 'ProfileTab',

  // Screens in stacks
  HOME: 'Home',
  SERVICES: 'Services',
  ASSETS: 'Assets',
  PROFILE: 'Profile',

  // Auth
  LOGIN: 'Login',
  OTP: 'Otp',

  // Profile
  EDIT_PROFILE: 'EditProfile',
  ABOUT_ASETTU: 'AboutAsettu',

  // Household
  MANAGE_HOUSEHOLDS: 'ManageHouseholds',
  MANAGE_HOUSEHOLD_DETAILS: 'HouseholdDetails',
  MANAGE_MEMBERS: 'ManageMembers',
  ADD_HOUSEHOLD: 'AddHousehold',

  // Asetts
  MANAGE_ASSETS: 'ManageAssets',
  MANAGE_SERVICE_REQUESTS: 'ManageServiceRequests',
} as const;

export default ROUTES;
