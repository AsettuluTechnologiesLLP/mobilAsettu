// src/components/profile/ProfileHeader.tsx
import { AvatarKey, getAvatarSource } from '@assets/avatars';
import styles from '@ui/primitives/profile';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  name: string;
  phone: string;
  initial?: string;
  avatarKey?: AvatarKey | null;
  onEdit: () => void;
};

export function ProfileHeader({ name, phone, initial, avatarKey, onEdit }: Props) {
  const src = getAvatarSource(avatarKey ?? undefined);
  const fallbackInitial = (initial || name?.[0] || 'U').toUpperCase();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {/* Avatar: display only (no popup) */}
        {src ? (
          <Image source={src} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{fallbackInitial}</Text>
          </View>
        )}

        {/* Name row is tappable → Edit Profile */}
        <TouchableOpacity onPress={onEdit} activeOpacity={0.8}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.name}>{name}</Text>
            <Ionicons name="pencil-outline" size={16} color="#6b7280" style={{ marginLeft: 6 }} />
          </View>
          <Text style={styles.phone}>{phone}</Text>
        </TouchableOpacity>
      </View>
      {/* Top-right edit icon removed */}
    </View>
  );
}
