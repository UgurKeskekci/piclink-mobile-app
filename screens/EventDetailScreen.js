import React, { useState, useEffect } from "react";
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
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import QRCode from "react-native-qrcode-svg"; // Import QRCode
import { db, storage } from "../config";
import { doc, updateDoc, getDoc, collection, addDoc, setDoc, getDocs } from "firebase/firestore";
import * as FileSystem from "expo-file-system"; // Import FileSystem from expo-file-system
import { Linking } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { FileSystemAcceptedFormats } from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { fetchPhotosFromFirebase, fetchPhotosFromStorage, storePhotosInFirestore, uploadPhotoToStorage } from "./FirebaseUtils";



const EventDetailScreen = ({ route }) => {
  // Destructure route parameters
  const { eventId, eventDescription, eventName, eventPhoto } = route.params;
  console.log(eventId)
  console.log(eventDescription)
  const eventIdString = eventId.toString();
  console.log(eventIdString);
  const navigation = useNavigation();



  // State variables
  const [userId, setUserId] = useState(null); // Replace 'user_id' with actual user ID
  const [selectedImages, setSelectedImages] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [photoDescription, setPhotoDescription] = useState("");
  const [gridImages, setGridImages] = useState([]);
  const [generatedQRCode, setGeneratedQRCode] = useState(null);
  const [isCopyLinkModalVisible, setCopyLinkModalVisible] = useState(false);
  const [copySuccessMessage, setCopySuccessMessage] = useState("");
  const [isEventDataAdded, setIsEventDataAdded] = useState(false);
  const [newPhotoCheck, setNewPhotoCheck] = useState(null);
  const [isSortModalVisible, setSortModalVisible] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // State for loading icon
  const POLLING_INTERVAL = 2000;

  const goToHome = () => {
    navigation.navigate('Welcome');
  };
  
  const handleSortOption = (option) => {
    setSelectedSortOption(option);
    setSortModalVisible(false);
    // Call a function to apply the sort based on the selected option
    // For example: applySort(option);
  };

  const applySort = (option) => {
    // Logic to sort photos based on the selected option
    // For example: sortPhotos(option);
  };
  const syncNewPhotos = async () => {
    try {
      const storagePhotos = await fetchPhotosFromStorage(userId, eventId);
      const photosCollectionRef = collection(db, `users/${userId}/events/${eventId}/photos`);
      const batch = db.batch();
      const existingPhotoIds = new Set(); // Track existing photo IDs
      // Get existing photo IDs
      const photosQuerySnapshot = await getDocs(photosCollectionRef);
      photosQuerySnapshot.forEach((doc) => {
        if (doc.exists && Object.keys(doc.data()).length === 0) {
          // If the document exists but has no fields, delete it
          batch.delete(doc.ref);
        } else {
          // Otherwise, add its ID to the set of existing IDs
          existingPhotoIds.add(doc.id);
        }
      });
      // Add new photos to batch only if their IDs don't exist in Firestore
      storagePhotos.forEach((photo) => {
        if (!existingPhotoIds.has(photo.photoId)) {
          const photoRef = doc(photosCollectionRef, photo.photoId);
          batch.set(photoRef, photo);
        }
      });
      await batch.commit();
      const updatedPhotos = await fetchPhotosFromFirebase(userId, eventId);
      setGridImages(updatedPhotos);
    } catch (error) {
      console.error("Error syncing new photos:", error);
    }
  };
  
  useEffect(() => {
    const intervalId = setInterval(syncNewPhotos, POLLING_INTERVAL);

    // Clean up function to clear the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);
  // Fetch and log user ID from AsyncStorage
  useEffect(() => {
    const fetchAndLogUid = async () => {
      try {
        const uid = await AsyncStorage.getItem("uid");
        if (uid) {
          setUserId(uid);
        }
      } catch (error) {
        console.error("Error retrieving UID from AsyncStorage:", error);
      }
    };

    fetchAndLogUid();
  }, []);

  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = await AsyncStorage.getItem("uid");
        if (uid) {
          setUserId(uid);
        }
        setIsLoading(true); // Set loading state to true when fetching data
  
        // Check if the /photos/ subcollection exists for the event
        const photosCollectionRef = collection(db, `users/${userId}/events/${eventId}/photos`);
        const photosQuerySnapshot = await getDocs(photosCollectionRef);
        const photosExist = !photosQuerySnapshot.empty;
  
        if (!photosExist) {
          // If no photos exist in the /photos/ subcollection, fetch from Firebase Storage
          const storagePhotos = await fetchPhotosFromStorage(userId, eventId);
          // Add the fetched photos to the /photos/ subcollection
          const batch = db.batch();
          storagePhotos.forEach((photo) => {
            const photoRef = doc(photosCollectionRef, photo.photoId);
            batch.set(photoRef, photo);
          });
          await batch.commit();
          setGridImages(storagePhotos);
        } else {
          // Photos exist in the /photos/ subcollection, do nothing
          const photos = await fetchPhotosFromFirebase(userId, eventId);
          setGridImages(photos);
        }
        
        setIsLoading(false); // Set loading state to false when photos are loaded
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [userId, eventId]);
  
  


  // Navigate to profile screen
  const goToProfile = () => {
    navigation.navigate("Profile", {
      screen: "EventDetail",
      params: {
        eventId,
        eventDescription,
        eventName,
        eventPhoto,
      },
    });
  };

  // Pick image from device gallery
  const pickImage = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      multiple: true,
    });

    if (!pickerResult.cancelled) {
      const selectedPhotos = pickerResult.assets.map((asset) => asset.uri);
      await handlePhotoSelection(selectedPhotos);
    }
  };

 // In your handlePhotoSelection function where you upload photos to Storage and Firestore
const handlePhotoSelection = async (selectedPhotos) => {
  try {
    const photoData = await Promise.all(selectedPhotos.map((photoUri) => uploadPhotoToStorage(photoUri, eventId, userId)));
    await storePhotosInFirestore(userId, eventId, photoData);
    // Fetch photos again to update state
    const updatedPhotos = await fetchPhotosFromFirebase(userId, eventId);
    setGridImages(updatedPhotos);
  } catch (error) {
    console.error("Error handling photo selection:", error);
  }
};

// Function to fetch new photos from Storage and sync with Firestore


// Call syncNewPhotos whenever necessary, such as after a new photo is uploaded


  const createQRCode = () => {
    const qrData = eventId;
    setGeneratedQRCode(qrData);
    setModalVisible(false);
  };

  const copyInvitation = () => {
    const invitationLink = "https://example.com/event";
    console.log("Invitation link copied:", invitationLink);

    // Attempt to open the URL
    Linking.openURL(invitationLink).catch((err) => {
      console.error("An error occurred while trying to open the URL:", err);
    });

    setCopyLinkModalVisible(true); // You might want to reconsider this modal if you're redirecting right away
    setModalVisible(false); // Close the "Share" modal
  };



  
  return (
    <View style={styles.container}>
      {/* INFO PART TITLE DESCRIPTION PHOTO ETC. */}

      

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.triggerButton}
      >
        <Text style={styles.triggerButtonText}>Share</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Updated onPress event handlers */}
            <Button title="Create QR" onPress={createQRCode} />
            <Button title="Copy Invitation" onPress={copyInvitation} />
            {/* Close Button */}
            {/* Close Button as "X" */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Display QR code in a separate pop-up */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={generatedQRCode !== null} // Show modal only when QR code is generated
        onRequestClose={() => setGeneratedQRCode(null)} // Close modal when QR code is dismissed
      >
        <View style={styles.centeredView}>
          <View style={styles.QRModalView}>
            {/* Display generated QR code */}
            {generatedQRCode && <QRCode value={generatedQRCode} size={230} />}
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setGeneratedQRCode(null)} // Close the QR code pop-up
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isCopyLinkModalVisible}
        onRequestClose={() => setCopyLinkModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.invitationModalView}>
            <Text>Invitation Link: https://example.com/event</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCopyLinkModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <View style={styles.header}>
  <View style={styles.imageContainer}>
    <Image source={{ uri: eventPhoto }} style={styles.image} />
  </View>
  <View style={styles.eventDesc}>
    <Text style={styles.title}>
      {eventName.length > 18 ? `${eventName.substring(0, 18)}...` : eventName}
    </Text>
    <Text style={styles.description}>
    {eventDescription && eventDescription.length > 50 ? `${eventDescription.substring(0, 50)}...` : eventDescription}
    </Text>
  </View>
</View>
<Modal
        animationType="slide"
        transparent={true}
        visible={isSortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSortModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => handleSortOption("lastAdded")}
            >
              <Text>Last Added Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => handleSortOption("firstAdded")}
            >
              <Text>First Added Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => handleSortOption("custom")}
            >
              <Text>Custom Sorting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


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



          <TouchableOpacity
          style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}
            onPress={() => setSortModalVisible(true)}
          >
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "center" }}>
          <Icon
            name="funnel-outline"
            size={15}
            color="black"
            style={{ paddingRight: 2 }}
          />
          <Text style={{ paddingRight: 20 }}>Sort</Text>
        </View>
      </TouchableOpacity>


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

      <ScrollView>
      {/* GRID LAYOUT FOR PHOTOS */}
      {isLoading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <View style={[styles.gridContainer, { marginBottom: "30%" }]}>
          {gridImages.map((imageData, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                navigation.navigate("PhotoDetail", {
                  photoUri: imageData.accessUrl,
                  photoName: "Username",
                  photoDescription: "Example Description",
                  eventId: eventId,
                  userId: userId,
                  photoId: imageData.photoId,
                });
              }}
              style={styles.gridItem}
            >
              <Image
                source={{ uri: imageData.accessUrl }}
                style={styles.selectedImage}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton}>
          <Entypo name="home" size={35} color="white" onPress={goToHome} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.circleButton]}
          onPress={pickImage}
        >
          <AntDesign name="pluscircleo" size={55} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goToProfile}>
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

export default EventDetailScreen;