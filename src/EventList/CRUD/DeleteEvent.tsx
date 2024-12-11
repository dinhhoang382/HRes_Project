import firestore from "@react-native-firebase/firestore";

export const deleteEvent = async (eventId: string) => {
  try {
    await firestore().collection("events").doc(eventId).delete();
    console.log("Event deleted successfully!");
  } catch (error) {
    console.error("Error deleting event: ", error);
  }
};