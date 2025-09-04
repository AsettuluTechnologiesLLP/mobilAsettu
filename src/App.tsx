import RootNavigator from '@navigation/RootNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from '@screens/Auth/hooks/useAuth';
import { ProfileProvider } from '@screens/Profile/hooks/useProfile';
import { FlashProvider } from '@ui/primitives/FlashMessage'; // ⬅️ add this
import logger from '@utils/logger';
import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

Ionicons.loadFont();
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
          <FlashProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </FlashProvider>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
