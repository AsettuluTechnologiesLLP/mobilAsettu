import { Screen } from '@ui';
import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function ManageAssetsScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Manage assets</Text>
        <Text style={{ opacity: 0.7 }}>Build assets management UI here…</Text>
      </ScrollView>
    </Screen>
  );
}
