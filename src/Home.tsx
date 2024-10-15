import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import MenuIcon from '../navigation/menuIcon';
import Icon from 'react-native-vector-icons/Ionicons';

//Define an interface for table data
interface Table {
  id: string;
  seats: number;
  reservation_id: string;
  table_number: number;
  status: 'available' | 'ordered';
}

//-> Trang chủ
const Home = ({route, navigation}: {route: any; navigation: any}) => {
  //-> Lấy thông tin người dùng từ route
  const {UserData, userId} = route.params || {};
  console.log('Home', userId);
  const [tableData, setTableData] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  //Hàm lấy dữ liệu từ firestore
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tables')
      .onSnapshot(
        snapshot => {
          const tableList: Table[] = [];
          snapshot.forEach(doc => {
            tableList.push({
              ...(doc.data() as Table),
              id: doc.id,
            });
          });
          tableList.sort((a, b) => a.table_number - b.table_number);
          setTableData(tableList);
          setIsLoading(false);
        },
        error => {
          console.log('Lỗi khi lấy dữ liệu từ firestore: Home', error);
          setIsLoading(false);
        },
      );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  //-> chi tiet dat ban
  const handleBookTable = (table: Table) => {
    navigation.navigate('TableDetail', {table, userId});
  };
  // ham render moi ban duoi dang 1 o
  const renderTable = ({item}: {item: Table}) => {
    return (
      <TouchableOpacity
        style={[
          styles.tableItem,
          item.status === 'ordered' ? styles.occupied : styles.available,
        ]}
        onPress={() => handleBookTable(item)}>
        <Text style={styles.tableText}>Bàn số {item.table_number}</Text>
        <Text style={styles.tableText}>Sức chứa: {item.seats} người</Text>
        <Text style={styles.tableText}>
          {/* Trạng thái:{' '} */}
          {item.status === 'available' ? 'Bàn Trống' : 'Đang sử dụng'}
        </Text>
      </TouchableOpacity>
    );
  };
  // Hiển thị khi đang loading
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <MenuIcon navigation={navigation} />
        <Text style={[styles.header, {fontSize: 20, fontWeight: 'bold'}]}>
          Danh sách bàn
        </Text>
        <Text style={[styles.header, {alignSelf: 'flex-end', color: 'red'}]}>
          {UserData.name}
        </Text>
      </View>
      <FlatList
        data={tableData}
        //-> keyExtractor là một hàm được sử dụng để trích xuất một khóa duy nhất cho mỗi phần tử trong mảng dữ liệu.
        keyExtractor={item => item.id}
        renderItem={renderTable} //-> render
        numColumns={2} // Hiển thị 2 cột
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tableItem: {
    flex: 1,
    gap: 5,
    margin: 10,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  available: {
    backgroundColor: '#c8e6c9',
  },
  occupied: {
    backgroundColor: '#ffcdd2',
  },
  tableText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default Home;
