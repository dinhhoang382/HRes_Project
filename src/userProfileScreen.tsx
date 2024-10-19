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
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Thông tin người dùng</Text>
      </View>
      {/* Hiển thị hình ảnh người dùng */}
      {userData && userData.url ? (
        <Image source={{uri: userData.url}} style={styles.userImage} />
      ) : (
        <Text style={styles.noImageText}>Chưa có hình ảnh</Text>
      )}
      {userData ? (
        <View style={styles.userInfo}>
          <Text style={styles.userInfoText}>Tên: {userData.name}</Text>
          <Text style={styles.userInfoText}>Giới tính: {userData.gender}</Text>
          <Text style={styles.userInfoText}>Chức vụ: {userData.position}</Text>
          <Text style={styles.userInfoText}>Vai trò: {userData.role}</Text>
          <Text style={styles.userInfoText}>Email: {userData.email}</Text>
          <Text style={styles.userInfoText}>Điện thoại: {userData.phone}</Text>
          <Text style={styles.userInfoText}>Lương: {userData.salary}</Text>
          <Text style={styles.userInfoText}>Địa chỉ: {userData.address}</Text>
        </View>
      ) : (
        <Text style={styles.loadingText}>Đang tải...</Text>
      )}

      {/* Nút Đổi mật khẩu */}
      <View style={styles.buttonContainer}>
        <Button title="Đổi mật khẩu" onPress={handleChangePassword} color="#007BFF" />
      </View>

      {/* Nút Đăng xuất */}
      <View style={styles.buttonContainer}>
        <Button title="Đăng xuất" onPress={showLogoutConfirmation} color="#FF0000" />
      </View>
    </View>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff', // Changed to white for a cleaner look
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26, // Increased font size
    fontWeight: 'bold',
    color: '#333', // Darker color for better contrast
    marginLeft: 10,
  },
  userImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  noImageText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
  },
  userInfoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 5,
    overflow: 'hidden',
  },
});
