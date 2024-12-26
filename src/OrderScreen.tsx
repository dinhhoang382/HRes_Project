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
  KeyboardAvoidingView,
  Platform,
  Animated,
  Button,
} from 'react-native';
import {TextInput} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import {removeAccents} from '../text/removeAcess';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ScrollView} from 'react-native-gesture-handler';
import BackButton from '../navigation/backButton';
interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image: string;
  hidden: boolean;
}

interface CartItem extends FoodItem {
  quantity: number;
}
// AI-powered search and recommendation logic
const useAIFoodSearch = (foodItems: FoodItem[]) => {
  const [searchText, setSearchText] = useState('');
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>(foodItems);
  const [aiSuggestions, setAiSuggestions] = useState<FoodItem[]>([]);

  // Advanced search algorithm with AI-like features
  const performAISearch = (query: string) => {
    if (query === '') {
      setFilteredItems(foodItems);
      setAiSuggestions([]);
      return;
    }

    // Basic search with accent removal and fuzzy matching
    const normalizedQuery = removeAccents(query).toLowerCase();
    const searchResults = foodItems.filter(item => 
      removeAccents(item.name).toLowerCase().includes(normalizedQuery)
    );

    // AI-like suggestion logic
    const suggestions = foodItems.filter(item => {
      // Contextual suggestions based on search query
      const contextSimilarity = [
        // Similar categories
        item.category_id === searchResults[0]?.category_id,
        // Similar price range (±20%)
        searchResults[0] && 
        item.price >= searchResults[0].price * 0.8 && 
        item.price <= searchResults[0].price * 1.2,
        // Phonetically similar names
        normalizedQuery.length > 2 && 
        calculateSimilarity(removeAccents(item.name).toLowerCase(), normalizedQuery) > 0.6
      ].filter(Boolean).length;

      return contextSimilarity > 1 && !searchResults.includes(item);
    });

    setFilteredItems(searchResults);
    setAiSuggestions(suggestions.slice(0, 3)); // Limit to 3 suggestions
  };

  // Simple string similarity calculation
  const calculateSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    let matches = 0;
    for (let i = 0; i < Math.min(len1, len2); i++) {
      if (str1[i] === str2[i]) matches++;
    }
    
    return matches / maxLen;
  };

  // Recommendation logic based on previous selections
  const getRecommendations = (cart: CartItem[]) => {
    if (cart.length === 0) return [];

    // Enhanced pattern analysis
    const cartCategories = [...new Set(cart.map(item => item.category_id))];
    const avgCartPrice = cart.reduce((sum, item) => sum + item.price, 0) / cart.length;
    const timeOfDay = new Date().getHours();

    return foodItems.filter(item => {
      // Category matching
      const categoryMatch = cartCategories.includes(item.category_id);
      
      // Price range matching
      const priceMatch = item.price >= avgCartPrice * 0.8 && item.price <= avgCartPrice * 1.2;
      
      // Time-based recommendations
      const isLunchTime = timeOfDay >= 11 && timeOfDay <= 14;
      const isDinnerTime = timeOfDay >= 17 && timeOfDay <= 22;
      const timeMatch = (isLunchTime && item.category_id === 'appetizer') || 
                       (isDinnerTime && item.category_id === 'dessert');

      // Complementary items logic
      const hasMainCourse = cart.some(cartItem => 
        ['oyster', 'shrimp'].includes(cartItem.category_id)
      );
      const complementaryMatch = hasMainCourse && item.category_id === 'drink';

      // Combined scoring
      const score = [
        categoryMatch ? 2 : 0,
        priceMatch ? 1 : 0,
        timeMatch ? 1.5 : 0,
        complementaryMatch ? 2 : 0
      ].reduce((a, b) => a + b, 0);

      return score >= 2 && !cart.some(cartItem => cartItem.id === item.id);
    })
    .sort((a, b) => b.price - a.price) // Sort by price descending
    .slice(0, 3); // Top 3 recommendations
  };

  return {
    searchText,
    setSearchText,
    filteredItems,
    setFilteredItems,
    aiSuggestions,
    performAISearch,
    getRecommendations
  };
}

const OrderScreen = ({route, navigation}: {route: any; navigation: any}) => {
  const {table_number, userId, invoiceId, table_id} = route.params;
  const [activeTab, setActiveTab] = useState('all');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchFoodItems = async () => {
    try {
      const snapshot = await firestore().collection('food_items').get();
      const foodList: FoodItem[] = snapshot.docs.map(doc => ({
        ...(doc.data() as FoodItem),
        id: doc.id,
      }));
      setFoodItems(foodList);
      setIsLoading(false);
    } catch (error) {
      console.log('Lỗi không lấy được dữ liệu Food Item: OrderScreen', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const {
    searchText,
    setSearchText,
    filteredItems,
    setFilteredItems,
    aiSuggestions,
    performAISearch,
    getRecommendations
  } = useAIFoodSearch(foodItems);

  useEffect(() => {
    performAISearch(searchText);
  }, [searchText, foodItems]);

  useEffect(() => {
    if (activeTab === 'all') {
      performAISearch(searchText);
    } else {
      setFilteredItems(
        foodItems.filter(item => item.category_id === activeTab && !item.hidden)
      );
    }
  }, [activeTab, foodItems]);

  const tabs = [
    {id: 'all', title: 'Tất cả'},
    {id: 'drink', title: 'Đồ uống'},
    {id: 'oyster', title: 'Hàu'},
    {id: 'shrimp', title: 'Tôm'}, 
    {id: 'appetizer', title: 'Khai vị'},
    {id: 'dessert', title: 'Tráng miệng'},
  ];
  const cartButtonRef = useRef(null);

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
        onPress={() => addToCart(item)}>
        <Icon name="plus-circle" color="#fff" size={30} />
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

  const renderAISuggestions = () => {
    if (aiSuggestions.length === 0) return null;

    return (
      <View style={styles.aiSuggestionsContainer}>
        <Text style={styles.aiSuggestionsTitle}>Gợi ý từ AI:</Text>
        <FlatList
          horizontal
          data={aiSuggestions}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={styles.aiSuggestionItem}
              onPress={() => {
                setSearchText(item.name);
                performAISearch(item.name);
              }}
            >
              <Image source={{uri: item.image}} style={styles.aiSuggestionImage} />
              <Text style={styles.aiSuggestionText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderRecommendations = () => {
    const recommendations = getRecommendations(cart);
    if (recommendations.length === 0) return null;

    return (
      <View style={styles.recommendationsContainer}>
        <Text style={styles.recommendationsTitle}>Các món được đề xuất:</Text>
        <FlatList
          horizontal
          data={recommendations}
          renderItem={({item}) => (
            <TouchableOpacity 
              style={styles.recommendationItem}
              onPress={() => addToCart(item)}
            >
              <Image source={{uri: item.image}} style={styles.recommendationImage} />
              <Text style={styles.recommendationText}>{item.name}</Text>
              <TouchableOpacity 
                style={styles.addRecommendationButton}
                onPress={() => addToCart(item)}
              >
                <Icon name="plus" color="#fff" size={16} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

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

  const CartModal = () => {
    return (
      <Modal
        animationType="none"
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
              style={styles.closeModalButton}
              onPress={() => setIsCartVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>ĐÓNG</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

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
          <View style={{flexDirection: 'row', marginVertical: 5}}>
            <BackButton />
            <Text style={styles.headerTitle}>Đặt món ăn</Text>
          </View>
          <FlatList
            ListHeaderComponent={
              <>
                <TextInput
                  style={styles.searchInput}
                  mode="outlined"
                  theme={{roundness: 20}}
                  placeholder="Tìm kiếm món ăn..."
                  value={searchText}
                  onChangeText={setSearchText}
                />
                {renderAISuggestions()}
                {cart.length > 0 && renderRecommendations()}
                <View
                  style={{
                    flexDirection: 'row',
                    marginStart: 10,
                    alignItems: 'center',
                  }}>
                  <Icon
                    name="filter"
                    size={20}
                    color="#000"
                    style={{marginEnd: 10}}
                  />
                  <Text style={styles.categoryTitle}>Danh mục:</Text>
                </View>
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
              </>
            }
            data={filteredItems}
            renderItem={renderFoodItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={styles.emptySearchText}>
                Không tìm thấy món ăn nào!
              </Text>
            }
            contentContainerStyle={styles.flatListContent}
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
              <Icon name="shopping-cart" color="#fff" size={28} />
              <Text style={styles.cartItemCount}>{cart.length}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {notification && (
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationText}>{notification}</Text>
          </View>
        )}
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
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    borderRadius: 25,
    padding: 18,
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
    // borderTopWidth: 1,
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
  emptyCartText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
    color: '#888',
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
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
  emptySearchText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 18,
    color: '#888',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff4d4f',
    padding: 10,
    alignItems: 'center',
  },
  notificationText: {
    color: '#fff',
    fontSize: 16,
  },
  aiSuggestionsContainer: {
    marginHorizontal: 10,
    marginTop: 10,
  },
  aiSuggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  aiSuggestionItem: {
    marginRight: 10,
    alignItems: 'center',
    width: 100,
  },
  aiSuggestionImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  aiSuggestionText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  recommendationsContainer: {
    marginHorizontal: 10,
    marginTop: 10,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recommendationItem: {
    marginRight: 10,
    width: 120,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  recommendationImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  recommendationText: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
  },
  addRecommendationButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderScreen;
