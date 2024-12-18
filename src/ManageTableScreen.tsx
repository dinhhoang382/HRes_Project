import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import BackButton from '../navigation/backButton';

// Define interface for table
interface Table {
  id?: string;
  table_number: string;
  seats: number;
  status: 'available' | 'ordered';
}

const ManageTableScreen = ({navigation}: {navigation: any}) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTable, setCurrentTable] = useState<Table | null>(null);

  // Fetch tables from Firestore
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const snapshot = await firestore().collection('tables').get();
        const fetchedTables = snapshot.docs.map(
          doc =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Table),
        );

        // Sort tables by table_number
        fetchedTables.sort(
          (a, b) => parseInt(a.table_number) - parseInt(b.table_number),
        );

        setTables(fetchedTables);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    fetchTables();
  }, []);

  // Open modal to add/edit table
  const openModal = (table?: Table) => {
    setCurrentTable(
      table || {
        table_number: '',
        seats: 0,
        status: 'available',
      },
    );
    setModalVisible(true);
  };

  // Save table (add or update)
  const saveTable = async () => {
    if (!currentTable) return;

    // Check for duplicate table number
    const isDuplicate = tables.some(
      (table) => table.table_number === currentTable.table_number && table.id !== currentTable.id
    );

    if (isDuplicate) {
      Alert.alert('Lỗi', 'Số bàn đã tồn tại. Vui lòng chọn số bàn khác.');
      return;
    }

    try {
      if (currentTable.id) {
        // Update existing table
        await firestore().collection('tables').doc(currentTable.id).update({
          table_number: currentTable.table_number,
          seats: currentTable.seats,
          status: currentTable.status,
        });
      } else {
        // Add new table
        await firestore().collection('tables').add({
          table_number: currentTable.table_number,
          seats: currentTable.seats,
          status: 'available',
        });
      }

      // Refresh tables list
      const snapshot = await firestore().collection('tables').get();
      const fetchedTables = snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Table),
      );
      setTables(fetchedTables);

      setModalVisible(false);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu bàn. Vui lòng thử lại.');
    }
  };

  // Delete table
  const deleteTable = async (tableId: string) => {
    try {
      await firestore().collection('tables').doc(tableId).delete();

      // Refresh tables list
      const snapshot = await firestore().collection('tables').get();
      const fetchedTables = snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Table),
      );
      setTables(fetchedTables);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa bàn. Vui lòng thử lại.');
    }
  };

  // Render table item
  const renderTableItem = ({item}: {item: Table}) => (
    <View style={styles.tableItemContainer}>
      <View style={styles.tableInfoContainer}>
        <Text style={styles.tableNumberText}>Bàn {item.table_number}</Text>
        <Text style={styles.tableSeatsText}>Số ghế: {item.seats}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === 'available' ? '#4CAF50' : '#FF5722',
            },
          ]}>
          <Text style={styles.statusText}>
            {item.status === 'available' ? 'Trống' : 'Đã đặt'}
          </Text>
        </View>
      </View>
      <View style={styles.tableActionContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openModal(item)}>
          <Icon name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Xác nhận xóa',
              `Bạn có chắc muốn xóa bàn ${item.table_number}?`,
              [
                {text: 'Hủy', style: 'cancel'},
                {
                  text: 'Xóa',
                  style: 'destructive',
                  onPress: () => deleteTable(item.id!),
                },
              ],
            );
          }}>
          <Icon name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render add/edit modal
  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {currentTable?.id ? 'Sửa bàn' : 'Thêm bàn mới'}
          </Text>

          <Text style={styles.inputLabel}>Số bàn</Text>
          <TextInput
            style={styles.input}
            placeholder="Số bàn"
            value={currentTable?.table_number}
            onChangeText={text =>
              setCurrentTable(prev => ({...prev!, table_number: text}))
            }
            keyboardType="numeric"
            editable={!currentTable?.id}
          />

          <Text style={styles.inputLabel}>Số ghế</Text>
          <TextInput
            style={styles.input}
            placeholder="Số ghế"
            value={currentTable?.seats ? currentTable.seats.toString() : ''}
            onChangeText={text =>
              setCurrentTable(prev => ({
                ...prev!,
                seats: text ? parseInt(text) : 0,
              }))
            }
            keyboardType="numeric"
          />

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={saveTable}>
              <Text style={styles.modalSaveButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerTitle}>Quản lý bàn</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tables}
        renderItem={renderTableItem}
        keyExtractor={item => item.id!}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>Chưa có bàn nào được thêm</Text>
        }
        contentContainerStyle={styles.listContentContainer}
      />

      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
    flex: 1,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContentContainer: {
    padding: 16,
  },
  tableItemContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableInfoContainer: {
    flex: 1,
  },
  tableNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tableSeatsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableActionContainer: {
    flexDirection: 'column',
  },
  editButton: {
    marginBottom: 10,
  },
  deleteButton: {},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  modalSaveButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  inputLabel: {
    fontSize: 16,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default ManageTableScreen;
