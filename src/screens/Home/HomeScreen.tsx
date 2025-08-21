import { Screen } from '@ui';
import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import logger from '../../utils/logger';

export default function HomeScreen() {
  useEffect(() => {
    logger.debug('HomeScreen >>>> Mounted');
    return () => logger.debug('HomeScreen <<<< Unmounted');
  }, []);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        contentInsetAdjustmentBehavior="automatic" // iOS: adjusts for status bar/nav bars
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 12 }}>Home</Text>
          <Text style={{ fontSize: 16, lineHeight: 22 }}>
            A clean placeholder screen. Build your home screen components here later.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
