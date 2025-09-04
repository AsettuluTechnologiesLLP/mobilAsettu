// src/navigation/AppTabsNavigator.tsx
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { colors } from '@ui/tokens';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ROUTES from './routes';
import AssetsStackNavigator from './stacks/AsettsStack';
import HomeStackNavigator from './stacks/HomeStack';
import ProfileStackNavigator from './stacks/ProfileStack';
import ServicesStackNavigator from './stacks/ServicesStack';

export type AppTabParamList = {
  [ROUTES.HOME_TAB]: undefined;
  [ROUTES.SERVICES_TAB]: undefined;
  [ROUTES.ASSETS_TAB]: undefined;
  [ROUTES.PROFILE_TAB]: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

function getIconName(routeName: keyof AppTabParamList, focused: boolean) {
  switch (routeName) {
    case ROUTES.HOME_TAB:
      return focused ? 'home' : 'home-outline';
    case ROUTES.SERVICES_TAB:
      return focused ? 'construct' : 'construct-outline';
    case ROUTES.ASSETS_TAB:
      return focused ? 'cube' : 'cube-outline';
    case ROUTES.PROFILE_TAB:
      return focused ? 'person' : 'person-outline';
    default:
      return 'ellipse';
  }
}

type TabBarIconProps = {
  routeName: keyof AppTabParamList;
  focused: boolean;
  color: string;
  size: number;
};

function TabBarIcon({ routeName, focused, color, size }: TabBarIconProps) {
  return <Ionicons name={getIconName(routeName, focused)} size={size} color={color} />;
}

const tabScreenOptions = ({ route }: { route: { name: string } }): BottomTabNavigationOptions => ({
  headerShown: false,
  tabBarShowLabel: true,
  tabBarActiveTintColor: colors.textPrimary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarIcon: (props) => <TabBarIcon routeName={route.name as keyof AppTabParamList} {...props} />,
  tabBarAllowFontScaling: false,
  tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
});

export default function AppTabsNavigator() {
  return (
    <Tab.Navigator initialRouteName={ROUTES.HOME_TAB} screenOptions={tabScreenOptions}>
      <Tab.Screen
        name={ROUTES.HOME_TAB}
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name={ROUTES.SERVICES_TAB}
        component={ServicesStackNavigator}
        options={{ title: 'Services' }}
      />
      <Tab.Screen
        name={ROUTES.ASSETS_TAB}
        component={AssetsStackNavigator}
        options={{ title: 'Assets' }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE_TAB}
        component={ProfileStackNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
