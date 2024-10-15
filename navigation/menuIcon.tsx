import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {DrawerNavigationProp} from '@react-navigation/drawer';
type MenuIconProps = {
  navigation: DrawerNavigationProp<any, any>;
  color?: string;
};

const MenuIcon = ({navigation, color}: MenuIconProps) => {
  const openDrawer = () => {
    navigation.openDrawer();
  };
  return (
    <TouchableOpacity onPress={openDrawer} style={styles.menuIcon}>
      <Icon name="menu" size={30} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuIcon: {
    marginLeft: 10,
  },
});

export default MenuIcon;
