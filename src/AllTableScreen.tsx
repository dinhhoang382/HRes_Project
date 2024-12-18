import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import BackButton from '../navigation/backButton';

interface Table {
  id: string;
  seats: number;
  reservation_id: string;
  table_number: number;
  status: 'available' | 'ordered';
}

const AllTables = ({navigation}: {navigation: any}) => {
  const [tableData, setTableData] = useState<Table[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'available' | 'ordered'
  >('all');

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tables')
      .onSnapshot(
        snapshot => {
          const tableList: Table[] = [];
          snapshot.forEach(doc => {
            tableList.push({
              ...(doc.data() as Table),
              id: doc.id,
            });
          });
          tableList.sort((a, b) => a.table_number - b.table_number);
          setTableData(tableList);
          setFilteredTableData(tableList);
          setIsLoading(false);
        },
        error => {
          console.log('Error fetching tables: ', error);
          setIsLoading(false);
        },
      );

    return () => unsubscribe();
  }, []);

  // Filter and search effect
  useEffect(() => {
    let result = tableData;

    // Apply search query
    if (searchQuery) {
      result = result.filter(table =>
        table.table_number.toString().includes(searchQuery),
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(table => table.status === statusFilter);
    }

    setFilteredTableData(result);
  }, [searchQuery, statusFilter, tableData]);

  const renderTable = ({item}: {item: Table}) => (
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
      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => navigation.navigate('TableDetail', {table: item})}>
        <Text style={styles.detailButtonText}>Chi tiết</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', padding: 10}}>
        <BackButton />
        <Text style={{fontSize: 20, fontWeight: 'bold', marginLeft: 10}}>
          Xem tất cả
        </Text>
      </View>
      {/* Search and Filter Container */}
      <View style={styles.searchFilterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm số bàn..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardType="numeric"
        />
        <View style={styles.filterButtonContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'all' && styles.activeFilterButton,
            ]}
            onPress={() => setStatusFilter('all')}>
            <Text style={styles.filterButtonText}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'available' && styles.activeFilterButton,
            ]}
            onPress={() => setStatusFilter('available')}>
            <Text style={styles.filterButtonText}>Trống</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'ordered' && styles.activeFilterButton,
            ]}
            onPress={() => setStatusFilter('ordered')}>
            <Text style={styles.filterButtonText}>Đã đặt</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={filteredTableData}
        keyExtractor={item => item.id}
        renderItem={renderTable}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>Không tìm thấy bàn</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  detailButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
  },
  detailButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  filterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 18,
    color: '#888',
  },
});

export default AllTables;
