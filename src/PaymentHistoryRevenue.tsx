import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import RevenueChart from '../src/RevenueChart'

// Define a type for the payment history data
type PaymentHistoryItem = {
  id: string;
  invoiceId: string;
  tableNumber: string;
  totalAmount: number;
  paid_at: any; // You might want to specify a more precise type here
  user_id: string;
  items: any[]; // Specify a more precise type if possible
};

const PaymentHistoryRevenue = ({route, navigation}:{route:any, navigation: any}) => {
  const [paymentHistoryData, setPaymentHistoryData] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const paymentHistorySnapshot = await firestore()
          .collection('payment_history')
          .orderBy('paid_at', 'desc')
          .get();
  
        const paymentHistoryList = paymentHistorySnapshot.docs.map(doc => {
          const data = doc.data();
  
          // Kiểm tra nếu dữ liệu hợp lệ và có đủ các trường cần thiết
          return {
            id: doc.id,
            invoiceId: data.invoiceId || '',
            tableNumber: data.tableNumber || '',
            totalAmount: data.totalAmount || 0, // Đảm bảo totalAmount tồn tại
            paid_at: data.paid_at || null,
            user_id: data.user_id || '',
            items: data.items || [],
          };
        });
  
        // Tính toán tổng doanh thu và số đơn hàng
        let revenue = 0;
        let orders = paymentHistoryList.length;
  
        paymentHistoryList.forEach(item => {
          revenue += item.totalAmount;
        });
  
        setTotalRevenue(revenue);
        setTotalOrders(orders);
        setPaymentHistoryData(paymentHistoryList);
      } catch (error) {
        console.error("Error fetching payment history: ", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPaymentHistory();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const renderPaymentHistoryItem = ({ item }: { item: PaymentHistoryItem }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.dateText}>Paid At: {new Date(item.paid_at.seconds * 1000).toLocaleString()}</Text>
      <Text>Invoice ID: {item.invoiceId}</Text>
      <Text>Table Number: {item.tableNumber}</Text>
      <Text>Total Amount: ${item.totalAmount}</Text>
      <Text>User ID: {item.user_id}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total Revenue: ${totalRevenue}</Text>
        <Text style={styles.summaryText}>Total Orders: {totalOrders}</Text>
      </View>
      <RevenueChart />
      <FlatList
        data={paymentHistoryData}
        keyExtractor={(item) => item.id}
        renderItem={renderPaymentHistoryItem}
        ListEmptyComponent={<Text>No Payment History Available</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dateText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default PaymentHistoryRevenue;
