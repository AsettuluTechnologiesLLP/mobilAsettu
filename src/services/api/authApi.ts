import { apiCall } from '../apiClient';

export type SendOtpResponse = { success: boolean; error?: string };
export type VerifyOtpResponse = {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
};
export type RefreshResponse = {
  success: true;
  message?: string;
  data: { accessToken: string; refreshToken?: string; sessionId?: string };
};

export const sendOtp = (countryCode: string, phone: string) =>
  apiCall<SendOtpResponse>('/auth/sendotp', 'POST', { countryCode, phone });

export const resendOtp = (countryCode: string, phone: string) =>
  apiCall<SendOtpResponse>('/auth/sendotp', 'POST', { countryCode, phone, isResend: true });

export const verifyOtp = (countryCode: string, phone: string, otpCode: string) =>
  apiCall<VerifyOtpResponse>('/auth/verifyotp', 'POST', { countryCode, phone, otpCode });

export const refreshAccess = (refreshToken: string) =>
  apiCall<RefreshResponse>('/auth/refreshtoken', 'POST', { refreshToken });
