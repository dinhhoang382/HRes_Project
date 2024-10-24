import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {Formik} from 'formik';
import * as Yup from 'yup';
import auth from '@react-native-firebase/auth';
import {Button} from 'react-native';

const ForgotPasswordScreen = ({navigation}: {navigation: any}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email('Email không hợp lệ!')
      .required('Vui lòng nhập email!'),
  });

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError('');
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Thông báo', 'Email khôi phục mật khẩu đã được gửi.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('Email không tồn tại trong hệ thống.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email không hợp lệ, vui lòng kiểm tra lại.');
      } else {
        setError('Đã xảy ra lỗi, vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Formik
      initialValues={{email: ''}}
      validationSchema={forgotPasswordSchema}
      onSubmit={values => forgotPassword(values.email)}>
      {({handleChange, handleBlur, handleSubmit, values, errors, touched}) => (
        <View style={{padding: 20}}>
          <Text>Nhập email để khôi phục mật khẩu:</Text>
          {error ? (
            <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>
          ) : null}

          <TextInput
            placeholder="Email"
            onChangeText={handleChange('email')}
            onBlur={handleBlur('email')}
            value={values.email}
            keyboardType="email-address"
            style={{borderBottomWidth: 1, marginBottom: 10}}
          />

          {touched.email && errors.email ? (
            <Text style={{color: 'red', marginBottom: 10}}>{errors.email}</Text>
          ) : null}

          {error ? (
            <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>
          ) : null}

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button
              title="Gửi"
              onPress={() => {
                handleSubmit();
              }}
            />
          )}
        </View>
      )}
    </Formik>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({});
