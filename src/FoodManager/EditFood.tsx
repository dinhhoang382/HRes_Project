import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';
import {Asset} from 'react-native-image-picker';
import {Picker} from '@react-native-picker/picker';
import BackButton from '../../navigation/backButton';

const EditFood = ({route, navigation}: {route: any; navigation: any}) => {
  const {food} = route.params; // Get the food item to edit
  const [foodData, setFoodData] = useState({
    name: food.name,
    description: food.description,
    price: food.price.toString(),
    category_id: food.category_id,
    image: food.image,
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

      // Upload image and get URL if a new image is selected
      const imageUrl = image ? await uploadImage() : foodData.image;

      // Create data object to update in Firestore
      const data = {
        ...foodData,
        price: parseFloat(foodData.price),
        image: imageUrl || '',
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // Update the food item in Firestore
      await firestore().collection('food_items').doc(food.id).update(data);
      Alert.alert('Thành công', 'Cập nhật món ăn thành công', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('ManageFoodScreen');
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating food item:', error);
      Alert.alert('Có lỗi xảy ra khi cập nhật món ăn!');
    } finally {
      setLoading(false);
    }
  };
  const handlePriceChange = (text: string) => {
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
      <View style={{flexDirection: 'row'}}>
        <BackButton />
        <Text style={styles.title}>Chỉnh Sửa Món Ăn</Text>
      </View>
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
          <Text style={styles.imageButtonText}>Thay đổi ảnh</Text>
        </TouchableOpacity>
        {image ? (
          <Image
            source={{uri: image.uri}}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          // Display the existing image if no new image is selected
          <Image
            source={{uri: foodData.image}}
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
          {loading ? 'Đang xử lý...' : 'Cập nhật món ăn'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditFood;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    // backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
    height: 150,
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
    width: '50%',
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
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
    borderRadius: 20,
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
