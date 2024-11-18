import React, {useState} from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {getUserDocument} from '../utils/userUtils';
import {Formik} from 'formik';
import * as Yup from 'yup';
import Colors from '../color/colors';
import {useFocusEffect} from '@react-navigation/native';
import {TextInput} from 'react-native-paper';

// Xác thực dữ liệu với Yup
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
});

const Login = ({navigation}: {navigation: any}) => {
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const {user} = await auth().signInWithEmailAndPassword(email, password);
      const UserData = await getUserDocument(user.uid);
      console.log('User Data:', UserData);
      navigation.navigate('DrawerNavigation', {UserData, userId: user.uid});
    } catch (error) {
      console.log(error);
      Alert.alert('Lỗi', 'Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };
  // Handle back button press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true; // Prevents default back action
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  return (
    <ImageBackground
      source={require('../image/logo/bg_white.jpg')}
      style={styles.imageBackground}
      resizeMode="cover"
      blurRadius={5}>
      <ScrollView>
        <View style={styles.container}>
          <Image
            source={require('../image/logo/icon_login.png')}
            style={{width: 200, height: 200, marginBottom: 10}}
          />
          <Text style={[styles.text, {fontSize: 30, color: Colors.BLACK}]}>
            Trang Đăng Nhập
          </Text>

          {/* Formik Form */}
          <Formik
            initialValues={{email: '', password: ''}}
            validationSchema={loginSchema}
            onSubmit={values => handleLogin(values.email, values.password)}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={{width: '100%', alignItems: 'center'}}>
                <TextInput
                  style={[styles.input,{ marginBottom: 10}]}
                  placeholder="Email"
                  mode='outlined'
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
                <TextInput
                  style={styles.input}
                  placeholder="Mật khẩu"
                  mode='outlined'
                  secureTextEntry={showPassword}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye' : 'eye-off'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />
                {touched.password && errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}

                <TouchableOpacity
                  onPress={handleSubmit as any}
                  style={styles.button}
                  disabled={isLoading}>
                  <Text
                    style={{color: 'black', fontSize: 18, fontWeight: 'bold'}}>
                    {isLoading ? (
                      <ActivityIndicator color="black" />
                    ) : (
                      'Đăng nhập'
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <TouchableOpacity
            style={{alignSelf: 'flex-end', marginEnd: 10}}
            onPress={() => navigation.navigate('ForgotPasswordScreen')}>
            <Text style={[styles.text, {color: Colors.BLACK}]}>
              Quên mật khẩu
            </Text>
          </TouchableOpacity>
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
  text: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    height: 60,
    fontSize: 18,
    paddingHorizontal: 10,
    borderColor: 'gray',
    backgroundColor: 'white',
    color: 'black',
  },
  button: {
    width: '55%',
    height: 50,
    borderRadius: 10,
    backgroundColor: 'lightblue',
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  labelText: {
    color: 'black',
    fontSize: 16,
    marginTop: -10, // Adjust as needed to position the label
    marginBottom: 10,
  },
});

export default Login;
