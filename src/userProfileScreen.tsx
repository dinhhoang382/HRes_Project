import {StyleSheet, Text, View, Button, Alert, Image} from 'react-native';
import React, {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import BackButton from '../navigation/backButton';

const UserProfileScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const {userId} = route.params || {};
  const [userData, setUserData] = useState<any>(null);

  // Lấy dữ liệu từ Firestore
  useEffect(() => {
    if (userId) {
      const userRef = firestore().collection('users').doc(userId);
      const unsubscribe = userRef.onSnapshot(doc => {
        if (doc.exists) {
          setUserData(doc.data());
        } else {
          console.log('No such document!');
        }
      });
      return () => unsubscribe();
    }
  }, [userId]);

  // Đăng xuất
  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        Alert.alert('Đăng xuất thành công');
        navigation.replace('Login'); // Điều hướng về trang đăng nhập
      })
      .catch(error => {
        console.error('Error logging out: ', error);
      });
  };
  //
  const showLogoutConfirmation = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy', // Nút hủy bỏ
          onPress: () => console.log('Đăng xuất đã bị hủy'),
          style: 'cancel',
        },
        {
          text: 'Đăng xuất', // Nút xác nhận
          onPress: handleLogout,
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  // Đổi mật khẩu (điều hướng tới trang đổi mật khẩu)
  const handleChangePassword = () => {
    navigation.navigate('ChangePasswordScreen'); // Điều hướng tới trang đổi mật khẩu
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
        <BackButton />
        <Text style={styles.title}>Thông tin người dùng</Text>
      </View>
      {/* Hiển thị hình ảnh người dùng */}
      {userData && userData.url ? (
        <Image source={{uri: userData.url}} style={styles.userImage} />
      ) : (
        <Text>Chưa có hình ảnh</Text>
      )}
      {userData ? (
        <View>
          <Text>Tên: {userData.name}</Text>
          <Text>Giới tính: {userData.gender}</Text>
          <Text>Chức vụ: {userData.position}</Text>
          <Text>Vai trò: {userData.role}</Text>
          <Text>Email: {userData.email}</Text>
          <Text>Điện thoại: {userData.phone}</Text>
          <Text>Lương: {userData.salary}</Text>
          <Text>Địa chỉ: {userData.address}</Text>
        </View>
      ) : (
        <Text>Đang tải...</Text>
      )}

      {/* Nút Đổi mật khẩu */}
      <View style={styles.buttonContainer}>
        <Button title="Đổi mật khẩu" onPress={handleChangePassword} />
      </View>

      {/* Nút Đăng xuất */}
      <View style={styles.buttonContainer}>
        <Button title="Đăng xuất" onPress={showLogoutConfirmation} />
      </View>
    </View>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  userImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    alignSelf: 'center',
  },
});
