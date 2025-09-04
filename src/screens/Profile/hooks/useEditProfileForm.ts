// src/screens/Profile/hooks/useEditProfileForm.ts
import { useNavigation } from '@react-navigation/native';
import { updateProfile } from '@services/api/profileApi';
import { useFlash } from '@ui/primitives/FlashMessage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useProfile } from './useProfile';

type Gender = 'male' | 'female' | undefined;

type Errors = {
  name?: string;
  email?: string;
  gender?: string;
  dob?: string;
};

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const parseDDMMYYYY = (s?: string | null): Date | null => {
  if (!s) return null;
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? null : d;
};

export function useEditProfileForm() {
  const navigation = useNavigation<any>();
  const { profile, setLocal, refresh } = useProfile();

  // form state (DOB stays string "DD-MM-YYYY")
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [gender, setGender] = useState<Gender>(undefined);
  const [dob, setDob] = useState<string | null>(null);

  // read-only phone
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>('');

  const { success, error } = useFlash();

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // for dirty detection
  const initialRef = useRef<{
    name: string;
    email: string;
    gender: '' | 'male' | 'female';
    dob: string;
  } | null>(null);

  const rehydrate = useCallback(() => {
    if (!profile) return;

    const initName = (profile.name ?? '').trim();
    const initEmail = (profile.email ?? '').trim();
    const initGender: '' | 'male' | 'female' =
      profile.gender === 'male' || profile.gender === 'female' ? profile.gender : '';
    const initDob = profile.dateOfBirth ?? '';

    initialRef.current = {
      name: initName,
      email: initEmail,
      gender: initGender,
      dob: initDob,
    };

    setName(initName);
    setEmail(initEmail);
    setGender(initGender || undefined);
    setDob(initDob || null);

    setPhoneNumber(profile.phoneNumber ?? '');
    setPhoneCountryCode(profile.phoneCountryCode ?? '');

    setErrors({});
  }, [profile]);

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  const isDirty = useMemo(() => {
    if (!initialRef.current) return false;
    const current = {
      name: name.trim(),
      email: email.trim(),
      gender: (gender ?? '') as '' | 'male' | 'female',
      dob: dob ?? '',
    };
    const init = initialRef.current;
    return (
      current.name !== init.name ||
      current.email !== init.email ||
      current.gender !== init.gender ||
      current.dob !== init.dob
    );
  }, [name, email, gender, dob]);

  const isValid = useMemo(() => {
    const nm = name.trim();
    const em = email.trim();
    if (!nm) return false;
    if (!em || !isValidEmail(em)) return false;
    if (!(gender === 'male' || gender === 'female')) return false;

    const d = parseDDMMYYYY(dob);
    if (!d) return false;
    const today = new Date();
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return d0.getTime() <= t0.getTime();
  }, [name, email, gender, dob]);

  const canSave = !saving && isDirty && isValid;

  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Please enter your name';

    const e = email.trim();
    if (!e) next.email = 'Email is required';
    else if (!isValidEmail(e)) next.email = 'Enter a valid email address';

    if (!(gender === 'male' || gender === 'female')) next.gender = 'Please select your gender';

    const d = parseDDMMYYYY(dob);
    if (!d) next.dob = 'Please pick a valid date (DD-MM-YYYY)';
    else {
      const today = new Date();
      const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (d0.getTime() > t0.getTime()) next.dob = 'DOB cannot be in the future';
    }

    return next;
  };

  const save = async () => {
    if (!isDirty) {
      success('There are no changes to save.');
      return;
    }

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    const payload = {
      fullName: name.trim(),
      email: email.trim(),
      gender: gender as 'male' | 'female',
      dateOfBirth: dob!, // <-- send DD-MM-YYYY
      preferredLanguage: 'en',
    } as const;

    try {
      setSaving(true);
      await updateProfile(payload);

      // optimistic cache
      setLocal({
        name: payload.fullName,
        email: payload.email,
        gender: payload.gender,
        dateOfBirth: payload.dateOfBirth,
      });

      // fetch from server to reconcile
      await refresh({ force: true, source: 'after-save' });

      // reset snapshot
      initialRef.current = {
        name: payload.fullName,
        email: payload.email,
        gender: payload.gender,
        dob: payload.dateOfBirth,
      };

      success('Profile updated successfully');
      navigation.goBack();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Something went wrong.';
      error(msg);
    } finally {
      setSaving(false);
    }
  };

  return {
    // values
    name,
    email,
    dob,
    gender,
    phoneNumber,
    phoneCountryCode,

    // setters
    setName,
    setEmail,
    setDob,
    setGender,

    // ui
    saving,
    errors,
    canSave,

    // actions
    save,
  };
}
