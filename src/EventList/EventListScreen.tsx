import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {getEvents} from './CRUD/GetEvents';
import {Event} from './CRUD/GetEvents';
import {Button} from 'react-native-paper';
import BackButton from '../../navigation/backButton';

const EventListScreen = ({navigation}: {navigation: any}) => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getEvents();
      setEvents(data);
    };

    const unsubscribe = navigation.addListener('focus', fetchEvents);

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', marginBottom: 10}}>
        <BackButton />
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>
          Danh sách sự kiện
        </Text>
      </View>
      <Button
        onPress={() => navigation.navigate('AddEventScreen')}
        style={styles.button}
        labelStyle={styles.buttonText}>
        Thêm sự kiện
      </Button>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          const formattedDate = new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(new Date(item.date));

          return (
            <View style={styles.eventContainer}>
              <Text style={styles.eventText}>
                Tên sự kiện: {item.event_name}
              </Text>
              <Text style={styles.eventText}>
                Ngày tổ chức: {formattedDate}
              </Text>
              <Text style={styles.eventText}>
                Số bàn: {item.tables_reserved}
              </Text>
              <Text style={styles.eventText}>
                Số người: {item.total_guests}
              </Text>
              <Button
                onPress={() =>
                  navigation.navigate('EventDetailScreen', {eventId: item.id})
                }
                style={styles.button}
                labelStyle={styles.buttonText}>
                Chi tiết
              </Button>
            </View>
          );
        }}
      />
    </View>
  );
};

export default EventListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  eventContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 8,
  },
  eventText: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
