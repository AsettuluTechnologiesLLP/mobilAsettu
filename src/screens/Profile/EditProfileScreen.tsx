// src/screens/Profile/EditProfileScreen.tsx
import PrimaryButton from '@components/buttons/PrimaryButton';
import AvatarChooserSheet from '@components/profile/AvatarChooserSheet';
import DobField from '@components/profile/DobField';
import GenderPicker from '@components/profile/GenderPicker';
import PhoneRow from '@components/profile/PhoneRow';
import { useEditProfileForm } from '@screens/Profile/hooks/useEditProfileForm';
import { Screen } from '@ui';
import forms from '@ui/primitives/forms';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';

export default function EditProfileScreen() {
  const {
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
    preferredLang,
    saving,
    errors,
    save,
  } = useEditProfileForm();

  const initial = (name || 'User').trim().charAt(0).toUpperCase();

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={forms.container}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <AvatarChooserSheet value={avatarKey} onChange={setAvatarKey} nameInitial={initial} />

          {/* Name */}
          <View style={forms.fieldGroup}>
            <Text style={forms.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={forms.input}
              placeholder="Your full name"
              autoCapitalize="words"
              autoCorrect
              returnKeyType="done"
            />
            {errors.name ? <Text style={forms.error}>{errors.name}</Text> : null}
          </View>

          {/* Phone */}
          <PhoneRow
            countryCode={phoneCountryCode}
            phone={phoneNumber}
            setPhone={setPhoneNumber}
            error={errors.phone}
          />

          {/* DOB */}
          <DobField value={dob} onChange={setDob} error={errors.dob} />

          {/* Gender */}
          <GenderPicker value={gender} onChange={setGender} error={errors.gender} />

          {/* Read-only language */}
          <View style={forms.fieldGroup}>
            <Text style={forms.label}>Preferred language</Text>
            <TextInput
              editable={false}
              style={[forms.input, forms.inputDisabled]}
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
            />
          </View>

          {/* Actions */}
          <View style={forms.actionsRow}>
            <PrimaryButton title="Save changes" onPress={save} loading={saving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
