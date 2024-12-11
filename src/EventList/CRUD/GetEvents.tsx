import firestore from "@react-native-firebase/firestore";

export interface Event {
  id: string;
  event_name: string;
  date: string;
  tables_reserved: number;
  total_guests: number;
}

export const getEvents = async (): Promise<Event[]> => {
  try {
    const snapshot = await firestore().collection("events").get();
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
    return events;
  } catch (error) {
    console.error("Error fetching events: ", error);
    return [];
  }
};