import { AvatarKey, AVATARS } from '@assets/avatars';
import avatar from '@ui/primitives/avatar';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  value?: AvatarKey | null;
  onChange: (key: AvatarKey) => void;
  label?: string;
};

export default function AvatarPicker({ value, onChange, label = 'Choose avatar' }: Props) {
  const keys = Object.keys(AVATARS) as AvatarKey[];

  return (
    <View style={avatar.grid}>
      <Text style={avatar.sectionLabel}>{label}</Text>
      <View style={avatar.row}>
        {keys.map((key) => {
          const src = AVATARS[key];
          const selected = value === key;
          return (
            <View key={key} style={avatar.itemWrap}>
              <TouchableOpacity
                onPress={() => onChange(key)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[avatar.item, selected && avatar.itemSelected]}
              >
                <Image source={src} style={avatar.img} resizeMode="cover" />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}
