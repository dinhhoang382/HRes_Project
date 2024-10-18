import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Formik} from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/FontAwesome';
import Colors from '../color/colors';
import BackButton from '../navigation/backButton';

// Xác thực dữ liệu với Yup
const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Vui lòng nhập mật khẩu hiện tại'),
  newPassword: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu mới'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), undefined], 'Mật khẩu xác nhận không khớp')
    .required('Vui lòng xác nhận mật khẩu mới'),
});

const ChangePasswordScreen = ({navigation}: {navigation: any}) => {
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Hàm xác thực người dùng với mật khẩu hiện tại
  const reauthenticate = async (currentPassword: string) => {
    const user = auth().currentUser;
    const credential = auth.EmailAuthProvider.credential(
      user?.email || '',
      currentPassword,
    );
    try {
      await user?.reauthenticateWithCredential(credential);
    } catch (error) {
      throw new Error('Mật khẩu hiện tại không chính xác');
    }
  };

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    setIsLoading(true);
    try {
      // Xác thực lại người dùng
      await reauthenticate(currentPassword);

      // Đổi mật khẩu
      const user = auth().currentUser;
      await user?.updatePassword(newPassword);

      Alert.alert('Thành công', 'Mật khẩu của bạn đã được thay đổi');
      navigation.navigate('Login'); // Điều hướng sang trang đăng nhập sau khi đổi mật khẩu
    } catch (error: any) {
      console.log(error);
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{flexDirection: 'row', alignSelf: 'flex-start'}}>
        <BackButton />
        <Text style={styles.title}>Đổi Mật Khẩu</Text>
      </View>
      {/* Formik Form */}
      <Formik
        initialValues={{
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }}
        validationSchema={changePasswordSchema}
        onSubmit={values =>
          handleChangePassword(values.currentPassword, values.newPassword)
        }>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            {/* Mật khẩu hiện tại */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu hiện tại"
                secureTextEntry={showPassword}
                value={values.currentPassword}
                onChangeText={handleChange('currentPassword')}
                onBlur={handleBlur('currentPassword')}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-slash' : 'eye'}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {touched.currentPassword && errors.currentPassword ? (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            ) : null}

            {/* Mật khẩu mới */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu mới"
                secureTextEntry={showPassword}
                value={values.newPassword}
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
              />
            </View>
            {touched.newPassword && errors.newPassword ? (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            ) : null}

            {/* Xác nhận mật khẩu */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu mới"
                secureTextEntry={showPassword}
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
              />
            </View>
            {touched.confirmPassword && errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}

            {/* Nút đổi mật khẩu */}
            <TouchableOpacity
              onPress={handleSubmit as any}
              style={styles.button}
              disabled={isLoading}>
              <Text style={{color: 'black', fontSize: 16, fontWeight: 'bold'}}>
                {isLoading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  'Đổi mật khẩu'
                )}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.BLACK,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    backgroundColor: 'white',
    width: '100%',
    height: 50,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  input: {
    width: '90%',
    height: 40,
    borderRadius: 10,
    fontSize: 16,
    paddingHorizontal: 10,
    borderColor: 'gray',
    backgroundColor: 'white',
    color: 'black',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: 'lightblue',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default ChangePasswordScreen;
