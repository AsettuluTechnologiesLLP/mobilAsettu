// src/navigation/stacks/HomeStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import HomeScreen from '../../screens/Home/HomeScreen';
import ROUTES from '../routes';

export type HomeStackParamList = { [ROUTES.HOME]: undefined };
const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
    </Stack.Navigator>
  );
}
