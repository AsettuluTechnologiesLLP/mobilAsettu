// src/navigation/auth/AuthNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import LoginScreen from '../screens/Auth/LoginScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import ROUTES from './routes';

export type AuthStackParamList = {
  [ROUTES.LOGIN]: undefined;
  [ROUTES.OTP]: { phoneNumber: string; countryCode: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen
        name={ROUTES.OTP}
        component={OTPVerificationScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
