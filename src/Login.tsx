import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';
import {getUserDocument} from '../utils/userUtils';

//-> Đăng nhập
const Login = ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //-> Lấy thông tin người dùng từ Firebase
  const handleLogin = async () => {
    try {
      setIsLoading(true); //-> Hiển thị loading
      const {user} = await auth().signInWithEmailAndPassword(email, password);
      const UserData = await getUserDocument(user.uid);
      //-> Lưu thông tin người dùng vào state hoặc context nếu cần
      //-> Chuyển hướng đến Dashboard hoặc trang khác
      console.log('User Data:', UserData);
      // console.log(user.uid);
      //-> Kiểm tra role của người dùng
      if (UserData?.role === 'admin') {
        console.log('Login Admin');
        navigation.navigate('DrawerNavigation', {UserData, userId: user.uid});
      } else {
        console.log('Login User');
        navigation.navigate('DrawerNavigation', {UserData, userId: user.uid});
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Lỗi', 'Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ImageBackground
      source={require('../image/logo/login_bg.png')}
      style={styles.imageBackground}
      resizeMode="cover"
      blurRadius={3}>
      <ScrollView>
        <View style={styles.container}>
          <Image
            source={require('../image/logo/icon_login.png')}
            style={{width: 200, height: 200, marginBottom: 10}}
          />
          <Text style={styles.text}>Trang Đăng Nhập</Text>
          <View style={styles.container1}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={text => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.container1}>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              secureTextEntry={showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye-slash' : 'eye'}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleLogin}
            style={styles.button}
            disabled={isLoading}>
            <Text style={{color: 'black', fontSize: 16, fontWeight: 'bold'}}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Text>
          </TouchableOpacity>
          <Text
            style={styles.forgetPassword}
            onPress={() => {
              console.log('Quen mk');
            }}>
            Quên mật khẩu
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  container1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'white',
    width: '80%',
    height: 50,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    width: '80%',
    height: 40,
    borderRadius: 10,
    fontSize: 16,
    paddingHorizontal: 10,
    borderColor: 'gray',
    backgroundColor: 'white',
    color: 'black',
  },
  button: {
    width: '50%',
    height: 50,
    borderRadius: 10,
    backgroundColor: 'lightblue',
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgetPassword: {
    color: 'white',
    fontSize: 16,
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
  },
});
export default Login;
