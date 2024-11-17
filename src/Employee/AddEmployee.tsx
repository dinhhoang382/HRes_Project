import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Button, TextInput} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';

const AddEmployee = ({route, navigation}: {route: any; navigation: any}) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [position, setPosition] = React.useState('');
  const [salary, setSalary] = React.useState('');
  const [role, setRole] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .set({
          name,
          position,
          salary: salary ? parseInt(salary, 10) : null,
          email,
          phone,
          address,
          role,
        });
      Alert.alert('Thành công', 'Nhân viên đã được đăng ký thành công', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('ManageEmployeeScreen');
          },
        },
      ]);
      // Clear the form
      setName('');
      setPosition('');
      setSalary('');
      setEmail('');
      setPhone('');
      setAddress('');
      setRole('');
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng ký tài khoản');
      console.log('Add Employee - Error creating user:', error);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Thêm nhân viên</Text>
          <Text style={[styles.title, {marginStart: 10, fontSize: 15}]}>
            Đăng ký tài khoản
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye' : 'eye-off'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          <TextInput
            mode="outlined"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye' : 'eye-off'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />
          <Text
            style={[
              styles.title,
              {marginStart: 10, fontSize: 15, marginVertical: 10},
            ]}>
            Đăng ký thông tin nhân viên
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Tên"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <Text>Chức vụ</Text>
          <Picker
            selectedValue={position}
            onValueChange={itemValue => setPosition(itemValue)}
            style={{borderBottomWidth: 1, marginBottom: 10, height: 50}}>
            <Picker.Item label="Nhân viên" value="Nhân viên" />
            <Picker.Item label="Đầu bếp" value="Đầu bếp" />
            <Picker.Item label="Quản lý" value="Quản lý" />
          </Picker>
          <TextInput
            mode="outlined"
            placeholder="Lương"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            placeholder="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            placeholder="Địa chỉ"
            multiline={true}
            value={address}
            onChangeText={setAddress}
            style={[styles.input, {height: 80}]}
          />
          <Text>Vai trò</Text>
          <Picker
            selectedValue={role}
            onValueChange={itemValue => setRole(itemValue)}
            style={{marginBottom: 10, height: 50, borderBottomWidth: 1}}>
            <Picker.Item label="Admin" value="admin" />
            <Picker.Item label="User" value="user" />
          </Picker>
          <Button
            mode="contained"
            style={{width: 200, alignSelf: 'center', marginVertical: 20}}
            onPress={handleRegister}>
            <Text>Đăng ký nhân viên</Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddEmployee;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderColor: '#ccc',
    marginBottom: 10,
    height: 55,
  },
});
