// src/screens/Profile/hooks/useEditProfileForm.ts
import { AvatarKey } from '@assets/avatars';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '@screens/Profile/hooks/useProfile';
import { updateProfile, UpdateProfilePayload } from '@services/api';
import { formatDobForApi } from '@utils/date';
import logger from '@utils/logger';
import { useState } from 'react';
import { Alert } from 'react-native';

export function useEditProfileForm() {
  const navigation = useNavigation();
  const { profile, setLocal } = useProfile();

  const [name, setName] = useState(profile?.name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber ?? '');
  const [phoneCountryCode] = useState<string>(profile?.phoneCountryCode ?? '+91'); // locked
  const [gender, setGender] = useState<string>(profile?.gender ?? '');
  const [dob, setDob] = useState<Date | null>(
    profile?.dateOfBirth ? new Date(profile.dateOfBirth) : null,
  );
  const [avatarKey, setAvatarKey] = useState<AvatarKey | null>(
    (profile?.avatarKey as AvatarKey) ?? null,
  );

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const preferredLang = profile?.preferredLanguage || 'en';

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required.';
    if (!phoneNumber.trim()) e.phone = 'Phone number is required.';
    if (phoneNumber && !/^\d+$/.test(phoneNumber)) e.phone = 'Digits only.';
    if (dob && dob.getTime() > Date.now()) e.dob = 'Date cannot be in the future.';
    if (gender && !['male', 'female'].includes(gender.toLowerCase()))
      e.gender = 'Choose Male or Female.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;

    try {
      setSaving(true);

      const payload: UpdateProfilePayload = {
        fullName: name.trim(),
        dateOfBirth: dob ? formatDobForApi(dob) : undefined,
        gender: gender ? (gender.toLowerCase() as 'male' | 'female') : undefined,
        preferredLanguage: preferredLang,

        // Uncomment when backend accepts these:
        // phoneNumber: phoneNumber.trim(),
        // phoneCountryCode,
        // avatarKey: avatarKey ?? undefined,
      };

      const res = await updateProfile(payload);
      if (!res?.success) throw new Error(res?.message || 'Update failed');

      // Update local cache after server success
      setLocal({
        name: name.trim(),
        // phoneNumber: phoneNumber.trim(),
        // phoneCountryCode,
        gender: gender || undefined,
        dateOfBirth: dob ? dob.toISOString() : undefined,
        avatarKey: avatarKey ?? undefined,
      });

      Alert.alert('Profile', 'Changes saved.');
      // @ts-ignore (navigation type not critical here)
      navigation.goBack();
    } catch (e: any) {
      logger.error('[EditProfile] save error', e?.message);
      Alert.alert('Profile', e?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return {
    // state
    name,
    setName,
    phoneNumber,
    setPhoneNumber,
    phoneCountryCode,
    gender,
    setGender,
    dob,
    setDob,
    avatarKey,
    setAvatarKey,

    // derived
    preferredLang,

    // ui
    saving,
    errors,

    // actions
    save,
  };
}
