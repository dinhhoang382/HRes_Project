import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {removeAccents} from '../text/removeAcess';
import {FlatList, GestureHandlerRootView} from 'react-native-gesture-handler';
import {ScrollView} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../color/colors';
import BackButton from '../navigation/backButton';
import {useFocusEffect} from '@react-navigation/native';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image: string;
  hidden: boolean;
}

const ManageFoodScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [notification, setNotification] = useState('');

  //lấy dữ liệu từ firestore
  const fetchFoodItems = async () => {
    try {
      const snapshot = await firestore().collection('food_items').get();
      const foodList: FoodItem[] = snapshot.docs.map(doc => ({
        ...(doc.data() as FoodItem),
        id: doc.id,
        hidden: doc.data().hidden || false,
      }));
      setFoodItems(foodList);
      setFilteredItems(foodList);
      setIsLoading(false);
    } catch (error) {
      console.log('Lỗi không lấy được dữ liệu Food Item: OrderScreen', error);
      setIsLoading(false);
    }
  };
  // search
  const handleSearch = () => {
    if (searchText === '') {
      setFilteredItems(foodItems); // Nếu không có từ khóa, hiển thị tất cả món ăn
    } else {
      const searchQuery = removeAccents(searchText).toLowerCase();
      const filtered = foodItems.filter(item =>
        removeAccents(item.name).toLowerCase().includes(searchQuery),
      );
      setFilteredItems(filtered); // Cập nhật danh sách món ăn đã lọc
    }
  };
  useEffect(() => {
    fetchFoodItems();
  }, []);

  // search
  useEffect(() => {
    handleSearch();
  }, [searchText]);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredItems(foodItems);
    } else {
      setFilteredItems(
        foodItems.filter(item => item.category_id === activeTab),
      );
    }
  }, [activeTab, foodItems]);

  useFocusEffect(
    React.useCallback(() => {
      fetchFoodItems();
    }, []),
  );

  const toggleHideFoodItem = async (item: FoodItem) => {
    try {
      await firestore().collection('food_items').doc(item.id).update({
        hidden: !item.hidden,
      });
      fetchFoodItems(); // Refresh the list after updating
      setNotification(`Món ăn đã được ${item.hidden ? 'hiện' : 'ẩn'}.`);
    } catch (error) {
      console.log('Error hiding food item:', error);
    }
  };

  const tabs = [
    {id: 'all', title: 'Tất cả'},
    {id: 'main', title: 'Đồ ăn chính'},
    {id: 'drink', title: 'Đồ uống'},
    {id: 'oyster', title: 'Hàu'},
    {id: 'appetizer', title: 'Khai vị'},
    {id: 'dessert', title: 'Tráng miệng'},
  ];

  const renderFoodItem = ({item}: {item: FoodItem}) => (
    <View style={styles.foodItemContainer}>
      <Image source={{uri: item.image}} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>{item.price.toLocaleString()} VND</Text>
      </View>
      <View style={styles.iconContainer}>
        <Icon
          name="edit"
          size={26}
          color="#007AFF"
          style={styles.icon}
          onPress={() => {
            navigation.navigate('EditFood', {food: item});
          }}
        />
        <Icon
          name={item.hidden ? "visibility-off" : "visibility"}
          size={26}
          color="black"
          style={styles.icon}
          onPress={() => toggleHideFoodItem(item)}
        />
        <Icon
          name="delete"
          size={26}
          color="#ff4d4f"
          style={styles.icon}
          onPress={() => {}}
        />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  const TabButton = ({
    title,
    onPress,
    isActive,
  }: {
    title: string;
    onPress: () => void;
    isActive: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        isActive && styles.activeTabButton,
        {marginHorizontal: 5},
      ]}
      onPress={onPress}>
      <Text
        style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.mainContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              marginHorizontal: 20,
              marginTop: 5,
            }}>
            <BackButton />
            <Text style={styles.title}>Quản lý thực đơn</Text>
          </View>
          <FlatList
            ListHeaderComponent={
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tabScrollContainer}>
                  {tabs.map(tab => (
                    <TabButton
                      key={tab.id}
                      title={tab.title}
                      onPress={() => setActiveTab(tab.id)}
                      isActive={activeTab === tab.id}
                    />
                  ))}
                </ScrollView>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm món ăn..."
                  value={searchText}
                  onChangeText={setSearchText}
                />
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CategoryManage')}>
                    <Text style={styles.addButtonText}>Danh mục món</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddFood')}>
                    <Text style={styles.addButtonText}>Thêm món ăn</Text>
                  </TouchableOpacity>
                </View>
              </>
            }
            data={filteredItems}
            renderItem={renderFoodItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
          />
          {notification ? (
            <View style={styles.notificationContainer}>
              <Text style={styles.notificationText}>{notification}</Text>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

export default ManageFoodScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginBottom: 10,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  foodList: {
    paddingHorizontal: 10,
  },
  foodItemContainer: {
    flex: 1,
    flexDirection: 'row', // Hiển thị nội dung theo chiều ngang
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 5,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000', // Màu sắc của bóng
    shadowOffset: {width: 0, height: 2}, // Vị trí của bóng
    shadowOpacity: 0.1, // Độ mờ của bóng
    shadowRadius: 4, // Bán kính bóng
    elevation: 3, // Hiển thị bóng cho phần tử
  },
  foodImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  foodPrice: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingBottom: 100,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 10,
    width: 150,
    alignSelf: 'flex-end',
    marginHorizontal: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    height: 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    backgroundColor: '#007AFF',
    borderRadius: 40,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemCount: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff4d4f',
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cartItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    color: '#007AFF',
  },
  cartItemQuantity: {
    color: '#888',
  },
  removeButton: {
    padding: 5,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyCartText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#888',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    margin: 10,
    backgroundColor: '#fff',
  },
  previousOrdersButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '60%',
  },
  previousOrdersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabScrollContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007AFF',
    padding: 10,
    alignItems: 'center',
  },
  notificationText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
