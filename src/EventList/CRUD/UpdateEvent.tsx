import firestore from '@react-native-firebase/firestore';
interface Event {
  id: string;
  event_name: string;
  date: string;
  tables_reserved: number;
  total_guests: number;
}

export const updateEvent = async (
  eventId: string,
  updatedData: Partial<Event>,
) => {
  try {
    await firestore().collection('events').doc(eventId).update(updatedData);
    console.log('Event updated successfully!');
  } catch (error) {
    console.error('Error updating event: ', error);
  }
};
