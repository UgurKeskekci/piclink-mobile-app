import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Button,
  Switch,
  Image,
  Platform,
  Alert, // Import Alert
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import QRCode from "react-native-qrcode-svg"; // Import QRCode
import { db, storage } from "../config";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  setDoc,
  getDocs,
  collectionGroup,
} from "firebase/firestore";
import * as FileSystem from "expo-file-system"; // Import FileSystem from expo-file-system
import { Linking } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { FileSystemAcceptedFormats } from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import {
  fetchPhotosFromFirebase,
  fetchPhotosFromStorage,
  storePhotosInFirestore,
  uploadPhotoToStorage,
} from "./FirebaseUtils";

const GuestScreen = ({ route }) => {
  const { eventId } = route.params; // Get eventId from route params
  const userId = "xHEwt6Q7Q9diJoCCpfRdLgP9aIw1";
  const [eventData, setEventData] = useState(null); // State to store event data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [events, setEvents] = useState([]);
  const navigation = useNavigation();
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleSignUpModal = () => {
    setShowSignUpModal(true);
  };

  useEffect(() => {
    addExistingEvent();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsQuery = collection(db, `users/${userId}/events`);
        const snapshot = await getDocs(eventsQuery);
        const loadedEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          eventId: doc.data().eventId, // Include eventId in the event data
          name: doc.data().name,
          ...doc.data(),
        }));
        setEvents(loadedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsQuery = collection(db, `users/${userId}/events`);
      const snapshot = await getDocs(eventsQuery);
      const loadedEvents = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        ...doc.data(),
      }));
      setEvents(loadedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const addExistingEvent = async () => {
    // Fetch the existing event
    const eventsQuery = collectionGroup(db, "events");
    const snapshot = await getDocs(eventsQuery);
    const allEvents = snapshot.docs.map((doc) => ({
      id: doc.id,
      userId: doc.ref.parent.parent.id, // Get the user ID
      ...doc.data(),
    }));

    // Find the matching event
    const matchingEvent = allEvents.find((event) => event.id === eventId);
    console.log("Matching Event Guest :", matchingEvent); // Add this log to check the value of matchingEvent
    if (matchingEvent) {
      // Fetch event data like name and description
      const eventDoc = await getDoc(doc(db, `events/${matchingEvent.id}`));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        console.log("Event Data:", eventData);

        // Now you can use eventData.name and eventData.description to display the event name and description
        setEventData(eventData);
      }

      // Add the event to the current user's database with the same ID
      const newDocRef = await setDoc(
        doc(collection(db, `users/${userId}/events`), matchingEvent.id),
        {
          ...matchingEvent, // Include all properties of the existing event
          // You can add additional properties here if needed
        }
      );

      fetchEvents();
      console.log("Event added with ID to guest:", newDocRef.id);

      // Fetch the photos subcollection from the existing event
      const photosQuery = collection(
        db,
        `users/${matchingEvent.userId}/events/${matchingEvent.id}/photos`
      );
      const photosSnapshot = await getDocs(photosQuery);

      // Copy each document in the photos subcollection to the current user's database
      const batch = writeBatch(db);
      photosSnapshot.forEach((doc) => {
        const newDocRef = doc(
          collection(db, `users/${userId}/events/${matchingEvent.id}/photos`),
          doc.id
        );
        // Include the document data when copying the photo
        batch.set(newDocRef, doc.data());
      });
      await batch.commit();
      fetchEvents();
      setAddEventError("");
      toggleExistingEventModal();
    } else {
      setAddEventError("Event not found. Please enter a valid event ID.");
    }
  };

  const handleNavigateToEventDetails = (item) => {
    // Replace 'eventId', 'eventName', 'eventDescription', and 'eventPhoto' with actual data
    const eventData = {
      eventId: item.id,
      eventName: item.name,
      eventDescription: item.description,
      eventPhoto: item.profilePhoto,
    };

    navigation.navigate("GuestEventDetails", eventData);
  };

  return (
    <View style={styles.container}>
      {/* INFO PART TITLE DESCRIPTION PHOTO ETC. */}

      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageContainerText}>Welcome to Piclink!</Text>
        </View>
      </View>

      {/* GRID LAYOUT FOR PHOTOS */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) =>
          item ? (
            <TouchableOpacity
              style={[
                styles.eventItem,
                { width: events.length > 1 ? "45%" : "95%" },
                { height: events.length > 1 ? 150 : 200 },
              ]}
              onPress={() => handleNavigateToEventDetails(item)}
            >
              <View style={styles.subheading}>
                <View style={styles.eventBoxTitle}>
                  <Text>{item.name}</Text>
                </View>
              </View>

              <View style={styles.eventBoxImage}>
                <Image
                  source={{ uri: item.profilePhoto }}
                  style={{ width: "100%", height: "100%", borderRadius: 20 }}
                />
              </View>
            </TouchableOpacity>
          ) : (
            <View />
          )
        }
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSignUpModal}
        onRequestClose={() => {
          setShowSignUpModal(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Please sign-up for more...</Text>
            <Text
              style={styles.signupText}
              onPress={() => navigation.navigate("Signup")}
            >
              Sign Up
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSignUpModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton} onPress={handleSignUpModal}>
          <Entypo name="home" size={35} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.circleButton]}
          onPress={handleSignUpModal}
        >
          <AntDesign name="pluscircleo" size={55} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleSignUpModal}>
          <Icon name="person" size={35} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    margin: 10,
    height: 50,
   
  },
  imageContainer: {
    justifyContent: "center",

  },
  imageContainerText:{
    justifyContent: "center",
    fontSize:"26px",
    

  },
  image: {
    width: 90,
    height: 90,
    resizeMode: "cover",
    borderRadius: 100,
    marginLeft: 10,
    marginTop: 10,
    backgroundColor: "gray",
  },
  eventDesc: {
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: 30,
  },
  signupText:{
    color:"blue",
    fontWeight:"700"
  },
  title: {
    width: 200,
    fontSize: 30,
    fontWeight: "600",
  },
  description: {
    width: 160,
    fontSize: 16,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.2)",
  },
  separator2: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.2)",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  gridItem: {
    width: "33%", // Adjust width to accommodate 3 columns with spacing
    marginBottom: 3, // Add margin bottom for spacing between rows
  },
  selectedImage: {
    width: "100%",
    height: 130,
    resizeMode: "cover",
    borderRadius: 8,
  },
  item: {
    width: "32%",
    height: 130,
    backgroundColor: "#d9d9d9",
    margin: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomNavBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    paddingBottom: 19,
    bottom: 0,
    left: 0,
    right: 0,
    height: "10%",
    backgroundColor: "#6b92ed",
  },
  navButton: {
    alignItems: "center",
  },
  circleButton: {
    margin: 0,
    padding: 0,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedImage: {
    width: "100%",
    height: 130, // Adjust this height as needed
    resizeMode: "cover",
    borderRadius: 0,
    margin: 0,
    padding: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "60%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },

  triggerButton: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "rgba(36, 96, 253, 0.30)",
    padding: 8,
    borderRadius: 20,
    zIndex: 10, // Make sure the button is above other elements
    justifyContent: "center",
    alignItems: "center",
  },
  triggerButtonText: {
    color: "#fff",
    fontSize: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    width: 300,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  QRModalView: {
    margin: 20,
    width: 350,
    minHeight: 450,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  invitationModalView: {
    margin: 20,
    width: 350,
    minHeight: 150,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 20,
    backgroundColor: "transparent",
    padding: 17,
  },
  closeButtonText: {
    color: "blue",
    fontSize: 14,
  },
  eventItem: {
    width: "45%",
    height: 150,
    borderWidth: 1,
    borderColor: "#cbd7f3",
    borderRadius: 20,
    marginBottom: 8,
    margin: "2.5%",
    backgroundColor: "rgba(224, 174, 208, 0)",
    justifyContent: "center",
    alignItems: "center",
  },
  subheading: {
    position: "absolute", // Resmin üzerine yerleştirin
    width: "100%", // Resmin genişliğine eşit olacak şekilde ayarlayın
    height: 33,
    bottom: 0, // En altta olacak şekilde pozisyonlandırın
    backgroundColor: "#cbd7f3",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 12, // İçeriğe boşluk bırakmak için yanal dolguyu ayarlayın
    paddingVertical: 8, // İçeriğe boşluk bırakmak için dikey dolguyu ayarlayın
  },
  eventBoxTitle: {
    justifyContent: "center",
    alignItems: "center",
  },
  eventBoxImage: {
    position: "relative", // Subheading'in altında olmasını sağlamak için
    flex: 1, // Resmi genişletmek için flex kullanın
    width: "100%", // Set width to fill parent container
    height: "100%", // Set height to fill parent container
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    marginBottom: 60, // Adjust to position above the bottom navigation bar
  },
});

export default GuestScreen;
