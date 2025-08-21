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

  // Profile (NEW)
  EDIT_PROFILE: 'EditProfile',
  ABOUT_ASETTU: 'AboutAsettu',
  MANAGE_HOUSEHOLDS: 'ManageHouseholds',
  MANAGE_MEMBERS: 'ManageMembers',
  MANAGE_ASSETS: 'ManageAssets',
  MANAGE_SERVICE_REQUESTS: 'ManageServiceRequests',
} as const;

export default ROUTES;
