import {
  addDoc,
  collection,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

const PreviousOrderScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const {orders, table_number, userId, invoiceId, table_id} =
    route.params || {};
  console.log('T, ID: ', table_number, userId, invoiceId, table_id);
  const [previousOrders, setPreviousOrders] = useState<CartItem[]>([]);
  useEffect(() => {
    if (route.params && route.params.orders && route.params.table_number) {
      setPreviousOrders(route.params.orders);
    } else {
      console.log(
        'PreviosOrder Effect - Thiếu dữ liệu orders hoặc table_number',
      );
    }
  }, [orders, table_number]);

  const updateQuantity = (id: string, quantity: number) => {
    setPreviousOrders(prevOrders =>
      prevOrders
        .map(order =>
          order.id === id
            ? {
                ...order,
                quantity: order.quantity + quantity,
              }
            : order,
        )
        .filter(order => order.quantity > 0),
    );
  };
  //caculate total price
  const totalAmount = previousOrders.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const renderOrderItem = ({item}: {item: CartItem}) => (
    <View style={styles.orderItemContainer}>
      <Image source={{uri: item.image}} style={styles.orderItemImage} />
      <View style={styles.orderItemInfo}>
        <Text style={styles.orderItemName}>{item.name}</Text>
        <Text style={styles.orderItemPrice}>
          {item.price.toLocaleString()} VND x {item.quantity}
        </Text>
        <Text style={styles.orderItemTotalPrice}>
          Tổng: {(item.price * item.quantity).toLocaleString()} VND
        </Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => updateQuantity(item.id, -1)}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => updateQuantity(item.id, 1)}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const handleAddMoreItems = async () => {
    try {
      if (invoiceId) {
        // Lấy dữ liệu hóa đơn hiện tại
        const invoiceRef = firestore().collection('invoices').doc(invoiceId);
        const invoiceDoc = await invoiceRef.get();
        if (!invoiceDoc.exists) {
          console.error('Hóa đơn không tồn tại!');
          return;
        }

        const invoiceData = invoiceDoc.data();
        let currentTotalAmount = invoiceData?.total_amount || 0;

        // Tính toán tổng số tiền mới cho các món mới được thêm
        const newTotalAmount = previousOrders.reduce(
          (sum, item) => sum + item.price * item.quantity,
          currentTotalAmount,
        );

        // Tạo batch để thêm món và cập nhật hóa đơn
        const batch = firestore().batch();

        previousOrders.forEach(item => {
          const invoiceItemRef = firestore()
            .collection('invoices')
            .doc(invoiceId)
            .collection('invoice_items')
            .doc(); // Tạo document mới cho từng món ăn
          batch.set(invoiceItemRef, {
            food_item_id: item.id,
            quantity: item.quantity,
            price: item.price,
          });
        });

        // Cập nhật lại tổng số tiền của hóa đơn
        batch.update(invoiceRef, {
          total_amount: newTotalAmount,
        });

        await batch.commit();

        console.log('Hóa đơn và các món đã được cập nhật thành công!');

        navigation.navigate('Home');
      } else {
        handleOrder();
      }
    } catch (error) {
      console.error('Lỗi khi thêm món và cập nhật hóa đơn: ', error);
    }
  };

  const handleOrder = async () => {
    // Logic đặt món mới
    console.log('Đặt món');
    // Lưu hóa đơn vào Firestore
    const orderData = {
      date: firestore.Timestamp.now(), // Thời gian lập hóa đơn
      total_amount: totalAmount,
      user_id: userId,
      table_number: table_number,
    };
    try {
      // Thêm vào collection `invoices`
      const invoiceRef = await firestore()
        .collection('invoices')
        .add(orderData);
      // Lưu các món vào subcollection `invoice_items` của hóa đơn
      const batch = firestore().batch();
      previousOrders.forEach(item => {
        console.log('Invoice Item:', item);
        const invoiceItemRef = firestore()
          .collection('invoices')
          .doc(invoiceRef.id)
          .collection('invoice_items')
          .doc(); // Tạo doc mới cho từng món ăn
        batch.set(invoiceItemRef, {
          food_item_id: item.id,
          quantity: item.quantity,
          price: item.price,
        });
      });

      // Update table status
      if (table_id) {
        const tableRef = firestore().collection('tables').doc(table_id);
        batch.update(tableRef, {
          status: 'ordered',
        });
      }

      // Thực hiện lưu các invoice_items
      await batch.commit();
      //check
      navigation.navigate('Home');

      console.log('Order saved with ID: ', invoiceRef.id);
    } catch (error) {
      console.error(
        'Previous Order - Handle Order - Error saving order:  ',
        error,
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách món đã đặt</Text>
      {previousOrders.length > 0 ? (
        <>
          <FlatList
            data={previousOrders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Tổng cộng:</Text>
            <Text style={styles.totalAmount}>
              {totalAmount.toLocaleString()} VND
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>Bạn chưa đặt món ăn nào!</Text>
      )}
      {previousOrders.length > 0 && (
        <TouchableOpacity
          style={styles.orderButton}
          onPress={handleAddMoreItems}>
          <Text style={styles.orderButtonText}>Thêm món</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderItemContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  orderItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  orderItemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  orderItemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderItemPrice: {
    fontSize: 16,
    color: '#666',
  },
  orderItemTotalPrice: {
    fontSize: 16,
    color: '#000',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
  },
  orderButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
  },
  orderButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default PreviousOrderScreen;
