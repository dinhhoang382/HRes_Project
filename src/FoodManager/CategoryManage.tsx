import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Colors from '../../color/colors';

const CategoryManagement = () => {
  const [categories, setCategories] = useState<
    {id: string; name: string; value: string}[]
  >([]); 
  const [newCategory, setNewCategory] = useState({name: '', value: ''}); // Danh mục mới
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    value: string,
  } | null>(null); 

  // Lấy danh sách các danh mục từ Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await firestore().collection('categories').get();
      const categoriesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'No Name',
          value: data.value || 'No Value',
        };
      });
      setCategories(categoriesData);
    };
    fetchCategories();
  }, []);

  // Thêm hoặc chỉnh sửa danh mục
  const handleSaveCategory = async () => {
    if (!newCategory.name || !newCategory.value) {
      Alert.alert('Vui lòng nhập tên danh mục');
      return;
    }

    try {
      if (editingCategory) {
        // Chỉnh sửa danh mục
        await firestore()
          .collection('categories')
          .doc(editingCategory.id)
          .update({
            name: newCategory.name,
            value: newCategory.value,
          });
        Alert.alert('Chỉnh sửa danh mục thành công');
      } else {
        // Thêm danh mục mới
        await firestore().collection('categories').add({
          name: newCategory.name,
          value: newCategory.value,
        });
        Alert.alert('Thêm danh mục thành công');
      }

      // Reset form và làm mới danh sách danh mục
      setNewCategory({name: '', value: ''});
      setEditingCategory(null);
      const snapshot = await firestore().collection('categories').get();
      setCategories(
        snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'No Name',
          value: doc.data().value || 'No Value',
        })),
      );
    } catch (error) {
      Alert.alert('Có lỗi xảy ra, vui lòng thử lại sau');
    }
  };

  // Xóa danh mục
  const handleDeleteCategory = async (id: string) => {
    try {
      await firestore().collection('categories').doc(id).delete();
      Alert.alert('Xóa danh mục thành công');
      setCategories(categories.filter(category => category.id !== id));
    } catch (error) {
      Alert.alert('Có lỗi xảy ra khi xóa danh mục');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý danh mục món ăn</Text>

      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.listItem}>
            <Text style={styles.categoryText}>
              {item.name} ({item.value})
            </Text>
            <TouchableOpacity
              style={[styles.editButton,{width: 80,alignItems: 'center'}]}
              onPress={() => {
                setNewCategory({name: item.name, value: item.value});
                setEditingCategory(item);
              }}>
              <Text style={styles.buttonText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton,{width: 65, alignItems: 'center'}]}
              onPress={() => handleDeleteCategory(item.id)}>
              <Text style={styles.buttonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TextInput
        style={styles.input}
        value={newCategory.name}
        onChangeText={text => setNewCategory({...newCategory, name: text})}
        placeholder="Nhập tên danh mục (label)"
      />
      <TextInput
        style={styles.input}
        value={newCategory.value}
        onChangeText={text => setNewCategory({...newCategory, value: text})}
        placeholder="Nhập giá trị danh mục (value)"
      />
      <TouchableOpacity style={styles.addButton} onPress={handleSaveCategory}>
        <Text style={styles.buttonText}>
          {editingCategory ? 'Lưu thay đổi' : 'Thêm danh mục'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CategoryManagement;
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
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  categoryText: {
    fontSize: 18,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: Colors.AQUA_GREEN,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
});
