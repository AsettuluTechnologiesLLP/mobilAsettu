export * from './api/authApi';
export * from './api/householdApi';
export * from './api/profileApi';

// app code (e.g., OTP flow) still needs these two:
export { setAuthTokens, setUnauthorizedHandler } from './http/client';
