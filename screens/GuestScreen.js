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
  Alert,
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
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

const GuestScreen = ({ route }) => {
  const { eventId } = route.params; // Get eventId from route params
  const userId = "xHEwt6Q7Q9diJoCCpfRdLgP9aIw1";
  const [eventData, setEventData] = useState(null); // State to store event data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [events, setEvents] = useState([]);
  const navigation = useNavigation();

 
  useEffect(() => {
    addExistingEvent()
  }, []);

  useEffect(() => {
    if (userId) {
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
    }
  }, [userId]);

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
          <Text>Event Photo</Text>
        </View>
        <View style={styles.eventDesc}>
          {eventData ? (
            <>
              <Text style={styles.title}>{eventData.name}</Text>
              <Text style={styles.description}>{eventData.description}</Text>
            </>
          ) : (
            <ActivityIndicator size="large" color="blue" />
          )}
        </View>
      </View>


      {/* BUTTONS SECTION UNDER INFO PART */}
      <View style={styles.separator}>
        <View
          style={{
            height: 60,
            borderBottomColor: "black",
            backgroundColor: "rgba(36, 96, 253, 0.30)",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Icon
            name="grid-outline"
            size={35}
            color="black"
            style={{ paddingLeft: 30 }}
          />
          <Icon name="folder-outline" size={35} color="black" />
          <Icon
            name="pricetag-outline"
            size={35}
            color="black"
            style={{ paddingRight: 30 }}
          />
        </View>
      </View>

      <View style={styles.separator2}>
        <View
          style={{
            height: 40,
            backgroundColor: "rgba(36, 96, 253, 0.1)",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}
          >
            <Icon
              name="search-outline"
              size={15}
              color="black"
              style={{ paddingRight: 2, paddingLeft: 10 }}
            />
            <Text style={{ paddingRight: 40 }}>Search</Text>
          </View>

          <View
            style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}
          >
            <Icon
              name="funnel-outline"
              size={15}
              color="black"
              style={{ paddingRight: 2 }}
            />
            <Text style={{ paddingRight: 20 }}>Sort</Text>
          </View>

          <View
            style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}
          >
            <Icon
              name="download-outline"
              size={15}
              color="black"
              style={{ paddingRight: 2 }}
            />
            <Text style={{ paddingRight: 20 }}>Download</Text>
          </View>
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
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton}>
          <Entypo name="home" size={35} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.circleButton]}>
          <AntDesign name="pluscircleo" size={55} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
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
    height: 150,
  },
  imageContainer: {
    justifyContent: "center",
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
    width: "80%",
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
    right: 10,
    backgroundColor: "transparent",
    padding: 8,
  },
  closeButtonText: {
    color: "blue",
    fontSize: 24,
  },
});

export default GuestScreen;
