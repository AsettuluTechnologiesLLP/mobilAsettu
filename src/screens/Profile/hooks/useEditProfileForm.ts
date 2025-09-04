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

/** Convert a Date to ISO at midnight UTC (stable date only) */
const toIsoMidnightUtc = (d: Date) =>
  new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)).toISOString();

/** Normalize a Date (or null) into ISO-midnight string for comparisons */
const normDobISO = (d: Date | null) => (d ? toIsoMidnightUtc(d) : '');

export function useEditProfileForm() {
  const navigation = useNavigation<any>();
  const { profile, setLocal, refresh } = useProfile();

  // form state
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [gender, setGender] = useState<Gender>(undefined);
  const [dob, setDob] = useState<Date | null>(null);

  // read-only phone (display only)
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>('');

  const { success, error } = useFlash();

  // ui
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // keep an initial snapshot to detect changes
  const initialRef = useRef<{
    name: string;
    email: string;
    gender: '' | 'male' | 'female';
    dobISO: string;
  } | null>(null);

  // hydrate from store
  const rehydrate = useCallback(() => {
    if (!profile) return;

    const initName = (profile.name ?? '').trim();
    const initEmail = (profile.email ?? '').trim();
    const initGender: '' | 'male' | 'female' =
      profile.gender === 'male' || profile.gender === 'female' ? profile.gender : '';
    const initDobISO = profile.dateOfBirth ? normDobISO(new Date(profile.dateOfBirth)) : '';

    initialRef.current = {
      name: initName,
      email: initEmail,
      gender: initGender,
      dobISO: initDobISO,
    };

    setName(initName);
    setEmail(initEmail);
    setGender(initGender || undefined);
    setDob(profile.dateOfBirth ? new Date(profile.dateOfBirth) : null);

    setPhoneNumber(profile.phoneNumber ?? '');
    setPhoneCountryCode(profile.phoneCountryCode ?? '');

    setErrors({});
  }, [profile]);

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  // derived: dirty flag (compare normalized current vs initial snapshot)
  const isDirty = useMemo(() => {
    if (!initialRef.current) return false;
    const current = {
      name: name.trim(),
      email: email.trim(),
      gender: (gender ?? '') as '' | 'male' | 'female',
      dobISO: normDobISO(dob),
    };
    const init = initialRef.current;
    return (
      current.name !== init.name ||
      current.email !== init.email ||
      current.gender !== init.gender ||
      current.dobISO !== init.dobISO
    );
  }, [name, email, gender, dob]);

  // lightweight validity (for disabling the button)
  const isValid = useMemo(() => {
    const nm = name.trim();
    const em = email.trim();
    if (!nm) return false;
    if (!em || !isValidEmail(em)) return false;
    if (!(gender === 'male' || gender === 'female')) return false;
    if (!dob) return false;

    // no future dates
    const today = new Date();
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dobZero = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
    if (dobZero.getTime() > todayZero.getTime()) return false;

    return true;
  }, [name, email, gender, dob]);

  // expose to screen
  const canSave = !saving && isDirty && isValid;

  // full validation for messages
  const validate = (): Errors => {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Please enter your name';

    const e = email.trim();
    if (!e) next.email = 'Email is required';
    else if (!isValidEmail(e)) next.email = 'Enter a valid email address';

    if (!(gender === 'male' || gender === 'female')) next.gender = 'Please select your gender';

    if (!dob) next.dob = 'Please pick your date of birth';
    else {
      const today = new Date();
      const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dobZero = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
      if (dobZero.getTime() > todayZero.getTime()) next.dob = 'DOB cannot be in the future';
    }

    return next;
  };

  const save = async () => {
    // prevent no-op saves
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
      dateOfBirth: toIsoMidnightUtc(dob!),
      preferredLanguage: 'en',
    } as const;

    try {
      setSaving(true);
      await updateProfile(payload);

      // optimistic cache update
      setLocal({
        name: payload.fullName,
        email: payload.email,
        gender: payload.gender,
        dateOfBirth: payload.dateOfBirth,
      });

      // refresh from server to reconcile
      await refresh({ force: true, source: 'after-save' });

      // reset snapshot to new values (form now "clean")
      initialRef.current = {
        name: payload.fullName,
        email: payload.email,
        gender: payload.gender,
        dobISO: payload.dateOfBirth,
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
    // values for the screen
    name,
    email,
    phoneNumber,
    phoneCountryCode,
    dob,
    gender,

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
