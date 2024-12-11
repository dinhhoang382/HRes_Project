import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import BackButton from '../navigation/backButton';

// Define interfaces for the data structures
interface InvoiceItem {
  food_item_id: string;
  quantity: number;
  price: number;
  name?: string; // We'll fetch the name separately
}

const PaymentHistoryDetail = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const {invoiceId} = route.params;
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        // Fetch invoice details from payment_history
        const invoiceDoc = await firestore()
          .collection('payment_history')
          .doc(invoiceId)
          .get();

        const invoiceData = invoiceDoc.data();

        // Fetch food item details for each invoice item
        const itemsWithDetails = await Promise.all(
          invoiceData?.items.map(async (item: InvoiceItem) => {
            const foodItemDoc = await firestore()
              .collection('food_items')
              .doc(item.food_item_id)
              .get();

            return {
              ...item,
              name: foodItemDoc.data()?.name || 'Unnamed Item',
            };
          }) || [],
        );

        setInvoiceDetails(invoiceData);
        setInvoiceItems(itemsWithDetails);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [invoiceId]);

  const renderInvoiceItem = ({item}: {item: InvoiceItem}) => (
    <View style={styles.invoiceItemContainer}>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.itemDetailsContainer}>
        <Text style={styles.itemDetail}>Số lượng: {item.quantity}</Text>
        <Text style={styles.itemDetail}>
          Giá:{' '}
          {item.price.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })}
        </Text>
        <Text style={styles.itemTotal}>
          Thành tiền:{' '}
          {(item.quantity * item.price).toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })}
        </Text>
      </View>
    </View>
  );

  const ListHeader = () => (
    <>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.title}>Chi tiết hóa đơn</Text>
      </View>

      {invoiceDetails && (
        <View style={styles.invoiceInfoContainer}>
          <View style={styles.invoiceInfoRow}>
            <Text style={styles.invoiceInfoLabel}>Mã hóa đơn:</Text>
            <Text style={styles.invoiceInfoValue}>{invoiceId}</Text>
          </View>
          <View style={styles.invoiceInfoRow}>
            <Text style={styles.invoiceInfoLabel}>Bàn số:</Text>
            <Text style={styles.invoiceInfoValue}>
              {invoiceDetails.tableNumber}
            </Text>
          </View>
          <View style={styles.invoiceInfoRow}>
            <Text style={styles.invoiceInfoLabel}>Thời gian:</Text>
            <Text style={styles.invoiceInfoValue}>
              {new Date(invoiceDetails.paid_at.seconds * 1000).toLocaleString(
                'vi-VN',
              )}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Các món đã đặt</Text>
    </>
  );

  const ListFooter = () => (
    <>
      {invoiceDetails && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>
            {invoiceDetails.totalAmount.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
            })}
          </Text>
        </View>
      )}
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải chi tiết hóa đơn...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={invoiceItems}
      renderItem={renderInvoiceItem}
      keyExtractor={item => item.food_item_id}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      contentContainerStyle={styles.flatListContent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flatListContent: {
    paddingBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
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
  invoiceInfoContainer: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  invoiceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  invoiceInfoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  invoiceInfoValue: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  itemsList: {
    paddingHorizontal: 16,
  },
  invoiceItemContainer: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default PaymentHistoryDetail;
