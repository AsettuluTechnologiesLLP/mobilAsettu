// src/screens/Households/HouseholdDetails.parts.tsx
import { Button, Text } from '@ui';
import { colors, spacing } from '@ui/tokens';
import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import {
  floatBar,
  member,
  metaPill,
  pickerModal,
  pickerRow,
  pillStyles,
  sticky,
} from './HouseholdDetails.styles';

export function DisplayPill({ label }: { label: string }) {
  return (
    <View style={pillStyles.wrap}>
      <Text style={pillStyles.txt} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function RolePill({ role }: { role: string }) {
  return (
    <View style={pillStyles.wrap}>
      <Text style={pillStyles.txt} numberOfLines={1}>
        {role}
      </Text>
    </View>
  );
}

export function MetaPill({ label }: { label: string }) {
  return (
    <View style={metaPill.wrap}>
      <Text style={metaPill.txt} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function MemberRow({ name, role }: { name: string; role: string }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <View style={member.row}>
      <View style={member.avatar}>
        <Text style={member.avatarTxt}>{initial}</Text>
      </View>
      <View style={{ flex: 1, marginRight: spacing.sm }}>
        <Text style={member.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <RolePill role={role} />
    </View>
  );
}

export function PickerRow({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: string | null;
  placeholder?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={pickerRow.wrap}>
      <Text style={pickerRow.label}>{label}</Text>
      <Text
        style={[pickerRow.value, !value ? { color: colors.textMuted } : null]}
        numberOfLines={1}
      >
        {value || placeholder || 'Select'}
      </Text>
    </Pressable>
  );
}

/** Lightweight picker modal (dependency-free) */
export function SimplePickerModal({
  open,
  title,
  options,
  value,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  options: string[];
  value: string | null;
  onSelect: (val: string | null) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pickerModal.backdrop} onPress={onClose}>
        <Pressable style={pickerModal.sheet}>
          <Text style={pickerModal.title}>{title}</Text>
          <ScrollView
            bounces={false}
            overScrollMode="never"
            style={{ maxHeight: 360, marginTop: spacing.sm }}
            contentContainerStyle={pickerModal.scrollContent}
          >
            {options.map((opt) => {
              const selected = value === opt;
              return (
                <Pressable
                  key={opt}
                  style={[pickerModal.option, selected ? pickerModal.optionSelected : null]}
                  onPress={() => onSelect(opt)}
                >
                  <Text
                    style={[pickerModal.optionTxt, selected ? { fontWeight: '700' } : null]}
                    numberOfLines={1}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
            {/* clear */}
            <Pressable
              style={[pickerModal.option, { marginTop: spacing.xs }]}
              onPress={() => onSelect(null)}
            >
              <Text style={[pickerModal.optionTxt, { color: colors.textMuted }]} numberOfLines={1}>
                Clear selection
              </Text>
            </Pressable>
          </ScrollView>
          <View style={{ marginTop: spacing.sm }}>
            <Button title="Close" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function FloatingBar({
  children,
  side = 'right',
}: {
  children: React.ReactNode;
  side?: 'left' | 'right';
}) {
  return (
    <View
      style={[
        floatBar.wrap,
        side === 'right' ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' },
      ]}
    >
      {children}
    </View>
  );
}

export function StickyBar({ children }: { children: React.ReactNode }) {
  return <View style={sticky.wrap}>{children}</View>;
}
