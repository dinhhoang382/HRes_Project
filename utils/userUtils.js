//userUtils.js
import firestore from '@react-native-firebase/firestore';

//Lấy thông tin user
export const getUserDocument = async (uid) => {
  const userRef = firestore().collection('users').doc(uid);
  try {
    const user = await userRef.get();
    if (user.exists) {
      return user.data();
    } else {
      throw new Error('User không tồn tại!');
    }
  } catch (error) {
    console.log('Lỗi khi lấy thông tin user:', error);
    throw error;
  }
};
