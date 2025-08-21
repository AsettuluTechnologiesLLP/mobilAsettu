import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ServicesScreen from '../../screens/Services/ServicesScreen';
import ROUTES from '../routes';

export type HomeStackParamList = { [ROUTES.SERVICES]: undefined };
const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.SERVICES} component={ServicesScreen} />
    </Stack.Navigator>
  );
}
