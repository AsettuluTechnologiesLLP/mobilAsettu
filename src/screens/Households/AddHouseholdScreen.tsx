// src/screens/Households/AddHouseholdScreen.tsx
import ROUTES from '@navigation/routes';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { createHousehold, type CreateHouseholdPayload } from '@services/api/householdApi';
import { Button, Screen, Text } from '@ui';
import { colors, spacing } from '@ui/tokens';
import logger from '@utils/logger';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import CreateBasicDetailsForm from './components/CreateBasicDetailsForm';
import useHouseholdCreateRefs from './hooks/useHouseholdCreateRefs';
import { upsertHouseholdInCache } from './hooks/useHouseholdsViewAll';

const AddHouseholdScreen: React.FC = () => {
  const nav = useNavigation<any>();
  const headerHeight = useHeaderHeight();

  const { typeOptions, ownershipOptions, occupancyOptions, loading, error, refresh } =
    useHouseholdCreateRefs();

  const [formValid, setFormValid] = useState(false);
  const [formPayload, setFormPayload] = useState<CreateHouseholdPayload | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFormChange = useCallback(
    ({ isValid, payload }: { isValid: boolean; payload?: CreateHouseholdPayload }) => {
      setFormValid(isValid);
      setFormPayload(isValid && payload ? payload : null);
    },
    [],
  );

  const nameById = useCallback((id: number, arr: { id: number; name: string }[]) => {
    const m = arr.find((x) => x.id === id);
    return m?.name ?? '';
  }, []);

  const onCreate = useCallback(async () => {
    if (!formValid || !formPayload) return;

    try {
      setSubmitting(true);
      logger.info('[HHCreate] submit:start', formPayload);

      const resp = await createHousehold(formPayload);
      const newId = resp?.data?.householdId || resp?.data?.id;
      if (!resp?.success || !newId) {
        throw new Error(
          !resp?.success
            ? resp?.message || 'Failed to create household'
            : 'Missing household id in response',
        );
      }

      const ownerDisplay = 'You';
      const tile = {
        id: newId,
        name: formPayload.householdName,
        ownerName: ownerDisplay,
        address: formPayload.address.addressLine1,
        city: formPayload.address.city,
        myRole: 'Primary Owner',
        ownerDisplayName: ownerDisplay,
        addressLine: formPayload.address.addressLine1,
        isUserOwner: true,
        memberCount: 1,
        propertyOwnershipStatus: nameById(formPayload.ownershipStatusId, ownershipOptions),
        occupancyStatus: nameById(formPayload.occupancyStatusId, occupancyOptions),
        householdType: nameById(formPayload.householdTypeId, typeOptions),
        updatedAt: new Date().toISOString(),
      };

      upsertHouseholdInCache(tile as any);

      logger.info('[HHCreate] submit:success', { id: newId });

      nav.navigate(ROUTES.MANAGE_HOUSEHOLD_DETAILS, {
        householdId: newId,
        seed: {
          name: tile.name,
          address: tile.address,
          city: tile.city,
          myRole: tile.myRole,
        },
        mode: 'edit',
      });
    } catch (e: any) {
      logger.error('[HHCreate] submit:error', e?.message);
      Alert.alert('Create Household failed', e?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [formValid, formPayload, ownershipOptions, occupancyOptions, typeOptions, nameById, nav]);

  return (
    <Screen safe padded={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
            keyboardShouldPersistTaps="handled"
            contentInset={{ bottom: spacing.xl }}
            scrollIndicatorInsets={{ bottom: spacing.xl }}
          >
            <Text style={styles.title}>Create a Household</Text>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <CreateBasicDetailsForm
              typeOptions={typeOptions}
              ownershipOptions={ownershipOptions}
              occupancyOptions={occupancyOptions}
              onChange={onFormChange}
            />

            <View style={styles.footer}>
              <Button
                title={submitting ? 'Creating…' : 'Create Household'}
                onPress={onCreate}
                disabled={!formValid || submitting}
              />
            </View>

            {/* spacer so the button never sits under the keyboard */}
            <View style={{ height: spacing.xl }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { gap: 16, padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  error: { color: colors.danger, marginBottom: spacing.sm },
  footer: { marginTop: spacing.lg },
});

export default AddHouseholdScreen;
