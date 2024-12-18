import React, {useRef, useState} from 'react';
import {View, TextInput, Button, Alert, Text, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Picker} from '@react-native-picker/picker';
import BackButton from '../../navigation/backButton';

const EditEmployeeScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const {employee} = route.params;

  const [name, setName] = useState(employee.name);
  const [position, setPosition] = useState(employee.position);
  const [salary, setSalary] = useState(employee.salary?.toString() || '');
  const [email, setEmail] = useState(employee.email);
  const [phone, setPhone] = useState(employee.phone);
  const [address, setAddress] = useState(employee.address);
  const [role, setRole] = useState(employee.role);

  const updateEmployee = () => {
    if (!name || !position || !email || !phone || !address || !role) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    firestore()
      .collection('users')
      .doc(employee.id)
      .update({
        name,
        position,
        salary: salary ? parseFloat(salary) : null,
        email,
        phone,
        address,
        role,
      })
      .then(() => {
        Alert.alert('Success', 'Employee updated successfully');
        navigation.goBack();
      })
      .catch(err => Alert.alert('Error', err.message));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={[styles.title, {alignSelf: 'center'}]}>Chỉnh sửa</Text>
      </View>
      <Text>Tên</Text>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{borderBottomWidth: 1, marginBottom: 10}}
      />
      <Text>Vị trí</Text>
      <Picker
        selectedValue={position}
        onValueChange={itemValue => setPosition(itemValue)}
        style={{borderBottomWidth: 1, marginBottom: 10, height: 50}}>
        <Picker.Item label="Nhân viên" value="Nhân viên" />
        <Picker.Item label="Đầu bếp" value="Đầu bếp" />
        <Picker.Item label="Quản lý" value="Quản lý" />
      </Picker>
      <Text>Lương</Text>
      <TextInput
        placeholder="Salary"
        value={salary}
        onChangeText={setSalary}
        keyboardType="numeric"
        style={{borderBottomWidth: 1, marginBottom: 10}}
      />
      <Text>Email</Text>
      <TextInput
        placeholder="Email"
        value={email}
        editable={false}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={{borderBottomWidth: 1, marginBottom: 10}}
      />
      <Text>Điện thoại</Text>
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{borderBottomWidth: 1, marginBottom: 10}}
      />
      <Text>Địa chỉ</Text>
      <TextInput
        placeholder="Address"
        value={address}
        multiline={true}
        onChangeText={setAddress}
        style={{borderBottomWidth: 1, marginBottom: 10, maxHeight: 100}}
      />
      <Text>Vai trò</Text>
      <Picker
        selectedValue={role}
        onValueChange={itemValue => setRole(itemValue)}
        style={{borderBottomWidth: 1, marginBottom: 10, height: 50}}>
        <Picker.Item label="Admin" value="admin" />
        <Picker.Item label="User" value="user" />
      </Picker>
      <Button title="Cập nhật" onPress={updateEmployee} />
    </View>
  );
};

export default EditEmployeeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
    marginStart: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
