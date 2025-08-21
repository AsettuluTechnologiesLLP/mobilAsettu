import { AvatarKey } from '@assets/avatars';
// import { ProfileHeader, ProfileRow } from '@components/profile';
import { ProfileHeader } from '@components/profile/ProfileHeader';
import ProfileRow from '@components/profile/ProfileRow';
import ROUTES from '@navigation/routes';
import { ProfileStackParamList } from '@navigation/stacks/ProfileStack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@screens/Auth/hooks/useAuth';
import { useProfile } from '@screens/Profile/hooks/useProfile';
import { Screen } from '@ui';
import styles from '@ui/primitives/profile';
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
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name={name}
          phone={phoneDisplay}
          onEdit={onEditProfile}
          initial={name?.[0]}
          avatarKey={profile?.avatarKey as AvatarKey | undefined}
        />

        <View style={styles.sectionSpacer} />

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
