// src/screens/Profile/EditProfileScreen.tsx
import AvatarChooserSheet from '@components/profile/AvatarChooserSheet';
import GenderPicker from '@components/profile/GenderPicker';
import PhoneRow from '@components/profile/PhoneRow';
import { useEditProfileForm } from '@screens/Profile/hooks/useEditProfileForm';
import { Button, Screen, Text } from '@ui';
import DobField from '@ui/primitives/DobField';
import { colors, contentWidth, fontSizes, lineHeights, radii, spacing } from '@ui/tokens';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';

/* Helpers to bridge Date <-> "DD-MM-YYYY" expected by DobField */
function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function dateToDDMMYYYY(d: Date | null): string | null {
  if (!d) return null;
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}
function ddmmyyyyToDate(s: string | null): Date | null {
  if (!s) return null;
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? null : d;
}

export default function EditProfileScreen() {
  const {
    name,
    setName,
    phoneNumber,
    setPhoneNumber,
    phoneCountryCode,
    gender,
    setGender,
    dob, // Date | null
    setDob, // Dispatch<SetStateAction<Date | null>>
    avatarKey,
    setAvatarKey,
    preferredLang,
    saving,
    errors,
    save,
  } = useEditProfileForm();

  const initial = (name || 'User').trim().charAt(0).toUpperCase();

  return (
    // Header shown by stack → let it handle the top inset
    <Screen safe={false} padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: spacing.md, paddingBottom: spacing.xl }}
        >
          {/* Constrain width on tablets for nicer reading */}
          <View
            style={{
              alignSelf: 'center',
              width: '100%',
              maxWidth: contentWidth.max, // ← FIX: use numeric value
              paddingHorizontal: spacing.md,
            }}
          >
            {/* Avatar */}
            <AvatarChooserSheet value={avatarKey} onChange={setAvatarKey} nameInitial={initial} />

            {/* Name */}
            <View style={{ marginTop: spacing.xs }}>
              <Text
                weight="semibold"
                color={colors.textPrimary}
                style={{ fontSize: fontSizes.sm, marginBottom: spacing.xs }}
              >
                Name
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={colors.textMuted}
                style={{
                  height: 44,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  paddingHorizontal: spacing.md,
                  color: colors.text,
                  fontSize: fontSizes.md,
                  lineHeight: lineHeights.md,
                }}
                autoCapitalize="words"
                autoCorrect
                returnKeyType="done"
              />

              {/* reserved error slot */}
              <View style={{ minHeight: fontSizes.sm + spacing.xs, marginTop: spacing.xs }}>
                {errors.name ? (
                  <Text color={colors.error} style={{ fontSize: fontSizes.sm }}>
                    {errors.name}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Phone */}
            <PhoneRow
              countryCode={phoneCountryCode}
              phone={phoneNumber}
              setPhone={setPhoneNumber}
              error={errors.phone}
            />

            {/* DOB (DobField expects "DD-MM-YYYY" string) */}
            <DobField
              value={dateToDDMMYYYY(dob)} // ← FIX: convert Date -> string
              onChange={(s) => setDob(ddmmyyyyToDate(s))} // ← FIX: convert string -> Date
              error={errors.dob}
            />

            {/* Gender */}
            <GenderPicker value={gender} onChange={setGender} error={errors.gender} />

            {/* Preferred language (read-only) */}
            <View style={{ marginTop: spacing.lg }}>
              <Text
                weight="semibold"
                color={colors.textPrimary}
                style={{ fontSize: fontSizes.sm, marginBottom: spacing.xs }}
              >
                Preferred language
              </Text>

              <TextInput
                editable={false}
                value={
                  {
                    en: 'English',
                    hi: 'Hindi',
                    te: 'Telugu',
                    ta: 'Tamil',
                    kn: 'Kannada',
                    ml: 'Malayalam',
                    mr: 'Marathi',
                    bn: 'Bengali',
                  }[(preferredLang || 'en').toLowerCase()] || 'English'
                }
                style={{
                  height: 44,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  paddingHorizontal: spacing.md,
                  color: colors.textSecondary,
                  fontSize: fontSizes.md,
                  lineHeight: lineHeights.md,
                  opacity: 0.9,
                }}
              />
            </View>

            {/* Actions */}
            <View style={{ marginTop: spacing.xl }}>
              <Button title="Save changes" onPress={save} loading={saving} disabled={saving} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
