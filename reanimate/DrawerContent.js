import React from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {
  Avatar,
  Title,
  Caption,
  Drawer,
  Text,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';

export function DrawerContent(props) {
  const {UserData} = props;
  const isAdmin = UserData?.role === 'admin';

  return (
    <View style={styles.drawerContent}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          {/* User Info Section */}
          <View style={styles.userInfoSection}>
            <View style={styles.userRow}>
              <Avatar.Image
                source={
                  UserData?.url
                    ? {uri: UserData.url}
                    : require('../image/logo/icon_login.png')
                }
                size={60}
              />
              <View style={styles.userText}>
                <Title style={styles.title}>
                  {UserData?.name || 'Người dùng'}
                </Title>
                <Caption style={styles.caption}>
                  {UserData?.email || 'email@example.com'}
                </Caption>
              </View>
            </View>
          </View>

          {/* Main Navigation Section */}
          <Drawer.Section style={styles.drawerSection}>
            <Text style={styles.sectionTitle}>Chung</Text>
            <DrawerItem
              icon={({color, size}) => (
                <Icon name="home-outline" color={color} size={size} />
              )}
              label="Trang chủ"
              onPress={() => props.navigation.navigate('Home')}
            />

            <DrawerItem
              icon={({color, size}) => (
                <Icon name="account-outline" color={color} size={size} />
              )}
              label="Tài khoản"
              onPress={() => props.navigation.navigate('UserProfileScreen')}
            />
          </Drawer.Section>

          <Divider style={styles.divider} />

          {/* Management Section */}
          {isAdmin && (
            <Drawer.Section style={styles.drawerSection}>
              <Text style={styles.sectionTitle}>Quản lý</Text>
              <DrawerItem
                icon={({color, size}) => (
                  <Icon name="credit-card-outline" color={color} size={size} />
                )}
                label="Quản lý Thanh toán"
                onPress={() => props.navigation.navigate('PaymentHistoryScreen')}
              />

              <DrawerItem
                icon={({color, size}) => (
                  <Icon name="account-group-outline" color={color} size={size} />
                )}
                label="Quản lý nhân viên"
                onPress={() => props.navigation.navigate('ManageEmployeeScreen')}
              />

              <DrawerItem
                icon={({color, size}) => (
                  <Icon name="food-outline" color={color} size={size} />
                )}
                label="Quản lý thực đơn"
                onPress={() => props.navigation.navigate('ManageFoodScreen')}
              />

              <DrawerItem
                icon={({color, size}) => (
                  <Icon name="chart-bar" color={color} size={size} />
                )}
                label="Quản lý doanh thu"
                onPress={() => props.navigation.navigate('PaymentHistoryRevenue')}
              />
              <DrawerItem
                icon={({color, size}) => (
                  <Icon name="table" color={color} size={size} />
                )}
                label="Quản lý bàn đặt"
                onPress={() => props.navigation.navigate('ManageTableScreen')}
              />

            </Drawer.Section>
          )}

          <Divider style={styles.divider} />

          {/* Settings Section */}
          <Drawer.Section style={styles.drawerSection}>
            <Text style={styles.sectionTitle}>Cài đặt</Text>
            <DrawerItem
              icon={({color, size}) => (
                <Icon name="cog-outline" color={color} size={size} />
              )}
              label="Cài đặt"
              onPress={() => props.navigation.navigate('Setting')}
            />
          </Drawer.Section>
          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              icon={({color, size}) => (
                <Icon name="logout" color={'red'} size={size} />
              )}
              label="Đăng xuất"
              labelStyle={{color: 'red'}}
              onPress={() => {
                Alert.alert(
                  'Xác nhận đăng xuất',
                  'Bạn có chắc chắn muốn đăng xuất?',
                  [
                    {
                      text: 'Hủy', // Nút hủy bỏ
                      onPress: () => console.log('Đăng xuất đã bị hủy'),
                      style: 'cancel',
                    },
                    {
                      text: 'Đăng xuất',
                      onPress: () => {
                        auth()
                          .signOut()
                          .then(() => {
                            Alert.alert('Đăng xuất thành công');
                            props.navigation.navigate('Login');
                          })
                          .catch(error => {
                            console.error('Error logging out: ', error);
                          });
                      },
                      style: 'destructive',
                    },
                  ],
                  {cancelable: true},
                );
              }}
            />
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    marginLeft: 15,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  drawerSection: {
    marginTop: 10,
  },
  sectionTitle: {
    marginLeft: 16,
    marginBottom: 8,
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f4f4f4',
    marginVertical: 8,
  },
});
