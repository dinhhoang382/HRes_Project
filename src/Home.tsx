import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import MenuIcon from '../navigation/menuIcon';
import Icon from 'react-native-vector-icons/Ionicons';
import {Avatar} from 'react-native-paper';
import {Alert} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

//Define an interface for table data
interface Table {
  id: string;
  seats: number;
  reservation_id: string;
  table_number: number;
  status: 'available' | 'ordered';
}

const Home = ({route, navigation}: {route: any; navigation: any}) => {
  const {UserData, userId} = route.params || {};
  // console.log('Home', userId);
  const [tableData, setTableData] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'available' | 'ordered'
  >('all');
  // Handle back button press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Xác nhận thoát',
          'Bạn có chắc chắn muốn thoát ứng dụng?',
          [
            {
              text: 'Hủy',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: 'Thoát',
              onPress: () => BackHandler.exitApp(),
            },
          ],
          { cancelable: false }
        );
        return true; // Prevents default back action
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );
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
        <Text style={styles.tableText}>
          Số Bàn:{' '}
          <Text style={{fontSize: 26, color: 'blue'}}>{item.table_number}</Text>
        </Text>
        <Text style={styles.tableText}>Sức chứa: {item.seats} người</Text>
        <Text style={styles.tableText}>
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
  // Hiển thị danh sách lưới hoặc ô
  const toggleView = () => {
    setIsGridView(!isGridView);
  };
  //Lọc danh sách bàn trống hoặc đang sử dụng
  const toggleFilter = () => {
    setFilterStatus(prevStatus => {
      if (prevStatus === 'all') return 'available';
      if (prevStatus === 'available') return 'ordered';
      return 'all';
    });
  };
  const filteredTableData = tableData.filter(table => {
    if (filterStatus === 'all') return true;
    return table.status === filterStatus;
  });
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MenuIcon navigation={navigation} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Danh sách bàn</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.userName}>{UserData.name}</Text>
          <Avatar.Image
            source={
              UserData?.url
                ? {uri: UserData.url}
                : require('../image/logo/icon_login.png')
            }
            size={35}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 10,
        }}>
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilter}>
          <Text style={styles.filterButtonText}>
            Lọc bàn:{' '}
            {filterStatus === 'all'
              ? 'Tất cả'
              : filterStatus === 'available'
              ? 'Trống'
              : 'Sử Dụng'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{alignSelf: 'flex-end', marginEnd: 10}}
          onPress={toggleView}>
          <Icon
            name={isGridView ? 'grid-outline' : 'list-outline'}
            size={30}
            color="black"
          />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredTableData}
        //-> keyExtractor là một hàm được sử dụng để trích xuất một khóa duy nhất cho mỗi phần tử trong mảng dữ liệu.
        keyExtractor={item => item.id}
        renderItem={renderTable} //-> render
        numColumns={isGridView ? 2 : 1} // Hiển thị 2 cột
        key={isGridView ? 'grid' : 'list'}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
    elevation: 0, // Hiệu ứng shadow đổ bóng
    borderWidth: 1,
    borderColor: '#ccc',
  },
  userName: {
    marginRight: 10,
    fontSize: 16,
    color: 'green',
  },
  available: {
    backgroundColor: '#c8e6c9',
  },
  occupied: {
    // backgroundColor: '#ffcdd2'
    backgroundColor: '#ffcdd2',
  },
  tableText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  filterButton: {
    alignSelf: 'flex-end',
    marginEnd: 10,
  },
  filterButtonText: {
    color: 'gray',
    fontSize: 20,
  },
});
export default Home;
