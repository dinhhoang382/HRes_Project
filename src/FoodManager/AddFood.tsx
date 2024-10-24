import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';
import {Asset} from 'react-native-image-picker';
import {Picker} from '@react-native-picker/picker';

const AddFood = ({route, navigation}: {route: any; navigation: any}) => {
  const [foodData, setFoodData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image: '',
  });
  const [image, setImage] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<
    {id: string; [key: string]: any}[]
  >([]);
  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to upload images.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Storage permission granted');
        return true; // Return true if permission is granted
      } else {
        console.log('Storage permission denied');
        return false; // Return false if permission is denied
      }
    } catch (err) {
      console.warn(err);
      return false; // Return false in case of an error
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestStoragePermission();

    if (hasPermission) {
      const options: any = {
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
        title: 'Select an Image',
      };
      launchImageLibrary(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error Code: ', response.errorCode);
          console.log('ImagePicker Error Message: ', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          setImage(response.assets[0]);
        }
      });
    } else {
      Alert.alert('Cần cấp quyền truy cập thư viện ảnh để tiếp tục');
    }
  };
  const uploadImage = async () => {
    if (!image || !image.uri) return null;

    const {uri} = image;
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

    try {
      const reference = storage().ref(`foods/${filename}`);
      await reference.putFile(uploadUri);
      const url = await reference.getDownloadURL();
      return url;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  const handleSubmit = async () => {
    if (!foodData.name || !foodData.price || !foodData.category_id) {
      Alert.alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);

      // Upload ảnh và lấy URL
      const imageUrl = await uploadImage();

      // Tạo object data để lưu vào Firestore
      const data = {
        ...foodData,
        price: parseFloat(foodData.price),
        image: imageUrl || '',
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      // Thêm vào collection food_items
      await firestore().collection('food_items').add(data);

      // Reset form
      setFoodData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image: '',
      });
      setImage(null);

      Alert.alert('Thêm món ăn thành công!');
    } catch (error) {
      console.error('Error adding food item:', error);
      Alert.alert('Có lỗi xảy ra khi thêm món ăn!');
    } finally {
      setLoading(false);
    }
  };
  const handlePriceChange = (text: string) => {
    // Chỉ cho phép nhập số
    const numberOnly = text.replace(/[^0-9]/g, '');
    setFoodData({...foodData, price: numberOnly});
  };
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await firestore().collection('categories').get();
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData); // categories là state quản lý danh sách danh mục
    };

    fetchCategories();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thêm Món Ăn Mới</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Tên món ăn *</Text>
        <TextInput
          style={styles.input}
          value={foodData.name}
          onChangeText={text => setFoodData({...foodData, name: text})}
          placeholder="Nhập tên món ăn"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={foodData.description}
          onChangeText={text => setFoodData({...foodData, description: text})}
          placeholder="Nhập mô tả món ăn"
          multiline
          numberOfLines={4}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Giá *</Text>
        <TextInput
          style={styles.input}
          value={foodData.price}
          onChangeText={handlePriceChange}
          placeholder="Nhập giá món ăn"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Danh mục *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={foodData.category_id}
            onValueChange={itemValue =>
              setFoodData({...foodData, category_id: itemValue})
            }
            style={styles.picker}>
            <Picker.Item label="Chọn danh mục" value="" enabled={false} />
            {categories.map(category => (
              <Picker.Item
                key={category.id}
                label={category.name}
                value={category.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Hình ảnh</Text>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={pickImage}
          activeOpacity={0.7}>
          <Text style={styles.imageButtonText}>Chọn ảnh</Text>
        </TouchableOpacity>
        {image && (
          <Image
            source={{uri: image.uri}}
            style={styles.previewImage}
            resizeMode="cover"
          />
        )}
      </View>
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.7}>
        <Text style={styles.submitButtonText}>
          {loading ? 'Đang xử lý...' : 'Thêm món ăn'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddFood;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  imageButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imageButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
