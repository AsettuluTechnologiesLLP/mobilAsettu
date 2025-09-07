// src/navigation/stacks/ProfileStack.tsx
import ROUTES from '@navigation/routes';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import ManageAssetsScreen from '@screens/Asetts/ManageAssetsScreen';
import AddHouseholdScreen from '@screens/Households/AddHouseholdScreen';
import HouseholdDetailsScreen from '@screens/Households/HouseholdDetailsScreen';
import ManageHouseholdsScreen from '@screens/Households/ManageHouseholdsScreen';
import AboutAsettuScreen from '@screens/Profile/AboutAsettuScreen';
import EditProfileScreen from '@screens/Profile/EditProfileScreen';
import ProfileScreen from '@screens/Profile/ProfileScreen';
import ManageServiceRequestsScreen from '@screens/Services/ManageServiceRequestsScreen';
import { colors } from '@ui/tokens';
import React from 'react';

export type ProfileStackParamList = {
  [ROUTES.PROFILE]: undefined;
  [ROUTES.EDIT_PROFILE]: undefined;
  [ROUTES.ABOUT_ASETTU]: undefined;

  [ROUTES.MANAGE_HOUSEHOLDS]: { removedId?: string; refreshAt?: number } | undefined;
  [ROUTES.MANAGE_MEMBERS]: undefined;
  [ROUTES.MANAGE_ASSETS]: undefined;
  [ROUTES.MANAGE_SERVICE_REQUESTS]: undefined;

  [ROUTES.MANAGE_HOUSEHOLD_DETAILS]: {
    householdId: string;
    seed?: { name?: string; address?: string; city?: string; myRole?: string };
    mode?: 'view' | 'edit';
  };

  [ROUTES.ADD_HOUSEHOLD]: undefined; // ← add this
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

// one place for header visuals + background
const commonHeader: NativeStackNavigationOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { color: colors.textPrimary },
  headerTintColor: colors.textPrimary,
  headerShadowVisible: true,
  contentStyle: { backgroundColor: colors.background },
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
        name={ROUTES.MANAGE_HOUSEHOLD_DETAILS}
        component={HouseholdDetailsScreen}
        options={{ title: 'Household Details' }}
      />
      <Stack.Screen
        name={ROUTES.ADD_HOUSEHOLD}
        component={AddHouseholdScreen}
        options={{ title: 'Add Household' }}
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
