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
  Modal,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import BackButton from '../navigation/backButton';
import {Menu, Provider} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';

interface OrderItem {
  food_item_id: string;
  quantity: number;
  price: number;
  food_name: string;
  image: string;
}

interface Table {
  id: string;
  table_number: number;
  seats: number;
  status: string;
  user_id: string | null;
}

const TableDetail = ({route, navigation}: {route: any; navigation: any}) => {
  const {table, userId} = route.params; // Lấy thông tin bàn từ params
  // console.log('Table', table);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]); //danh sach mon an da dat
  const [invoiceDate, setInvoiceDate] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [username, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [transferModalVisible, setTransferModalVisible] = useState(false);

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
            const invoiceDoc = invoiceSnapshot.docs[0];
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

  const cancelTable = async () => {
    try {
      Alert.alert(
        'Hủy bàn',
        'Bạn có chắc chắn muốn hủy bàn này? Tất cả thông tin đặt bàn sẽ bị xóa.',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Xác nhận',
            onPress: async () => {
              if (invoiceId) {
                // Delete the invoice and its subcollection
                await firestore()
                  .collection('invoices')
                  .doc(invoiceId)
                  .collection('invoice_items')
                  .get()
                  .then(snapshot => {
                    snapshot.docs.forEach(doc => {
                      doc.ref.delete();
                    });
                  });

                // Delete the main invoice document
                await firestore()
                  .collection('invoices')
                  .doc(invoiceId)
                  .delete();
              }

              // Reset table status
              await firestore().collection('tables').doc(table.id).update({
                status: 'available',
                user_id: null,
              });

              // Clear local state
              setOrderItems([]);
              setInvoiceId(null);
              setInvoiceDate(null);
              setUser(null);

              // Navigate back or show success message
              Alert.alert('Thông báo', 'Đã hủy bàn thành công');
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      console.error('Lỗi khi hủy bàn:', error);
      Alert.alert('Lỗi', 'Không thể hủy bàn. Vui lòng thử lại.');
    }
  };
  // New function to clear all ordered items
  const clearOrderedItems = async () => {
    try {
      // Confirm clearing items
      Alert.alert(
        'Xóa tất cả món ăn',
        'Bạn có chắc chắn muốn xóa tất cả các món ăn đã đặt?',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Xác nhận',
            onPress: async () => {
              if (invoiceId) {
                // Delete all invoice items
                const itemsSnapshot = await firestore()
                  .collection('invoices')
                  .doc(invoiceId)
                  .collection('invoice_items')
                  .get();

                // Batch delete to optimize performance
                const batch = firestore().batch();
                itemsSnapshot.docs.forEach(doc => {
                  batch.delete(doc.ref);
                });

                await batch.commit();

                // Update invoice total amount to 0
                await firestore().collection('invoices').doc(invoiceId).update({
                  total_amount: 0,
                });

                // Clear local state
                setOrderItems([]);

                Alert.alert('Thông báo', 'Đã xóa tất cả các món ăn');
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Lỗi khi xóa các món ăn:', error);
      Alert.alert('Lỗi', 'Không thể xóa các món ăn. Vui lòng thử lại.');
    }
  };
  // Add this useEffect to fetch available tables
  useEffect(() => {
    const fetchAvailableTables = async () => {
      try {
        const tablesSnapshot = await firestore()
          .collection('tables')
          .where('status', '==', 'available')
          .get();

        const tables = tablesSnapshot.docs.map(
          doc =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Table),
        );

        // Sort tables by table_number numerically
        const sortedTables = tables.sort((a: Table, b: Table) => {
          return Number(a.table_number) - Number(b.table_number);
        });

        setAvailableTables(sortedTables);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bàn trống:', error);
      }
    };

    fetchAvailableTables();
  }, []);
  // Add transfer table function
  const transferTable = async () => {
    if (!selectedTable) {
      Alert.alert('Lỗi', 'Vui lòng chọn bàn để chuyển đến');
      return;
    }

    try {
      // Fetch the current invoice details
      if (invoiceId) {
        const currentInvoiceRef = firestore().collection('invoices').doc(invoiceId);
        const currentInvoiceSnapshot = await currentInvoiceRef.get();
        const currentInvoiceData = currentInvoiceSnapshot.data();

        // Fetch all invoice items from the current invoice
        const currentInvoiceItemsSnapshot = await currentInvoiceRef
          .collection('invoice_items')
          .get();

        // Prepare batch write for efficiency
        const batch = firestore().batch();

        // Create a new invoice for the new table
        const newInvoiceRef = firestore().collection('invoices').doc();

        // Ensure we have invoice data before creating a new one
        if (currentInvoiceData) {
          // Get the selected table data
          const selectedTableDoc = await firestore()
            .collection('tables')
            .doc(selectedTable)
            .get();
          const selectedTableData = selectedTableDoc.data();

          // Create new invoice with updated table number
          const newInvoiceData = {
            ...currentInvoiceData,
            table_number: selectedTableData?.table_number,
            date: firestore.Timestamp.now(),
            user_id: userId,
          };

          batch.set(newInvoiceRef, newInvoiceData);

          // Copy invoice items to the new invoice
          const promises = currentInvoiceItemsSnapshot.docs.map(doc => {
            const newInvoiceItemRef = newInvoiceRef.collection('invoice_items').doc();
            return batch.set(newInvoiceItemRef, doc.data());
          });

          // Update tables status
          const oldTableRef = firestore().collection('tables').doc(table.id);
          const newTableRef = firestore().collection('tables').doc(selectedTable);

          batch.update(oldTableRef, {
            status: 'available',
            user_id: null,
          });

          batch.update(newTableRef, {
            status: 'ordered',
            user_id: userId,
          });

          // Delete the old invoice
          batch.delete(currentInvoiceRef);

          // Commit all changes
          await Promise.all(promises);
          await batch.commit();

          Alert.alert(
            'Thành công',
            `Đã chuyển sang bàn ${selectedTableData?.table_number}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to the new table's detail screen
                  navigation.replace('TableDetail', {
                    table: {
                      ...selectedTableData,
                      id: selectedTable,
                    },
                    userId: userId,
                  });
                },
              },
            ],
          );
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy thông tin hóa đơn');
        }
      } else {
        Alert.alert('Lỗi', 'Không có hóa đơn để chuyển');
      }
    } catch (error) {
      console.error('Lỗi khi chuyển bàn:', error);
      Alert.alert('Lỗi', 'Không thể chuyển bàn. Vui lòng thử lại.');
    }
  };

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
    <Provider>
      <View style={styles.container}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <BackButton />
          <Text style={styles.title}>Chi tiết Bàn số {table.table_number}</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setMenuVisible(true)}>
                <Text style={styles.menuButtonText}>⋮</Text>
              </TouchableOpacity>
            }>
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                setTransferModalVisible(true);
              }}
              title="Chuyển bàn"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                cancelTable();
              }}
              title="Hủy bàn"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                clearOrderedItems();
              }}
              title="Xóa tất cả món"
              disabled={orderItems.length === 0}
            />
          </Menu>
          {/* Add Modal for table transfer */}
          <Modal
            visible={transferModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setTransferModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn bàn để chuyển đến:</Text>
                <Picker
                  selectedValue={selectedTable}
                  onValueChange={itemValue => setSelectedTable(itemValue)}
                  style={styles.picker}>
                  <Picker.Item label="Chọn bàn" value="" />
                  {availableTables.map(table => (
                    <Picker.Item
                      key={table.id}
                      label={`Bàn ${table.table_number}`}
                      value={table.id}
                    />
                  ))}
                </Picker>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setTransferModalVisible(false)}>
                    <Text style={styles.buttonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={transferTable}>
                    <Text style={styles.buttonText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
    </Provider>
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
  menuButton: {
    alignSelf: 'center',
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginEnd: 10,
    alignSelf: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  picker: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
  confirmButton: {
    backgroundColor: 'blue',
  },
});

export default TableDetail;
