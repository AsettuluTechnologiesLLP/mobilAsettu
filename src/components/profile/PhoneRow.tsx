// src/components/profile/PhoneRow.tsx
import forms from '@ui/primitives/forms';
import React from 'react';
import { Text, TextInput, View } from 'react-native';

type Props = {
  countryCode: string; // read-only
  phone: string;
  setPhone: (val: string) => void;
  error?: string;
};

export default function PhoneRow({ countryCode, phone, setPhone, error }: Props) {
  return (
    <View style={[forms.fieldGroup, forms.row]}>
      <View style={[forms.rowItemFixed, forms.rowSpacerRight]}>
        <Text style={forms.label}>Country code</Text>
        <TextInput
          value={countryCode}
          editable={false}
          style={[forms.input, forms.inputDisabled, { textAlign: 'center' }]}
        />
      </View>
      <View style={forms.rowItem}>
        <Text style={forms.label}>Phone number</Text>
        <TextInput
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/\D+/g, ''))}
          style={[forms.input, forms.inputDisabled]}
          placeholder="10-digit number"
          keyboardType="number-pad"
          maxLength={10}
          editable={false}
        />
        {error ? <Text style={forms.error}>{error}</Text> : null}
      </View>
    </View>
  );
}
