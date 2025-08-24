import { AvatarKey } from '@assets/avatars';
import { ProfileHeader } from '@components/profile/ProfileHeader';
import ProfileRow from '@components/profile/ProfileRow';
import ROUTES from '@navigation/routes';
import { ProfileStackParamList } from '@navigation/stacks/ProfileStack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@screens/Auth/hooks/useAuth';
import { useProfile } from '@screens/Profile/hooks/useProfile';
import { Screen } from '@ui';
import { spacing } from '@ui/tokens';
import logger from '@utils/logger';
import React, { useEffect } from 'react';
import { Alert, ScrollView, View } from 'react-native';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { logout } = useAuth();
  const { profile, refreshIfStale } = useProfile();

  const name = profile?.name || 'User';
  const phoneDisplay =
    profile?.phoneCountryCode && profile?.phoneNumber
      ? `${profile.phoneCountryCode} ${profile.phoneNumber}`
      : '—';

  useEffect(() => {
    logger.debug('ProfileScreen >>>> Mounted');
    return () => logger.debug('ProfileScreen <<<< Unmounted');
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refreshIfStale();
    }, [refreshIfStale]),
  );

  const open = (route: keyof ProfileStackParamList) => () => navigation.navigate(route);
  const onEditProfile = () => navigation.navigate(ROUTES.EDIT_PROFILE);

  const onLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => logout() },
    ]);
  };

  return (
    // Match Home/Asets pattern: no default padding, only top safe area
    <Screen padded={false} edges={['top']}>
      <ScrollView
        contentInsetAdjustmentBehavior="never" // avoid double top inset
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.lg,
          flexGrow: 1,
        }}
      >
        <ProfileHeader
          name={name}
          phone={phoneDisplay}
          onEdit={onEditProfile}
          initial={(name?.[0] as string) || 'U'}
          avatarKey={profile?.avatarKey as AvatarKey | undefined}
        />

        {/* Section spacer (tokens only) */}
        <View style={{ height: spacing.md }} />

        <ProfileRow
          icon="home-outline"
          label="Manage Households"
          onPress={open(ROUTES.MANAGE_HOUSEHOLDS)}
        />
        <ProfileRow
          icon="people-outline"
          label="Manage Members"
          onPress={open(ROUTES.MANAGE_MEMBERS)}
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
