import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import {Formik} from 'formik';
import * as Yup from 'yup';
import auth from '@react-native-firebase/auth';
import {Button} from 'react-native-paper';
import BackButton from '../navigation/backButton';
import Colors from '../color/colors';
import {SafeAreaView} from 'react-native';

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
      Alert.alert(
        'Thông báo',
        'Email khôi phục mật khẩu đã được gửi qua email!.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
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
      <View style={styles.container}>
        <View style={{flexDirection: 'row', margin: 10}}>
          <BackButton />
          <Text style={styles.title}>Quên mật khẩu</Text>
        </View>
        <Formik
          initialValues={{email: ''}}
          validationSchema={forgotPasswordSchema}
          onSubmit={values => forgotPassword(values.email)}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={{padding: 15}}>
              <Text style={{fontSize: 18, marginBottom: 10, color: 'red'}}>
                Nhập email để khôi phục mật khẩu* :
              </Text>
              {error ? (
                <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>
              ) : null}

              <TextInput
                placeholder="Email"
                inputMode="email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
                style={styles.input}
              />

              {touched.email && errors.email ? (
                <Text style={{color: 'red', marginBottom: 10}}>
                  {errors.email}
                </Text>
              ) : null}

              {error ? (
                <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>
              ) : null}

              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <Button
                  mode="contained"
                  style={styles.button}
                  onPress={() => {
                    handleSubmit();
                  }}>
                  <Text
                    style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
                    Gửi
                  </Text>
                </Button>
              )}
            </View>
          )}
        </Formik>
      </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  button: {
    marginTop: 5,
    marginBottom: 10,
    padding: 10,
    justifyContent: 'center',
    width: '60%',
    alignSelf: 'center',
    backgroundColor: Colors.AQUA_GREEN,
  },
});
