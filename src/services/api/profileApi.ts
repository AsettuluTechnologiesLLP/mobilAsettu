// src/services/api/profileApi.ts
import { apiCall } from '../http/call';

export type GetProfileResponse = {
  success: boolean;
  message?: string;
  data: {
    user_id: string;
    full_name: string;
    email: string | null;
    gender: 'male' | 'female' | null;
    date_of_birth: string | null;
    avatar_picture: string | null;
    preferred_language: string | null;
    is_profile_complete: any;
    country_code?: string | null;
    phone?: string | null;
    created_at: string;
    updated_at: string;
  };
};

export const getProfile = () => apiCall<GetProfileResponse>('/user/getprofile', 'GET');

export type UpdateProfilePayload = {
  fullName: string;
  email: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  preferredLanguage?: string;
  avatarPicture?: string;
};

function toServer(p: UpdateProfilePayload) {
  return {
    full_name: p.fullName,
    email: p.email,
    gender: p.gender,
    date_of_birth: p.dateOfBirth, // ISO expected by server
    preferred_language: p.preferredLanguage ?? 'en',
    avatar_picture: p.avatarPicture ?? '',
  };
}

export type UpdateProfileResponse = {
  success: boolean;
  message?: string;
  data?: any | null;
};

export const updateProfile = async (payload: UpdateProfilePayload) => {
  console.log('[profileApi.updateProfile] payload →', payload);
  const body = toServer(payload);

  console.log('[profileApi.updateProfile] body (snake) →', body);
  return apiCall<UpdateProfileResponse>('/user/updateprofile', 'PATCH', body);
};
