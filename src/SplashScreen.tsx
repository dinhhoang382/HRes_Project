import {Image, ImageBackground, StyleSheet, Text, View} from 'react-native';
import React, {Component, useEffect} from 'react';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({navigation}: {navigation: any}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../image/logo/icon_login.png')} // Đường dẫn đến hình ảnh logo của bạn
        style={styles.logo}
      />
      <Progress.Bar
        // size={30}
        progress={0.3}
        indeterminate={true}
        color="black"
        style={styles.loading}
        
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // Màu chữ, đảm bảo tương phản với màu nền
  },
  loading: {
    marginTop: 20,// Khoảng cách giữa text và loading indicator
  },
});
