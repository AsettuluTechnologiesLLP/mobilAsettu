import { Screen } from '@ui';
import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function ManageServiceRequestsScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Service requests</Text>
        <Text style={{ opacity: 0.7 }}>Build service request list here…</Text>
      </ScrollView>
    </Screen>
  );
}
