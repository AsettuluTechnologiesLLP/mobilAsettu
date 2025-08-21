// src/components/profile/DobField.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import forms from '@ui/primitives/forms';
import { formatDobDisplay } from '@utils/date';
import React, { useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
};

export default function DobField({ label = 'Date of birth', value, onChange, error }: Props) {
  const [show, setShow] = useState(false);

  return (
    <View style={forms.fieldGroup}>
      <Text style={forms.label}>{label}</Text>

      <TouchableOpacity onPress={() => setShow(true)} activeOpacity={0.7} style={forms.touchInput}>
        <Text style={forms.touchInputText}>{value ? formatDobDisplay(value) : 'Select date'}</Text>
      </TouchableOpacity>
      {error ? <Text style={forms.error}>{error}</Text> : null}

      {/* iOS inline */}
      {Platform.OS === 'ios' && show && (
        <DateTimePicker
          mode="date"
          display="inline"
          value={value ?? new Date(1990, 0, 1)}
          maximumDate={new Date()}
          onChange={(e, selected) => {
            if (selected) onChange(selected);
          }}
        />
      )}

      {/* Android bottom sheet */}
      {Platform.OS === 'android' && show && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShow(false)}>
          <TouchableOpacity
            style={forms.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShow(false)}
          >
            <View style={forms.modalSheet}>
              <Text style={forms.modalTitle}>Select date</Text>
              <DateTimePicker
                mode="date"
                display="calendar"
                value={value ?? new Date(1990, 0, 1)}
                maximumDate={new Date()}
                onChange={(e: any, selected?: Date) => {
                  if ((e?.type ?? 'set') === 'set' && selected) onChange(selected);
                  setShow(false);
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
