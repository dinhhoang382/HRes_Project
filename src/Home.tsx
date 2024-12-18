import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
  BackHandler,
  Image,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import MenuIcon from '../navigation/menuIcon';
import Icon from 'react-native-vector-icons/Ionicons';
import {Avatar} from 'react-native-paper';
import {Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Carousel from 'react-native-snap-carousel';

//Define an interface for table data
interface Table {
  id: string;
  seats: number;
  reservation_id: string;
  table_number: number;
  status: 'available' | 'ordered';
}
interface Event {
  id: string;
  event_name: string;
  date: string;
  tables_reserved: number;
  total_guests: number;
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
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
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
          {cancelable: false},
        );
        return true; // Prevents default back action
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
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
  const today = firestore.Timestamp.fromDate(new Date());
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      const eventsRef = firestore().collection('events').orderBy('date', 'asc');

      eventsRef.onSnapshot(
        snapshot => {
          const events: Event[] = [];
          snapshot.forEach(doc => {
            events.push({
              ...(doc.data() as Event),
              id: doc.id,
            });
          });
          setUpcomingEvents(events);
        },
        error => console.log('Lỗi khi lấy dữ liệu sự kiện: ', error),
      );
    };

    fetchUpcomingEvents();
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
        <View style={styles.tableIconContainer}>
          <Image
            source={require('../image/foods/table_icon.png')} // Replace with your table icon path
            style={styles.tableIcon}
          />
          <Text style={styles.tableNumber}>{item.table_number}</Text>
        </View>
        <Text style={styles.tableText}>
          {item.status === 'available' ? 'Bàn Trống' : 'Đang sử dụng'}
        </Text>
        <Text style={styles.tableText}>Sức chứa: {item.seats} người</Text>
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
  // console.log(upcomingEvents);
  //SLIDE
  const SLIDER_WIDTH = Dimensions.get('window').width;
  const ITEM_WIDTH = SLIDER_WIDTH * 0.8;
  const renderEventItem = ({item}: {item: Event}) => {
    return (
      <View style={styles.eventItem}>
        <Text style={styles.eventTitle}>{item.event_name}</Text>
        <Text style={styles.eventDate}>
          Ngày: {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MenuIcon navigation={navigation} />
        <View style={styles.headerCenter}>
          <Image
            source={require('../image/logo/icon_login.png')}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>HRes Project</Text>
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
          marginBottom: 5,
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
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            navigation.navigate('EventListScreen');
          }}>
          <Text style={styles.addButtonText}>Quản lý Sự Kiện</Text>
        </TouchableOpacity>
      </View>
      <View>
        {upcomingEvents.length > 0 && (
          <View style={{height: 200, marginBottom: 10}}>
            <Text style={styles.sectionTitle}>Sự kiện sắp diễn ra</Text>
            <FlatList
              data={upcomingEvents}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <View style={styles.eventItem}>
                  <Text style={styles.eventTitle}>{item.event_name}</Text>
                  <Text style={styles.eventDate}>
                    Ngày: {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
      <View
        style={{
          height: 2,
          backgroundColor: '#ccc',
          marginVertical: 5,
          marginHorizontal: 10,
        }}
      />
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={{fontSize: 20, fontWeight: 'bold', marginVertical: 5}}>
          Đặt bàn
        </Text>
        <Text
          style={styles.viewAllTablesButtonText}
          onPress={() => navigation.navigate('AllTableScreen')}>
          Xem tất cả
        </Text>
      </View>
      <FlatList
        data={filteredTableData}
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
    gap: 2,
    margin: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2, // Hiệu ứng shadow đổ bóng
    borderWidth: 1,
    borderColor: '#ccc',
  },
  userName: {
    marginRight: 10,
    fontSize: 18,
    color: 'green',
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
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'flex-start',
    marginStart: 10,
    flexDirection: 'row',
  },
  filterButton: {
    alignSelf: 'flex-end',
    marginEnd: 10,
  },
  filterButtonText: {
    color: 'gray',
    fontSize: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  eventDescription: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  tableIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  tableIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  tableNumber: {
    fontSize: 30,
    color: 'blue',
    fontWeight: 'bold',
  },
  viewAllTablesButton: {
    borderRadius: 10,
    alignItems: 'center',
  },
  viewAllTablesButtonText: {
    padding: 5,
    color: 'blue',
    fontSize: 18,
  },
});
export default Home;
