// src/screens/Profile/EditProfileScreen.tsx
import { useEditProfileForm } from '@screens/Profile/hooks/useEditProfileForm';
import { Button, Screen, Text } from '@ui';
import DobField from '@ui/primitives/DobField';
import GenderPicker from '@ui/primitives/GenderPicker';
import { colors, contentWidth, fontSizes, lineHeights, radii, spacing } from '@ui/tokens';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';

function Field({
  label,
  error,
  children,
  mb = spacing.sm,
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
  mb?: number;
}) {
  return (
    <View style={{ marginBottom: mb }}>
      <Text
        weight="semibold"
        color={colors.textPrimary}
        style={{ fontSize: fontSizes.sm, marginBottom: 6 }}
      >
        {label}
      </Text>
      {children}
      {!!error && (
        <Text color={colors.error} style={{ fontSize: fontSizes.sm, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

export default function EditProfileScreen() {
  const {
    name,
    email,
    dob,
    gender,
    phoneNumber,
    phoneCountryCode,
    setName,
    setEmail,
    setDob,
    setGender,
    saving,
    errors,
    canSave,
    save,
  } = useEditProfileForm();

  const phoneCombined = [phoneCountryCode, phoneNumber].filter(Boolean).join(' ') || '';

  const inputStyle = (err?: boolean) => ({
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: err ? colors.error : colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: fontSizes.md,
    lineHeight: lineHeights.md,
  });

  return (
    <Screen safe={false} padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: spacing.md,
            paddingBottom: spacing.xl,
            paddingHorizontal: spacing.md,
          }}
        >
          <View style={{ width: '100%', maxWidth: contentWidth?.max ?? 720, alignSelf: 'center' }}>
            <Field label="Name" error={errors.name}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                autoCorrect
                style={inputStyle(!!errors.name)}
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={inputStyle(!!errors.email)}
              />
            </Field>

            <Field label="Phone">
              <TextInput
                value={phoneCombined}
                editable={false}
                style={{
                  ...inputStyle(false),
                  backgroundColor: colors.surface,
                  color: colors.textMuted,
                }}
              />
            </Field>

            <Field label="Gender" error={errors.gender}>
              <GenderPicker
                value={(gender ?? '') as '' | 'male' | 'female'}
                onChange={(g: 'male' | 'female') => setGender(g)}
                hasError={!!errors.gender}
                style={{ marginTop: 0 }}
              />
            </Field>

            <Field label="Date of birth" error={errors.dob}>
              <DobField
                value={dob}
                onChange={setDob}
                hasError={!!errors.dob}
                style={{ marginTop: 0 }}
              />
            </Field>

            <View style={{ marginTop: spacing.md }}>
              <Button title="Save changes" onPress={save} loading={saving} disabled={!canSave} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
