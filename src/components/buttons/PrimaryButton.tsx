import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

// If you prefer theme colors, import and swap below:
// import { COLORS } from '@styles/theme';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
}) => {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[styles.button, isDisabled && styles.disabledButton]}
      activeOpacity={0.7}
    >
      {/* Keep text always visible */}
      <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]} numberOfLines={1}>
        {title}
      </Text>

      {/* Spinner on the right so label stays centered */}
      {loading && <ActivityIndicator style={styles.spinner} color="#fff" />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4A90E2', // or COLORS.buttonBackground
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    height: 45,
    maxWidth: 300,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16, // room for spinner
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff', // or COLORS.textOnButton
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    opacity: 0.9,
  },
  spinner: {
    position: 'absolute',
    right: 12,
  },
});

export default PrimaryButton;
