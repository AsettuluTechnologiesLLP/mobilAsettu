import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './navigation/RootNavigator';
import { AuthProvider } from './screens/Auth/hooks/useAuth';
import { ProfileProvider } from './screens/Profile/hooks/useProfile';
import logger from './utils/logger';

LogBox.ignoreAllLogs();

export default function App() {
  useEffect(() => {
    logger.debug('[App] Mounted >>>>>> App.tsx');
    return () => logger.debug('[App] Unmounted <<<<<< App.tsx');
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
