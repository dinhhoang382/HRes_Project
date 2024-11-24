import {Route} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import BackButton from '../navigation/backButton';

interface OrderItem {
  food_item_id: string;
  quantity: number;
  price: number;
  food_name: string;
  image: string;
}
const TableDetail = ({route, navigation}: {route: any; navigation: any}) => {
  const {table, userId} = route.params; // Lấy thông tin bàn từ params
  // console.log('Table', table);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]); //danh sach mon an da dat
  const [invoiceDate, setInvoiceDate] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [username, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        // Kiểm tra nếu 'table_number' hợp lệ trước khi thực hiện truy vấn
        if (table?.table_number) {
          // Truy vấn hóa đơn từ collection 'invoices' dựa trên 'table_number'
          const invoiceSnapshot = await firestore()
            .collection('invoices')
            .where('table_number', '==', table.table_number) // Lấy hóa đơn theo table_number
            .get();

          if (!invoiceSnapshot.empty) {
            const invoiceDoc = invoiceSnapshot.docs[0]; // Lấy hóa đơn đầu tiên (nếu có nhiều, cần xử lý khác)
            const invoiceId = invoiceDoc.id;
            const invoiceData = invoiceDoc.data();

            //set id
            setInvoiceId(invoiceId);

            //lay ngay lap hoa don
            setInvoiceDate(invoiceData.date.toDate().toLocaleString());
            // Lấy thông tin người dùng lập hóa đơn (user_id từ invoice)
            const userDoc = await firestore()
              .collection('users')
              .doc(invoiceData.user_id)
              .get();
            const userData = userDoc.data();
            const userName = userData?.name || '';

            // Lấy các món ăn từ subcollection 'invoice_items' của hóa đơn đó
            const orderItemsSnapshot = await firestore()
              .collection('invoices')
              .doc(invoiceId)
              .collection('invoice_items')
              .get();

            const orderItemsList: OrderItem[] = [];

            // Lặp qua các món ăn trong subcollection 'invoice_items'
            for (const item of orderItemsSnapshot.docs) {
              const itemData = item.data();

              // Lấy thông tin món ăn từ collection 'food_items'
              const foodItemSnapshot = await firestore()
                .collection('food_items')
                .doc(itemData.food_item_id)
                .get();

              const foodData = foodItemSnapshot.data();

              // Thêm món ăn vào danh sách
              orderItemsList.push({
                food_item_id: itemData.food_item_id,
                quantity: itemData.quantity,
                price: itemData.price,
                food_name: foodItemSnapshot.data()?.name || 'Không tên!',
                image: foodData?.image || '',
              });
            }

            // Cập nhật danh sách món ăn vào state
            setOrderItems(orderItemsList);

            setUser(userName);
          } else {
            console.log('Không tìm thấy hóa đơn cho bàn này');
          }
        } else {
          console.log('Bàn này không có số bàn hợp lệ');
        }
      } catch (error) {
        console.error(
          'Lỗi khi lấy thông tin hóa đơn hoặc món ăn: TableDetail.tsx',
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems(); // Gọi hàm lấy thông tin món ăn
  }, [table?.table_number]); // Gọi lại khi 'table_number' thay đổi

  //Hàm render món ăn
  const renderOrderItem = useCallback((item: OrderItem) => {
    return (
      <View style={styles.orderItem}>
        <View style={styles.orderItemContent}>
          <View style={styles.orderItemTextContainer}>
            <Text style={styles.orderItemText}>Tên món: {item.food_name}</Text>
            <Text style={styles.orderItemText}>Số lượng: {item.quantity}</Text>
          </View>
          {item.image ? (
            <Image source={{uri: item.image}} style={styles.orderItemImage} />
          ) : (
            <Text>Hình ảnh không khả dụng</Text>
          )}
        </View>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
        <BackButton />
        <Text style={styles.title}>Chi tiết Bàn số {table.table_number}</Text>
      </View>
      <Text style={styles.detail}>Số ghế: {table.seats}</Text>
      <Text style={styles.detail}>
        Trạng thái: {table.status === 'available' ? 'Có sẵn' : 'Đã đặt'}
      </Text>
      <Text style={styles.detail}>Người đặt: {username}</Text>
      <Text style={styles.detail}>Ngày lập hóa đơn: {invoiceDate}</Text>

      {/* Hiển thị danh sách các món ăn đã đặt */}
      <Text style={styles.orderItemsTitle}>Món ăn đã đặt:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : orderItems.length > 0 ? (
        <FlatList
          data={orderItems}
          keyExtractor={(item, index) => `${item.food_item_id}-${index}`}
          renderItem={({item}) => renderOrderItem(item)}
        />
      ) : (
        <Text style={[styles.orderItemsTitle, {alignSelf: 'center'}]}>
          Chưa có món ăn nào được đặt cho bàn này.
        </Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: 'blue'}]}
          onPress={() =>
            navigation.navigate('OrderScreen', {
              table_number: table.table_number,
              table_id: table.id,
              userId: userId,
              invoiceId: invoiceId,
            })
          }>
          <Text style={styles.buttonText}>
            {orderItems.length > 0 ? 'Thêm món' : 'Đặt món'}{' '}
            {/* Điều kiện kiểm tra */}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: 'green'}]}
          onPress={() => {
            if (orderItems.length === 0) {
              Alert.alert(
                'Thông báo',
                'Chưa có món ăn nào được đặt cho bàn này.',
              );
            } else {
              navigation.navigate('PaymentScreen', {
                invoiceId: invoiceId,
                table_id: table.id,
              });
            }
          }}
          // disabled={orderItems.length === 0}
        >
          <Text style={styles.buttonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
  },
  orderItemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  orderItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderItemTextContainer: {
    flex: 1,
  },
  orderItem: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  orderItemText: {
    fontSize: 16,
  },
  orderItemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TableDetail;
