// src/navigation/stacks/HomeStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AssetsScreen from '@/screens/Asetts/AssetsScreen';

import ROUTES from '../routes';

export type HomeStackParamList = { [ROUTES.ASSETS]: undefined };
const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.ASSETS} component={AssetsScreen} />
    </Stack.Navigator>
  );
}
