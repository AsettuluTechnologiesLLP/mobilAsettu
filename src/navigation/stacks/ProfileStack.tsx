// src/navigation/stacks/ProfileStack.tsx
import ROUTES from '@navigation/routes';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import AboutAsettuScreen from '@screens/Profile/AboutAsettuScreen';
import EditProfileScreen from '@screens/Profile/EditProfileScreen';
import ProfileScreen from '@screens/Profile/ProfileScreen';
import { colors } from '@ui/tokens';
import React from 'react';

import ManageAssetsScreen from '@/screens/Asetts/ManageAssetsScreen';
import ManageMembersScreen from '@/screens/Households/ManageHouseholdMembersScreen';
import ManageHouseholdsScreen from '@/screens/Households/ManageHouseholdsScreen';
import ManageServiceRequestsScreen from '@/screens/Services/ManageServiceRequestsScreen';

export type ProfileStackParamList = {
  [ROUTES.PROFILE]: undefined;
  [ROUTES.EDIT_PROFILE]: undefined;
  [ROUTES.ABOUT_ASETTU]: undefined;
  [ROUTES.MANAGE_HOUSEHOLDS]: undefined;
  [ROUTES.MANAGE_MEMBERS]: undefined;
  [ROUTES.MANAGE_ASSETS]: undefined;
  [ROUTES.MANAGE_SERVICE_REQUESTS]: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

// one place for header visuals + background
const commonHeader: NativeStackNavigationOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { color: colors.textPrimary },
  headerTintColor: colors.textPrimary,
  headerShadowVisible: true,
  //headerBackTitleVisible: false, // tidy iOS back title
  contentStyle: { backgroundColor: colors.background }, // avoid white flashes
};

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={commonHeader}>
      {/* Root in the tab: no header */}
      <Stack.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{ headerShown: false }}
      />

      {/* Children inherit the common header; only set titles */}
      <Stack.Screen
        name={ROUTES.EDIT_PROFILE}
        component={EditProfileScreen}
        options={{ title: 'Edit profile' }}
      />
      <Stack.Screen
        name={ROUTES.ABOUT_ASETTU}
        component={AboutAsettuScreen}
        options={{ title: 'About Asettu' }}
      />
      <Stack.Screen
        name={ROUTES.MANAGE_HOUSEHOLDS}
        component={ManageHouseholdsScreen}
        options={{ title: 'My Households' }}
      />
      <Stack.Screen
        name={ROUTES.MANAGE_MEMBERS}
        component={ManageMembersScreen}
        options={{ title: 'My Members' }}
      />
      <Stack.Screen
        name={ROUTES.MANAGE_ASSETS}
        component={ManageAssetsScreen}
        options={{ title: 'My Assets' }}
      />
      <Stack.Screen
        name={ROUTES.MANAGE_SERVICE_REQUESTS}
        component={ManageServiceRequestsScreen}
        options={{ title: 'My Service Requests' }}
      />
    </Stack.Navigator>
  );
}
