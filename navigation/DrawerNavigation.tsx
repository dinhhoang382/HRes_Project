// navigation/DrawerNavigation.tsx
import React from 'react';
import {
  createDrawerNavigator,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import Home from '../src/Home';
import UserProfileScreen from '../src/userProfileScreen';
import PaymentHistoryScreen from '../src/PaymentHistoryScreen';
import ManageEmployeeScreen from '../src/ManageEmployeeScreen';
import ManageFoodScreen from '../src/ManageFoodScreen';
import PaymentHistoryRevenue from '../src/PaymentHistoryRevenue';
import Setting from '../src/Setting';
import {DrawerContent} from '../reanimate/DrawerContent';

const Drawer = createDrawerNavigator();

const DrawerNavigation = ({route}: {route: any}) => {
  const {UserData, userId} = route.params || {};
  // console.log('UserData:Drawer ', UserData, userId);

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <DrawerContent {...props} UserData={UserData} />}>
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{headerShown: false, title: 'Trang chủ'}}
        initialParams={{UserData, userId}}
      />
      <Drawer.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={{headerShown: false, title: 'Tài khoản'}}
        initialParams={{UserData, userId}}
      />
      <Drawer.Screen
        name="PaymentHistoryScreen"
        component={PaymentHistoryScreen}
        options={{headerShown: false, title: 'Quản lý Thanh toán'}}
      />
      <Drawer.Screen
        name="ManageEmployeeScreen"
        component={ManageEmployeeScreen}
        options={{headerShown: false, title: 'Quản lý nhân viên'}}
      />
      <Drawer.Screen
        name="ManageFoodScreen"
        component={ManageFoodScreen}
        options={{headerShown: false, title: 'Quản lý thực đơn'}}
      />
      <Drawer.Screen
        name="PaymentHistoryRevenue"
        component={PaymentHistoryRevenue}
        options={{headerShown: false, title: 'Quản lý doanh thu'}}
      />
      <Drawer.Screen
        name="Setting"
        component={Setting}
        options={{headerShown: false, title: 'Cài đặt'}}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
