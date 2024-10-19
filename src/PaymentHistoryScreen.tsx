import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import BackButton from '../navigation/backButton';

interface PaymentHistoryItem {
  invoiceId: string;
  tableNumber: string | number;
  totalAmount: number;
  paid_at: any;
}

const PaymentHistoryScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const snapshot = await firestore()
          .collection('payment_history')
          .orderBy('paid_at', 'desc') // Order by payment date
          .get();

        const historyData: PaymentHistoryItem[] = snapshot.docs.map(doc => ({
          invoiceId: doc.id,
          tableNumber: doc.data().tableNumber,
          totalAmount: doc.data().totalAmount,
          paid_at: doc.data().paid_at,
        }));

        setPaymentHistory(historyData);
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  const renderPaymentItem = ({item}: {item: PaymentHistoryItem}) => (
    <View style={styles.historyItem}>
      <Text style={styles.invoiceText}>Hóa đơn ID: {item.invoiceId}</Text>
      <Text style={styles.detailsText}>Bàn số: {item.tableNumber}</Text>
      <Text style={styles.detailsText}>
        Tổng tiền:{' '}
        {item.totalAmount.toLocaleString('vi-VN', {
          style: 'currency',
          currency: 'VND',
        })}
      </Text>
      <Text style={styles.dateText}>
        Thời gian thanh toán:{' '}
        {new Date(item.paid_at.seconds * 1000).toLocaleString('vi-VN')}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải lịch sử thanh toán...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
       <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
        <BackButton />
        <Text style={styles.title}>Lịch sử thanh toán</Text>
      </View>
      <FlatList
        data={paymentHistory}
        renderItem={renderPaymentItem}
        keyExtractor={item => item.invoiceId}
      />
    </View>
  );
};

export default PaymentHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  invoiceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsText: {
    fontSize: 14,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#555',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
});
