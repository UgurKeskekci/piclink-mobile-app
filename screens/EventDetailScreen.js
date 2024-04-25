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

  const goToHome = () => {
    navigation.navigate("Welcome");
  };

  const fetchPhotos = async () => {
    try {
      const photosSnapshot = await getDocs(collection(db, `users/${userId}/events/${eventId}/photos`));
      if (!photosSnapshot.empty) { // Check if snapshot is not empty
        const photos = photosSnapshot.docs.map((doc) => doc.data());
        return photos; // Return the fetched photos
      } else {
        return []; // Return an empty array if no photos found
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      throw error; // Throw the error to handle it where the function is called
    }
  };
  


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
  // Check if event data has already been added to Firestore
  if (!isEventDataAdded) {
    const fetchPhotosFromStorageAndAddToFirestore = async () => {
      try {
        // Construct the path to the folder in Firebase Storage using the event ID
        const storagePath = `eventPhotos/${eventId}`;
        // Get the list of files (photos) from that folder
        const storageRef = storage.ref().child(storagePath);
        const storageFiles = await storageRef.listAll();
    
        // Iterate through each file (photo) in the storage
        const photoDataPromises = storageFiles.items.map(async (fileRef) => {
          // Get the download URL of the photo
          const downloadURL = await fileRef.getDownloadURL();
    
          // Fetch metadata of the photo from Firestore using its document ID
          const photoDocRef = doc(db, `users/${userId}/events/${eventId}/photos`, fileRef.name);
          const photoDocSnapshot = await getDoc(photoDocRef);
    
          // Check if the photo document already exists in Firestore
          if (photoDocSnapshot.exists()) {
            // If it exists, use the existing data
            const existingPhotoData = photoDocSnapshot.data();
            return existingPhotoData;
          } else {
            // If it doesn't exist, create new photo data with default values
            const newPhotoData = {
              accessUrl: downloadURL,
              additionDate: new Date().toISOString(),
              likeNumber: 0,
              comments: [],
              owner: userId,
              photoId: fileRef.name
            };
            // Add the new photo data to Firestore
            await setDoc(photoDocRef, newPhotoData);
            return newPhotoData;
          }
        });
    
        // Wait for all photo data promises to resolve
        const photoDataArray = await Promise.all(photoDataPromises);
        console.log("Photos fetched and added to Firestore:", photoDataArray);
        
        // Set the flag to indicate that event data has been added to Firestore
        setIsEventDataAdded(true);
      } catch (error) {
        console.error("Error fetching photos from Firebase Storage and adding to Firestore:", error);
      }
    };
    
    // Call the function to fetch photos from Firebase Storage and add them to Firestore
    fetchPhotosFromStorageAndAddToFirestore();
  }
}, [eventId, userId, isEventDataAdded]);
  




useEffect(() => {
  const fetchPhotosAndUpdateState = async () => {
    try {
      const photos = await fetchPhotos();
      setGridImages(photos); // Update gridImages state with fetched photos
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };
  fetchPhotosAndUpdateState();
}, [newPhotoCheck]);


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

  // Handle photo selection from image picker
  const handlePhotoSelection = async (selectedPhotos) => {
    try {
      const photoUrls = await uploadPhotosToStorage(selectedPhotos);
      await storePhotosInFirestore(photoUrls);
      setNewPhotoCheck(true)
      // After storing photos, fetch them again to update state
      fetchPhotos();
    } catch (error) {
      console.error("Error handling photo selection:", error);
    }
  };
  

  
  // Upload photos to Firebase Storage
// Upload photos to Firebase Storage
// Upload photos to Firebase Storage
const generatePhotoDocumentId = () => {
  // Generate a unique identifier for each photo document
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const uploadPhotosToStorage = async (photos) => {
  try {
    const photoData = [];
    for (const photoUri of photos) {
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const imageName = photoUri.substring(photoUri.lastIndexOf("/") + 1);
      const storagePath = `eventPhotos/${eventId}/${imageName}`;
      const storageRef = storage.ref().child(storagePath);
      await storageRef.put(blob);
      const downloadURL = await storageRef.getDownloadURL();
      const photoInfo = {
        accessUrl: downloadURL,
        additionDate: new Date().toISOString(),
        likeNumber: 0,
        comments: [],
        owner: userId,
        photoId: imageName
      };
      
      // Use a fixed document ID generated for each photo
      const photoDocId = generatePhotoDocumentId();
      const photoDocRef = doc(db, `users/${userId}/events/${eventId}/photos`, photoDocId);
      await setDoc(photoDocRef, photoInfo);

      photoData.push(photoInfo);
    }
    return photoData;
  } catch (error) {
    console.error("Error uploading photos to Firebase Storage:", error);
    throw error;
  }
};




  const createQRCode = () => {
    const qrData = "Event: " + eventName + "\nDescription: " + eventDescription;
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

  const storePhotosInFirestore = async (photoData) => {
    try {
      const photosRef = collection(db, `users/${userId}/events/${eventId}/photos`);
      await Promise.all(photoData.map(async (photo) => {
        // Add the photo data to Firestore
        await addDoc(photosRef, photo);
      }));
      console.log("Photos uploaded and data stored successfully!");
    } catch (error) {
      console.error("Error storing photo data in Firestore:", error);
    }
  };
  
  



  const renderSelectedImages = () => {
    return (
      <View style={styles.gridContainer}>
        {gridImages.map((imageData, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              navigation.navigate("PhotoDetail", {
                photoUri: imageData.accessUrl,
                photoName: "Username", // You might want to replace this with the actual photo name
                photoDescription: "Example Description", // You might want to replace this with the actual photo description
                eventId: eventId,
                userId: userId,
                photoId: imageData.photoId// Pass the photo ID here
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
    );
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
      {eventDescription.length > 50 ? `${eventDescription.substring(0, 50)}...` : eventDescription}
    </Text>
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
            borderBottomWidth: 1,
            borderBottomColor: "black",
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
      <View>{renderSelectedImages()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton}>
          <Entypo name="home" size={35} color="white" />
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
    borderBottomColor: "black",
  },

  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridItem: {
    flex: 1,
    marginRight: 5,
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
    borderRadius: 8,
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