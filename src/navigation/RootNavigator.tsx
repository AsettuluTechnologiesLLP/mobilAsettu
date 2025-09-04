// src/navigation/RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useRef } from 'react';

import { useAuth } from '../screens/Auth/hooks/useAuth';
import SplashScreen from '../screens/SplashScreen';
import logger from '../utils/logger';
import AppTabsNavigator from './AppTabsNavigator';
import AuthNavigator from './AuthNavigator';
import ROUTES from './routes';

export type RootStackParamList = {
  [ROUTES.SPLASH]: undefined;
  [ROUTES.AUTH_ROOT]: undefined;
  [ROUTES.APP_ROOT]: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { status } = useAuth();

  const branch = useMemo<'Splash' | 'Auth' | 'App'>(() => {
    if (status === 'checking') return 'Splash';
    if (status === 'unauthenticated') return 'Auth';
    return 'App';
  }, [status]);

  const prev = useRef(branch);

  useEffect(() => {
    if (prev.current !== branch)
      logger.debug('[RootNav] Branch', { from: prev.current, to: branch });
    prev.current = branch;
  }, [branch]);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {branch === 'Splash' && <RootStack.Screen name={ROUTES.SPLASH} component={SplashScreen} />}
      {branch === 'Auth' && <RootStack.Screen name={ROUTES.AUTH_ROOT} component={AuthNavigator} />}
      {branch === 'App' && <RootStack.Screen name={ROUTES.APP_ROOT} component={AppTabsNavigator} />}
    </RootStack.Navigator>
  );
}
