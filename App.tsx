import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Login from './src/Login';
import Home from './src/Home';
import TableDetail from './src/TableDetail';
import OrderScreen from './src/OrderScreen';
import PaymentScreen from './src/PaymentScreen';
import DrawerNavigation from './navigation/DrawerNavigation';
import PreviousOrderScreen from './src/PreviousOrderScreen';
import UserProfileScreen from './src/userProfileScreen';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ForgotPasswordScreen from './src/ForgotPasswordScreen';
import ChangePasswordScreen from './src/ChangePasswordScreen';
import AddEmployee from './src/Employee/AddEmployee';
import EditEmployee from './src/Employee/EditEmployee';
import AddFood from './src/FoodManager/AddFood';
import EditFood from './src/FoodManager/EditFood';
import CategoryManagement from './src/FoodManager/CategoryManage';
import SplashScreen from './src/SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EventListScreen from './src/EventList/EventListScreen';
import AddEventScreen from './src/EventList/AddEventScreen';
import EventDetails from './src/EventList/EventDetailScreen';
import PaymentHistoryDetail from './src/PaymentHistoryDetail';
import ManageTableScreen from './src/ManageTableScreen';
import AllTables from './src/AllTableScreen';
const Stack = createNativeStackNavigator();
const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        {/*Thanh trang thai*/}
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="DrawerNavigation" component={DrawerNavigation} />
          <Stack.Screen name="TableDetail" component={TableDetail} />
          <Stack.Screen name="OrderScreen" component={OrderScreen} />
          <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
          <Stack.Screen
            name="PreviousOrderScreen"
            component={PreviousOrderScreen}
          />
          <Stack.Screen
            name="UserProfileScreen"
            component={UserProfileScreen}
          />
          <Stack.Screen
            name="ForgotPasswordScreen"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen
            name="ChangePasswordScreen"
            component={ChangePasswordScreen}
          />
          <Stack.Screen name="AddEmployee" component={AddEmployee} />
          <Stack.Screen name="EditEmployee" component={EditEmployee} />
          <Stack.Screen name="AddFood" component={AddFood} />
          <Stack.Screen name="EditFood" component={EditFood} />
          <Stack.Screen name="CategoryManage" component={CategoryManagement} />
          <Stack.Screen name="EventListScreen" component={EventListScreen} />
          <Stack.Screen name="AddEventScreen" component={AddEventScreen} />
          <Stack.Screen name="EventDetailScreen" component={EventDetails} />
          <Stack.Screen
            name="PaymentHistoryDetail"
            component={PaymentHistoryDetail}
          />
          <Stack.Screen
            name="ManageTableScreen"
            component={ManageTableScreen}
          />
          <Stack.Screen name="AllTableScreen" component={AllTables} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
