import ROUTES from '@navigation/routes';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AboutAsettuScreen from '@screens/Profile/AboutAsettuScreen';
import EditProfileScreen from '@screens/Profile/EditProfileScreen';
import ManageAssetsScreen from '@screens/Profile/ManageAssetsScreen';
import ManageHouseholdsScreen from '@screens/Profile/ManageHouseholdsScreen';
import ManageMembersScreen from '@screens/Profile/ManageMembersScreen';
import ManageServiceRequestsScreen from '@screens/Profile/ManageServiceRequestsScreen';
import ProfileScreen from '@screens/Profile/ProfileScreen';
import React from 'react';

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

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      {/* Root (no header; tab bar stays visible) */}
      <Stack.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{ headerShown: false }}
      />

      {/* Children (show header so user can go back) */}
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
        options={{ title: 'Manage households' }}
      />
      <Stack.Screen
        name={ROUTES.MANAGE_MEMBERS}
        component={ManageMembersScreen}
        options={{ title: 'Manage members' }}
      />
      <Stack.Screen
        name={ROUTES.MANAGE_ASSETS}
        component={ManageAssetsScreen}
        options={{ title: 'Manage assets' }}
      />
      <Stack.Screen
        name={ROUTES.MANAGE_SERVICE_REQUESTS}
        component={ManageServiceRequestsScreen}
        options={{ title: 'Service requests' }}
      />
    </Stack.Navigator>
  );
}
