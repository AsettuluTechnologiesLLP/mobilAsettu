import forms from '@ui/primitives/forms'; // keep your existing input styles
import React, { useState } from 'react';
import { Modal, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

type Props = {
  value: '' | 'male' | 'female'; // '' shows "Select"
  onChange: (val: 'male' | 'female') => void;
  style?: StyleProp<ViewStyle>; // parent controls spacing
  hasError?: boolean; // draw red border if true
};

export default function GenderPicker({ value, onChange, style, hasError = false }: Props) {
  const [open, setOpen] = useState(false);
  const display = value ? value[0].toUpperCase() + value.slice(1) : 'Select';

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        style={[
          forms.touchInput,
          hasError && { borderColor: '#EF4444' }, // colors.error
        ]}
      >
        <Text style={forms.touchInputText}>{display}</Text>
      </TouchableOpacity>

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
