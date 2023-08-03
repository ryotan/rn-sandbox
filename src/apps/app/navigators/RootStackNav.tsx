import type {StackNavigationOptions} from '@react-navigation/stack';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {Home} from '@/screens/Home';

const homeScreenOptions: StackNavigationOptions = {
  headerShown: false,
};

const nav = createStackNavigator();
export const RootStackNav: React.FC = () => {
  return (
    <nav.Navigator initialRouteName={Home.name}>
      <nav.Screen name="Home" component={Home} options={homeScreenOptions} />
    </nav.Navigator>
  );
};
