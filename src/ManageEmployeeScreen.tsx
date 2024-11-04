import {Alert, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {FlatList} from 'react-native-gesture-handler';
import BackButton from '../navigation/backButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Button} from 'react-native-paper';
import Colors from '../color/colors';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string;
}

const ManageEmployeeScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  //
  useEffect(() => {
    const fetchEmployee = firestore()
      .collection('users')
      .onSnapshot(
        snapshot => {
          const EmployeeList: Employee[] = [];
          snapshot.forEach(doc => {
            EmployeeList.push({
              ...(doc.data() as Employee),
              id: doc.id,
            });
          });
          setEmployees(EmployeeList);
          setIsLoading(false);
        },
        error => {
          console.log('Lỗi khi lấy dữ liệu từ firestore: Home', error);
          setIsLoading(false);
        },
      );
    return () => fetchEmployee();
  }, []);
  // Xóa nhân viên
  const deleteEmployee = (id: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa nhân viên này không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          onPress: () => {
            firestore()
              .collection('users')
              .doc(id)
              .delete()
              .then(() =>
                console.log('Success', 'Employee deleted successfully'),
              )
              .catch(err => Alert.alert('Error', err.message));
          },
        },
      ],
      {cancelable: false},
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={[styles.title, {alignSelf: 'center'}]}>
          Quản lý nhân viên
        </Text>
      </View>
      <Button
        mode="contained"
        style={styles.addButton}
        onPress={() => navigation.navigate('AddEmployee')}>
        <Text>Thêm nhân viên</Text>
      </Button>
      <FlatList
        data={employees}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.listItem}>
            <View>
              <Text>Name: {item.name}</Text>
              <Text>Position: {item.position}</Text>
              <Text>Role: {item.role}</Text>
            </View>
            <View style={styles.iconContainer}>
              <Icon
                name="edit"
                size={26}
                color="blue"
                onPress={() =>
                  navigation.navigate('EditEmployee', {employee: item})
                }
              />
              <Icon
                name="delete"
                size={26}
                color="red"
                onPress={() => deleteEmployee(item.id)}
                style={styles.icon}
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default ManageEmployeeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 10,
  },
  addButton: {
    marginBottom: 10,
    width: '40%',
    height: 50,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.AQUA_GREEN
  }
});
