// src/components/profile/GenderPicker.tsx
import forms from '@ui/primitives/forms';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  label?: string;
  value: string;
  onChange: (val: 'male' | 'female') => void;
  error?: string;
};

export default function GenderPicker({ label = 'Gender', value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);

  const display = value ? value[0].toUpperCase() + value.slice(1) : 'Select';

  return (
    <View style={forms.fieldGroup}>
      <Text style={forms.label}>{label}</Text>

      <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.7} style={forms.touchInput}>
        <Text style={forms.touchInputText}>{display}</Text>
      </TouchableOpacity>
      {error ? <Text style={forms.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={forms.modalBackdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={forms.modalSheet}>
            <Text style={forms.modalTitle}>Select gender</Text>

            <TouchableOpacity
              style={forms.modalItem}
              onPress={() => {
                onChange('male');
                setOpen(false);
              }}
            >
              <Text style={forms.modalItemText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={forms.modalItem}
              onPress={() => {
                onChange('female');
                setOpen(false);
              }}
            >
              <Text style={forms.modalItemText}>Female</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[forms.modalItem, { marginTop: 8 }]}
              onPress={() => setOpen(false)}
            >
              <Text style={[forms.modalItemText, { color: '#6B7280' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
