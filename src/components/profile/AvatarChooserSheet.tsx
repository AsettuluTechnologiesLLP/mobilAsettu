// src/components/profile/AvatarChooserSheet.tsx
import { AvatarKey, AVATARS, getAvatarSource } from '@assets/avatars';
import avatarStyles from '@ui/primitives/avatar';
import forms from '@ui/primitives/forms';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  value: AvatarKey | null;
  onChange: (key: AvatarKey | null) => void;
  nameInitial: string; // fallback initial if value is null
};

export default function AvatarChooserSheet({ value, onChange, nameInitial }: Props) {
  const [open, setOpen] = useState(false);
  const src = getAvatarSource(value ?? undefined);

  return (
    <View style={{ alignItems: 'center', marginBottom: 16 }}>
      <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.8}>
        {src ? (
          <Image
            source={src}
            style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: '#F3F4F6' }}
          />
        ) : (
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#111827' }}>{nameInitial}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={forms.modalBackdrop}
          onPress={() => setOpen(false)}
        >
          <View style={forms.modalSheet}>
            <Text style={forms.modalTitle}>Choose avatar</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={avatarStyles.bar}
            >
              {/* Empty option (initial) */}
              <TouchableOpacity
                onPress={() => {
                  onChange(null);
                  setOpen(false);
                }}
                activeOpacity={0.8}
                style={avatarStyles.barItemWrap}
              >
                <View style={[avatarStyles.barItem, avatarStyles.barEmpty]}>
                  <Text style={{ fontSize: 18, color: '#6B7280' }}>{nameInitial}</Text>
                </View>
              </TouchableOpacity>

              {/* Avatars list */}
              {(Object.keys(AVATARS) as AvatarKey[]).map((k) => (
                <TouchableOpacity
                  key={k}
                  onPress={() => {
                    onChange(k);
                    setOpen(false);
                  }}
                  activeOpacity={0.8}
                  style={avatarStyles.barItemWrap}
                >
                  <Image source={AVATARS[k]} style={avatarStyles.barImg} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
