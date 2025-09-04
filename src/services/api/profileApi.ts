// src/services/api/profileApi.ts
import { apiCall } from '../http/call';

/** ---- Server (wire) shapes: snake_case ---- */
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

/** ---- App (client) shapes: camelCase ---- */
export type ProfileApiModel = {
  userId: string;
  fullName: string;
  email: string | null;
  gender: 'male' | 'female' | null;
  dateOfBirth: string | null;
  avatarPicture: string | null;
  preferredLanguage: string | null;
  isProfileComplete: any;
  countryCode: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Map server -> client */
function fromServer(d: GetProfileResponse['data']): ProfileApiModel {
  return {
    userId: d.user_id,
    fullName: d.full_name,
    email: d.email,
    gender: d.gender,
    dateOfBirth: d.date_of_birth,
    avatarPicture: d.avatar_picture,
    preferredLanguage: d.preferred_language,
    isProfileComplete: d.is_profile_complete,
    countryCode: d.country_code ?? null,
    phone: d.phone ?? null,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

/** Prefer this in app code: returns camelCase model */
export const getProfile = async (): Promise<ProfileApiModel> => {
  const res = await apiCall<GetProfileResponse>('/user/getprofile', 'GET');
  return fromServer(res.data);
};

/** ---- Update (client -> server) ---- */
export type UpdateProfilePayload = {
  fullName: string;
  email: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  preferredLanguage?: string;
  avatarPicture?: string;
};

/** Map client -> server */
function toServer(p: UpdateProfilePayload) {
  return {
    full_name: p.fullName,
    email: p.email,
    gender: p.gender,
    date_of_birth: p.dateOfBirth,
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
  const body = toServer(payload);
  return apiCall<UpdateProfileResponse>('/user/updateprofile', 'PATCH', body);
};
