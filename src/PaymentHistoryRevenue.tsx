import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Button,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import RevenueChart from '../src/RevenueChart';

// Define a type for the payment history data
type PaymentHistoryItem = {
  id: string;
  invoiceId: string;
  tableNumber: string;
  totalAmount: number;
  paid_at: any; // You might want to specify a more precise type here
  user_id: string;
  userName: string;
  items: any[]; // Specify a more precise type if possible
};

const PaymentHistoryRevenue = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const [paymentHistoryData, setPaymentHistoryData] = useState<
    PaymentHistoryItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      setLoading(true);
      try {
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

        const paymentHistorySnapshot = await firestore()
          .collection('payment_history')
          .where('paid_at', '>=', startOfDay)
          .where('paid_at', '<=', endOfDay)
          .orderBy('paid_at', 'desc')
          .get();

        const paymentHistoryList = await Promise.all(
          paymentHistorySnapshot.docs.map(async doc => {
            const data = doc.data();
            let userName = '';

            // Fetch user name from users collection
            if (data.user_id) {
              const userDoc = await firestore()
                .collection('users')
                .doc(data.user_id)
                .get();
              userName = userDoc.exists && userDoc.data() ? userDoc.data()!.name : 'Unknown User';
            }

            return {
              id: doc.id,
              invoiceId: data.invoiceId || '',
              tableNumber: data.tableNumber || '',
              totalAmount: data.totalAmount || 0,
              paid_at: data.paid_at || null,
              user_id: data.user_id || '',
              userName,
              items: data.items || [],
            };
          })
        );

        // Calculate total revenue and orders
        let revenue = 0;
        let orders = paymentHistoryList.length;

        paymentHistoryList.forEach(item => {
          revenue += item.totalAmount;
        });

        setTotalRevenue(revenue);
        setTotalOrders(orders);
        setPaymentHistoryData(paymentHistoryList);
      } catch (error) {
        console.error('Error fetching payment history: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [selectedDate]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const renderPaymentHistoryItem = ({item}: {item: PaymentHistoryItem}) => (
    <View style={styles.itemContainer}>
      <Text style={styles.dateText}>
        Thời gian đặt: {new Date(item.paid_at.seconds * 1000).toLocaleString()}
      </Text>
      <Text>Số bàn: {item.tableNumber}</Text>
      <Text>Tổng doanh thu: {item.totalAmount} VNĐ</Text>
      <Text>Người đặt: {item.userName}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Tổng doanh thu: {totalRevenue} VNĐ
        </Text>
        <Text style={styles.summaryText}>Tổng số đơn: {totalOrders}</Text>
      </View>
      
      <Button title="Chọn ngày" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      
      <View style={styles.chartContainer}>
        <RevenueChart />
      </View>
      
      <View style={styles.listContainer}>
        <FlatList
          data={paymentHistoryData}
          keyExtractor={item => item.id}
          renderItem={renderPaymentHistoryItem}
          ListEmptyComponent={<Text>Không có lịch sử doanh thu</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  summaryContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  chartContainer: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
  },
  dateText: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  listContainer: {
    flex: 1,
  },
});

export default PaymentHistoryRevenue;
