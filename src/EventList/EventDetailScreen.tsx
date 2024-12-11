import React, {useState, useEffect} from 'react';
import {View, Button, StyleSheet, TextInput, Pressable} from 'react-native';
import {getEvents} from './CRUD/GetEvents';
import {updateEvent} from './CRUD/UpdateEvent';
import {deleteEvent} from './CRUD/DeleteEvent';
import {Text} from 'react-native-paper';
import BackButton from '../../navigation/backButton';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Event {
  id: string;
  event_name: string;
  date: string;
  tables_reserved: number;
  total_guests: number;
}

const EventDetails = ({route, navigation}: {route: any; navigation: any}) => {
  const {eventId} = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchEvent = async () => {
      const data = await getEvents();
      const currentEvent = data.find((item: Event) => item.id === eventId);
      setEvent(currentEvent || null);
      if (currentEvent && currentEvent.date) {
        setDate(new Date(currentEvent.date));
      }
    };
    fetchEvent();
  }, [eventId]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setEvent(prevEvent => prevEvent ? {...prevEvent, date: selectedDate.toISOString()} : null);
    }
  };
  
  const handleUpdate = async () => {
    if (event) {
      const {event_name, date, tables_reserved, total_guests} = event;
      await updateEvent(eventId, {
        event_name,
        date,
        tables_reserved,
        total_guests,
      });
      navigation.goBack();
    }
  };

  const handleDelete = async () => {
    await deleteEvent(eventId);
    navigation.goBack();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <BackButton />
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>Chi tiết sự kiện</Text>
      </View>
      <Text style={styles.label}>Tên sự kiện:</Text>
      <TextInput
        value={event?.event_name || ''}
        onChangeText={text => event && setEvent({...event, event_name: text})}
        style={styles.input}
      />
      <Text style={styles.label}>Ngày tổ chức:</Text>
      <Pressable onPress={() => setShowPicker(true)}>
        <View style={styles.datePickerButton}>
          <Text style={styles.dateText}>
            {date ? `Ngày tổ chức: ${formatDate(date)}` : 'Chọn ngày'}
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
      <Text style={styles.label}>Số bàn:</Text>
      <TextInput
        value={event?.tables_reserved?.toString() || ''}
        keyboardType="numeric"
        onChangeText={text => {
          if (event) {
            setEvent({...event, tables_reserved: parseInt(text) || 0});
          }
        }}
        style={styles.input}
      />
      <Text style={styles.label}>Số người:</Text>
      <TextInput
        value={event?.total_guests?.toString() || ''}
        keyboardType="numeric"
        onChangeText={text => {
          if (event) {
            setEvent({...event, total_guests: parseInt(text) || 0});
          }
        }}
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Button title="Cập nhật" onPress={handleUpdate} />
        <Button title="Xóa" onPress={handleDelete} color="red" />
      </View>
    </View>
  );
};

export default EventDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
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
    marginVertical: 10,
    backgroundColor: '#ccc',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
});
