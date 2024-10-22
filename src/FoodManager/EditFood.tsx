import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const EditFood = ({route, navigation}: {route: any; navigation: any}) => {
  const {food} = route.params;
  console.log('foodItem:', food);
  return (
    <View>
      <Text>EditFood</Text>
    </View>
  );
};

export default EditFood;

const styles = StyleSheet.create({});
