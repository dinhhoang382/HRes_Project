import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import QRCode from 'react-native-qrcode-svg';
import BackButton from '../navigation/backButton';

interface OrderItem {
  food_item_id: string;
  quantity: number;
  price: number;
  food_name: string;
}

const PaymentScreen = ({route, navigation}: {route: any; navigation: any}) => {
  const {invoiceId, table_id} = route.params;
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState('');
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const invoiceDoc = await firestore()
          .collection('invoices')
          .doc(invoiceId)
          .get();
        const invoiceData = invoiceDoc.data();

        if (invoiceData) {
          setTotalAmount(invoiceData.total_amount || 0);

          // Generate QR code data for payment
          const qrPaymentData = JSON.stringify({
            invoiceId: invoiceId,
            totalAmount: invoiceData.total_amount,
            tableNumber: invoiceData.table_number,
          });
          setQrData(qrPaymentData);

          const itemsSnapshot = await firestore()
            .collection('invoices')
            .doc(invoiceId)
            .collection('invoice_items')
            .get();

          const items: OrderItem[] = [];
          const foodItemPromises = itemsSnapshot.docs.map(async doc => {
            const itemData = doc.data();
            const foodItemDoc = await firestore()
              .collection('food_items')
              .doc(itemData.food_item_id)
              .get();
            const foodItemData = foodItemDoc.data();
            return {
              food_item_id: itemData.food_item_id,
              quantity: itemData.quantity,
              price: itemData.price,
              food_name: foodItemData?.name || 'Unknown Item',
            };
          });

          const resolvedItems = await Promise.all(foodItemPromises);
          setOrderItems(resolvedItems);
        }
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        Alert.alert('Error', 'Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

  const handlePayment = async () => {
    try {
      // Fetch invoice details
      const invoiceRef = firestore().collection('invoices').doc(invoiceId);
      const invoiceDoc = await invoiceRef.get();
      const invoiceData = invoiceDoc.data();
      const tableNumber = invoiceData?.table_number;

      // Fetch order items
      const itemsSnapshot = await invoiceRef.collection('invoice_items').get();
      const items = itemsSnapshot.docs.map(doc => doc.data());

      // Start a batch
      const batch = firestore().batch();

      // Save payment history
      const paymentHistoryRef = firestore().collection('payment_history').doc();
      batch.set(paymentHistoryRef, {
        invoiceId,
        tableNumber,
        totalAmount,
        paid_at: firestore.FieldValue.serverTimestamp(),
        user_id: invoiceData?.user_id || 'unknown',
        items,
      });

      // Update table status
      if (table_id) {
        const tableRef = firestore().collection('tables').doc(table_id);
        batch.update(tableRef, {
          status: 'available', // Set table status to available after payment
        });
      }

      // Reset invoice document
      batch.set(
        invoiceRef,
        {
          date: null,
          total_amount: 0,
          user_id: null,
          status: 'available',
          paid_at: null,
          table_number: tableNumber,
        },
        {merge: false},
      ); // This overwrites the entire document

      // Delete all items in the invoice_items subcollection
      const deleteOps = itemsSnapshot.docs.map(doc =>
        batch.delete(invoiceRef.collection('invoice_items').doc(doc.id)),
      );

      // Commit the batch
      await Promise.all([batch.commit(), ...deleteOps]);

      Alert.alert(
        'Thành công',
        'Thanh toán đã được xử lý thành công và hóa đơn đã được đặt lại',
      );
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Lỗi', 'Không thể xử lý thanh toán');
    }
  };

  const renderOrderItem = ({item}: {item: OrderItem}) => (
    <View style={styles.orderItem}>
      <Text style={styles.itemName}>{item.food_name}</Text>
      <Text style={styles.itemDetails}>
        Số lượng: {item.quantity} x{' '}
        {item.price.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        })}
      </Text>
      <Text style={styles.itemTotal}>
        {(item.quantity * item.price).toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        })}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row'}}>
        <BackButton />
        <Text style={styles.title}>Thanh toán</Text>
      </View>
      {/* QR Code Section
      <View style={styles.qrContainer}>
        <Text style={styles.sectionTitle}>Quét mã QR để thanh toán</Text>
        <View style={styles.qrCodeWrapper}>
          <QRCode
            value={qrData}
            size={250}
            color="black"
            backgroundColor="white"
          />
        </View>
        <Text style={styles.qrInstructions}>
          Vui lòng quét mã QR để thanh toán hoặc sử dụng ứng dụng ngân hàng
        </Text>
      </View> */}
      {/* QR Code Button */}
      <TouchableOpacity 
        style={styles.qrButton}
        onPress={() => setIsQRModalVisible(true)}
      >
        <Text style={styles.qrButtonText}>Mở mã QR</Text>
      </TouchableOpacity>
      {/* QR Code Modal */}
      <Modal
        visible={isQRModalVisible}
        onRequestClose={() => setIsQRModalVisible(false)}
        transparent={false}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.qrContainer}>
            <Text style={styles.sectionTitle}>Quét mã QR để thanh toán</Text>
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={qrData}
                size={250}
                color="black"
                backgroundColor="white"
              />
            </View>
            <Text style={styles.qrInstructions}>
              Vui lòng quét mã QR để thanh toán hoặc sử dụng ứng dụng ngân hàng
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsQRModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>


      {/* Order Items List */}
      <FlatList
        data={orderItems}
        renderItem={renderOrderItem}
        keyExtractor={item => item.food_item_id}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Danh sách món ăn</Text>
        }
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Tổng cộng:</Text>
        <Text style={styles.totalAmount}>
          {totalAmount.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })}
        </Text>
      </View>
      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>Xác nhận thanh toán</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  orderItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
  payButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 10,
  },
  qrCodeWrapper: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 16,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  modal: {
    margin: 0,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  qrButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
