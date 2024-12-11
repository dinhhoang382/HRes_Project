import firestore from "@react-native-firebase/firestore";

export const addEvent = async (eventData: { event_name: string; date: string }) => {
  try {
    await firestore().collection("events").add(eventData);
    console.log("Event added successfully!");
  } catch (error) {
    console.error("Error adding event: ", error);
  }
};