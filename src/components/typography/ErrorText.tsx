import React from 'react';
import { StyleSheet,Text } from 'react-native';

type ErrorTextProps = {
  message?: string; // ✅ Make message optional
};

const ErrorText = ({ message }: ErrorTextProps) => {
  // Return null if no message is passed
  if (!message) return null;

  return <Text style={styles.error}>{message}</Text>;
};

const styles = StyleSheet.create({
  error: {
    color: 'red',
    fontSize: 15,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 300,
    alignSelf: 'center',
  },
});

export default ErrorText;
