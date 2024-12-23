import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    TouchableWithoutFeedback,
  } from 'react-native';
  import React, {useEffect, useState} from 'react';
  import firestore from '@react-native-firebase/firestore';
  import MenuIcon from '../navigation/menuIcon';
  import Icon from 'react-native-vector-icons/Ionicons';
  import UserModal from '../utils/userModal';
  
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
    const [cardVisible, setCardVisible] = useState(false);
    const [isGridView, setIsGridView] = useState(true);
  
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
    const toggleView = () => {
      setIsGridView(!isGridView);
    };
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MenuIcon navigation={navigation} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Danh sách bàn</Text>
          </View>
          {/* Thông tin tài khoản */}
          <TouchableWithoutFeedback onPress={() => setCardVisible(!cardVisible)}>
            <View style={styles.headerRight}>
              <Text style={styles.userName}>{UserData.name}</Text>
              <View style={styles.adminButton}>
                <Icon name="person" size={24} color="white" />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <TouchableOpacity style={{alignSelf: 'flex-end', marginEnd: 10}} onPress={toggleView}>
          <Icon
            name={isGridView ? 'grid-outline' : 'list-outline'}
            size={30}
            color="black"
          />
        </TouchableOpacity>
        <FlatList
          data={tableData}
          //-> keyExtractor là một hàm được sử dụng để trích xuất một khóa duy nhất cho mỗi phần tử trong mảng dữ liệu.
          keyExtractor={item => item.id}
          renderItem={renderTable} //-> render
          numColumns={isGridView ? 2 : 1} // Hiển thị 2 cột
          key={isGridView ? 'grid' : 'list'}
        />
        {cardVisible && (
          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() =>
                navigation.navigate('UserProfileScreen', {
                  userId: userId,
                })
              }>
              <Text style={[styles.tableText, {color: 'white'}]}>
                Thông tin tài khoản
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => setCardVisible(false)}>
              <Text style={[styles.tableText, {color: 'white'}]}>Đăng xuất</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => setCardVisible(false)}>
              <Text style={[styles.tableText, {color: 'white'}]}>Thoát</Text>
            </TouchableOpacity>
          </View>
        )}
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
      elevation: 5,
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
      backgroundColor: '#ffcdd2',
    },
    adminButton: {
      width: 35,
      height: 35,
      borderRadius: 5,
      backgroundColor: 'green',
      // backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
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
    cardContainer: {
      position: 'absolute',
      width: 250,
      alignItems: 'center',
      top: 60,
      right: 10,
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 1, // Đảm bảo Card hiển thị trên các phần tử khác
    },
    cardButton: {
      backgroundColor: '#2196F3',
      borderRadius: 10,
      width: '90%',
      padding: 10,
      marginTop: 10,
      alignItems: 'center',
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
    },
    toggleButtonText: {
      fontSize: 16,
      color: 'blue',
      marginLeft: 10,
    },
  });
  export default Home;
  