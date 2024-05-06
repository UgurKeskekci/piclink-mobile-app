import React, { useState, useEffect, useContext  } from "react";
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

  const [eventData, setEventData] = useState(null); // State to store event data
  const [loading, setLoading] = useState(true); // State for loading indicator

  
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventRef = doc(db, "events", eventId); // Reference to the event document in Firebase
        const eventSnap = await getDoc(eventRef); // Fetch the event document
        if (eventSnap.exists()) {
          const data = eventSnap.data(); // Extract data from the event document
          setEventData(data); // Set event data to state
        } else {
          console.log("Event not found.");
        }
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching event data:", error);
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchEventData();
  }, [eventId]);

  if (loading) {
    return <ActivityIndicator style={styles.container} size="large" />;
  }

  if (!eventData) {
    return <Text>No event data available.</Text>;
  }




  return (
    <View style={styles.container}>
      {/* INFO PART TITLE DESCRIPTION PHOTO ETC. */}
     
      <View style={styles.header}>
        
        <View style={styles.imageContainer}>
        <Image source={{ uri: eventData.photos[0].accessUrl }} style={styles.image} />
        </View>
        <View style={styles.eventDesc}>
          <Text style={styles.title}>{eventData.name}</Text>
          <Text style={styles.description}>{eventData.description}</Text>
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
