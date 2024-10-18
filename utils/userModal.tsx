import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

interface userModalProps {
  isVisible: boolean;
  onClose: () => void;
  userData: {
    userId: string;
  };
  navigation: any;
}

const UserModal: React.FC<userModalProps> = ({
  isVisible,
  onClose,
  navigation,
  userData,
}) => {
  const navigationUser = () => {
    onClose();
    navigation.navigate('UserProfileScreen', {userId: userData});
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.smallModalView}>
          <TouchableOpacity style={styles.closeButton} onPress={navigationUser}>
            <Text style={styles.textStyle}>Thông tin tài khoản</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => {}}>
            <Text style={styles.textStyle}>Đăng xuất</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.textStyle}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UserModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  smallModalView: {
    width: '80%', // Smaller width
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20, // Margin from the bottom
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
