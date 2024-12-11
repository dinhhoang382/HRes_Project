import React, {useState} from 'react';
import {
  View,
  TextInput,
  Platform,
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {addEvent} from './CRUD/Create';
import BackButton from '../../navigation/backButton';
import {Button} from 'react-native-paper';

const AddEventScreen = ({navigation}: {navigation: any}) => {
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState(new Date());
  const [tables, setTables] = useState('');
  const [guests, setGuests] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleAdd = async () => {
    const newEvent = {
      event_name: eventName,
      date: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
      tables_reserved: parseInt(tables),
      total_guests: parseInt(guests),
    };
    await addEvent(newEvent);
    navigation.goBack();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <BackButton />
        <Text style={styles.title}>Thêm sự kiện</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Tên sự kiện"
        value={eventName}
        onChangeText={setEventName}
      />

      <Pressable onPress={() => setShowPicker(true)}>
        <View style={styles.datePickerButton}>
          <Text style={styles.dateText}>
            Ngày tổ chức: {formatDate(date)}
          </Text>
        </View>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Số bàn"
        value={tables}
        onChangeText={setTables}
      />
      <TextInput
        style={styles.input}
        placeholder="Số khách"
        value={guests}
        onChangeText={setGuests}
      />
      <Button mode="contained" style={styles.button} onPress={handleAdd}>
        Lưu
      </Button>
    </View>
  );
};

export default AddEventScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    width: 200,
    alignSelf: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    marginVertical: 10,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    width:250,
    marginVertical: 10,
    backgroundColor: '#ccc',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
});
