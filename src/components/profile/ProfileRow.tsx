import styles from '@ui/primitives/profile';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type ProfileRowProps = {
  icon: string;
  label: string;
  onPress: () => void;
  rightIconName?: string;
};

const ProfileRow: React.FC<ProfileRowProps> = ({
  icon,
  label,
  onPress,
  rightIconName = 'chevron-forward',
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityRole="button">
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Ionicons name={icon} size={20} style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{label}</Text>
        </View>
        <Ionicons name={rightIconName} size={18} />
      </View>
    </TouchableOpacity>
  );
};

export default ProfileRow;
