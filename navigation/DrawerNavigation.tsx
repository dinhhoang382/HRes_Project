// navigation/DrawerNavigation.tsx
import React from 'react';
import {
  createDrawerNavigator,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import Home from '../src/Home';
import TableDetail from '../src/TableDetail';
import {NavigationContainer} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const Drawer = createDrawerNavigator();

const DrawerNavigation = ({route}: {route: any}) => {
  const {UserData, userId} = route.params || {};
  console.log('UserData:Drawer ', UserData, userId);

  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{headerShown: false, title: 'Trang chủ'}}
        initialParams={{UserData, userId}}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
