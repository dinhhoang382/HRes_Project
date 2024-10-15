import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import {removeAccents} from '../text/removeAcess';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ScrollView} from 'react-native-gesture-handler';
import {Route} from 'lucide-react';
import CartAnimation from '../reanimate/AnimationCart';
interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image: string;
}

interface CartItem extends FoodItem {
  quantity: number;
}

const OrderScreen = ({route, navigation}: {route: any; navigation: any}) => {
  const {table_number, userId, invoiceId, table_id} = route.params; // Lấy số bàn từ route
  // console.log('Orderscreen: ', table_id);
  const [activeTab, setActiveTab] = useState('all');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchFoodItems = async () => {
    try {
      const snapshot = await firestore().collection('food_items').get();
      const foodList: FoodItem[] = snapshot.docs.map(doc => ({
        ...(doc.data() as FoodItem),
        id: doc.id,
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

  const tabs = [
    {id: 'all', title: 'Tất cả'},
    {id: 'main', title: 'Đồ ăn chính'},
    {id: 'drink', title: 'Đồ uống'},
    {id: 'oyster', title: 'Hàu'},
    {id: 'appetizer', title: 'Khai vị'},
    {id: 'dessert', title: 'Tráng miệng'},
  ];

  // Thêm states cho animation
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationConfig, setAnimationConfig] = useState({
    startPosition: {x: 0, y: 0},
    endPosition: {x: 0, y: 0},
  });
  const cartButtonRef = useRef<View>(null);

  // Thêm hàm đo vị trí giỏ hàng
  const measureCartButton = () => {
    return new Promise(resolve => {
      cartButtonRef.current?.measure(
        (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number,
        ) => {
          resolve({x: pageX + width / 2, y: pageY + height / 2});
        },
      );
    });
  };

  // Cập nhật hàm addToCart
  const handleAddToCart = async (item: FoodItem, event: any) => {
    const itemPosition = {
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    };

    const cartPosition = await measureCartButton();

    setAnimationConfig({
      startPosition: itemPosition,
      endPosition: cartPosition as {x: number; y: number},
    });
    setIsAnimating(true);

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? {...cartItem, quantity: cartItem.quantity + 1}
            : cartItem,
        );
      }
      return [...prevCart, {...item, quantity: 1}];
    });
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (item: FoodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? {...cartItem, quantity: cartItem.quantity + 1}
            : cartItem,
        );
      }
      return [...prevCart, {...item, quantity: 1}];
    });
  };

  // Xóa sản phẩm từ giỏ hàng
  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const renderFoodItem = ({item}: {item: FoodItem}) => (
    <View style={styles.foodItemContainer}>
      <Image source={{uri: item.image}} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>{item.price.toLocaleString()} VND</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={event => handleAddToCart(item, event)}>
        <Icon name="plus-circle" color="#fff" size={24} />
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = useMemo(
    () =>
      ({item}: {item: CartItem}) =>
        (
          <View style={styles.cartItemContainer}>
            <Image source={{uri: item.image}} style={styles.cartItemImage} />
            <View style={styles.cartItemInfo}>
              <Text style={styles.cartItemName}>{item.name}</Text>
              <Text style={styles.cartItemPrice}>
                {(item.price * item.quantity).toLocaleString()} VND
              </Text>
              <Text style={styles.cartItemQuantity}>
                Số lượng: {item.quantity}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFromCart(item.id)}>
              <Icon name="minus-circle" color="#ff4d4f" size={24} />
            </TouchableOpacity>
          </View>
        ),
    [cart],
  );

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

  const CartModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isCartVisible}
      onRequestClose={() => setIsCartVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Đơn món ăn của bạn</Text>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyCartText}>Đơn món ăn trống!</Text>
            }
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsCartVisible(false)}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.mainContainer}>
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
              </>
            }
            data={filteredItems}
            renderItem={renderFoodItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.flatListContent}
          />
          <CartAnimation
            startPosition={animationConfig.startPosition}
            endPosition={animationConfig.endPosition}
            isAnimating={isAnimating}
            onAnimationEnd={handleAnimationEnd}
          />
          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
              style={styles.previousOrdersButton}
              onPress={() => {
                navigation.navigate('PreviousOrderScreen', {
                  orders: cart,
                  table_number: table_number,
                  userId: userId,
                  table_id: table_id,
                  invoiceId: invoiceId,
                });
              }}>
              <Text style={styles.previousOrdersButtonText}>
                Xem các món đã đặt
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              ref={cartButtonRef}
              style={styles.cartButton}
              onPress={() => setIsCartVisible(true)}>
              <Icon name="shopping-cart" color="#fff" size={24} />
              <Text style={styles.cartItemCount}>{cart.length}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <CartModal />
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

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
    borderRadius: 5,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default OrderScreen;
