// src/screens/Profile/ProfileScreen.tsx
import ProfileRow from '@components/profile/ProfileRow';
import ROUTES from '@navigation/routes';
import { ProfileStackParamList } from '@navigation/stacks/ProfileStack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@screens/Auth/hooks/useAuth';
import { useProfile } from '@screens/Profile/hooks/useProfile';
import { Screen, Text } from '@ui';
import { colors, fontSizes, spacing } from '@ui/tokens';
import logger from '@utils/logger';
import React, { useEffect } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { logout } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    logger.debug('ProfileScreen >>>> Mounted');
    return () => logger.debug('ProfileScreen <<<< Unmounted');
  }, []);

  const name = (profile?.name || 'User').trim();
  const phoneDisplay =
    profile?.phoneCountryCode && profile?.phoneNumber
      ? `${profile.phoneCountryCode} ${profile.phoneNumber}`
      : '—';

  // helper to navigate to routes with no params
  type RoutesWithoutParams = {
    [K in keyof ProfileStackParamList]: undefined extends ProfileStackParamList[K] ? K : never;
  }[keyof ProfileStackParamList];
  const open = (route: RoutesWithoutParams) => () => navigation.navigate(route);

  const onEditProfile = () => navigation.navigate(ROUTES.EDIT_PROFILE);

  const onLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => logout() },
    ]);
  };

  return (
    <Screen padded={false} edges={['top']}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.lg,
          paddingTop: spacing.md,
          flexGrow: 1,
        }}
      >
        {/* Simple header: name + edit icon, phone below */}
        <View style={{ marginTop: spacing.md, marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              weight="bold"
              style={{ fontSize: fontSizes.lg, color: colors.text, marginRight: spacing.xs }}
              numberOfLines={1}
            >
              {name}
            </Text>

            <TouchableOpacity
              onPress={onEditProfile}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text
            color={colors.textMuted}
            style={{ fontSize: fontSizes.sm, marginTop: 4 }}
            numberOfLines={1}
          >
            {phoneDisplay}
          </Text>
        </View>

        {/* Actions / navigation rows */}
        <ProfileRow
          icon="home-outline"
          label="Manage Households"
          onPress={open(ROUTES.MANAGE_HOUSEHOLDS)}
        />
        <ProfileRow
          icon="briefcase-outline"
          label="Manage Assets"
          onPress={open(ROUTES.MANAGE_ASSETS)}
        />
        <ProfileRow
          icon="construct-outline"
          label="Manage Service Requests"
          onPress={open(ROUTES.MANAGE_SERVICE_REQUESTS)}
        />
        <ProfileRow
          icon="information-circle-outline"
          label="About Asettu"
          onPress={open(ROUTES.ABOUT_ASETTU)}
        />
        <ProfileRow icon="log-out-outline" label="Logout" onPress={onLogout} />
      </ScrollView>
    </Screen>
  );
}
