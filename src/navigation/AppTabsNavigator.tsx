// src/navigation/AppTabsNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ROUTES from './routes'; // adjust path if routes is elsewhere
import AssetsStackNavigator from './stacks/AssetsStack';
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

// ---- Hoisted helpers (no nested components in render) ----
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
  const name = getIconName(routeName, focused);
  return <Ionicons name={name} size={size} color={color} />;
}

// ---- Component ----
export default function AppAppTabsNavigator() {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.HOME_TAB}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: (props) => (
          <TabBarIcon routeName={route.name as keyof AppTabParamList} {...props} />
        ),
      })}
    >
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
