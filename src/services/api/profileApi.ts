import { apiCall } from '../http/call';

export type GetProfileResponse = {
  success: boolean;
  message?: string;
  data: {
    user_id: string;
    full_name: string;
    phoneNumber?: string;
    phoneCountryCode?: string;
    date_of_birth: string | null;
    gender: string | null;
    profile_picture: string | null;
    preferred_language: string | null;
    is_profile_complete: boolean;
    created_at: string;
    updated_at: string;
  };
};

export const getProfile = () => apiCall<GetProfileResponse>('/user/getprofile', 'GET');

export type UpdateProfilePayload = {
  fullName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  preferredLanguage?: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  avatarKey?: string;
};

export type UpdateProfileResponse = {
  success: boolean;
  message?: string;
  data?: any | null;
};

export const updateProfile = (payload: UpdateProfilePayload) =>
  apiCall<UpdateProfileResponse>('/user/updateprofile', 'PATCH', payload);
