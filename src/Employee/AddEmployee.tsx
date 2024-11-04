import {Alert, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Button, TextInput} from 'react-native-paper';

const AddEmployee = ({route, navigation}: {route: any; navigation: any}) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [position, setPosition] = React.useState('');
  const [salary, setSalary] = React.useState('');
  const [role, setRole] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');

  const handleRegister = async () => {
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
      Alert.alert('Thành công', 'Nhân viên đã được đăng ký thành công');
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
    <View style={styles.container}>
      <Text style={styles.title}>Thêm nhân viên</Text>
      <TextInput
        mode="outlined"
        label={'Tên'}
        placeholder="Tên"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        placeholder="Chức vụ"
        value={position}
        onChangeText={setPosition}
        style={styles.input}
      />
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
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType='email-address'
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
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
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        placeholder="Vai trò (manager/staff)"
        value={role}
        onChangeText={setRole}
        style={styles.input}
      />
      <Button mode="contained" style={{width: 200,alignSelf: 'center', marginVertical: 20}} onPress={handleRegister}>
        <Text>Đăng ký nhân viên</Text>
      </Button>
    </View>
  );
};

export default AddEmployee;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
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
