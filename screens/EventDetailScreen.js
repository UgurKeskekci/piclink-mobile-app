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
  Platform, Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import QRCode from "react-native-qrcode-svg"; // Import QRCode
import { db, storage } from "../config";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import * as FileSystem from "expo-file-system"; // Import FileSystem from expo-file-system

const EventDetailScreen = ({ route }) => {
  // Destructure route parameters
  const { eventId, eventDescription, eventName, eventPhoto } = route.params;

  // Initialize navigation
  const navigation = useNavigation();

  // State variables
  const [userId, setUserId] = useState(null); // Replace 'user_id' with actual user ID
  const [selectedImages, setSelectedImages] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [photoDescription, setPhotoDescription] = useState("");
  const [gridImages, setGridImages] = useState([]);
  const [generatedQRCode, setGeneratedQRCode] = useState(null);

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

  // Fetch selected images from AsyncStorage
  const fetchSelectedImages = async () => {
    try {
      const storedImages = await AsyncStorage.getItem(
        `selectedImages_${eventId}`
      );
      if (storedImages) {
        setSelectedImages(JSON.parse(storedImages));
      }
    } catch (error) {
      console.error(
        "Error retrieving selected images from AsyncStorage:",
        error
      );
    }
  };

  useEffect(() => {
    fetchSelectedImages();
  }, [eventId]);

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

  // Store selected images in AsyncStorage
  const storeSelectedImages = async (images) => {
    try {
      await AsyncStorage.setItem(
        `selectedImages_${eventId}`,
        JSON.stringify(images)
      );
    } catch (error) {
      console.error("Error storing selected images in AsyncStorage:", error);
    }
  };

  // Handle photo selection from image picker
  const handlePhotoSelection = async (selectedPhotos) => {
    console.log("Handling photo selection...");
    try {
      const photoUrls = await uploadPhotosToStorage(selectedPhotos);
      await storePhotoUrlsInFirestore(photoUrls);
      const updatedImages = [...selectedImages, ...photoUrls];
      setSelectedImages(updatedImages);
      await storeSelectedImages(updatedImages);
    } catch (error) {
      console.error("Error handling photo selection:", error);
    }
  };

  // Render selected images
  const renderSelectedImages = () => {
    console.log("Rendering selected images...");
    return selectedImages.map((imageUri, index) => (
      <Image
        key={index}
        source={{ uri: imageUri }}
        style={styles.selectedImage}
      />
    ));
  };

  // Upload photos to Firebase Storage
  const uploadPhotosToStorage = async (photos) => {
    try {
      const photoUrls = [];
      for (const photoUri of photos) {
        const imageName = photoUri.substring(photoUri.lastIndexOf("/") + 1);
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const storageRef = storage
          .ref()
          .child(`eventPhotos/${eventId}/${imageName}`);
        await storageRef.put(blob);
        const downloadURL = await storageRef.getDownloadURL();
        photoUrls.push(downloadURL);
        console.log("Download URL:", downloadURL);
      }
      return photoUrls;
    } catch (error) {
      console.error("Error uploading photos to Firebase Storage:", error);
      throw error;
    }
  };

  // Fetch existing photos from Firestore
  const fetchExistingPhotosFromFirestore = async () => {
    try {
      const eventRef = doc(db, `users/${userId}/events/${eventId}`);
      const eventSnapshot = await getDoc(eventRef);
      if (eventSnapshot.exists()) {
        const eventData = eventSnapshot.data();
        return eventData.photos || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching existing photos from Firestore:", error);
      return [];
    }
  };

  // Fetch existing photo URLs from Firebase Storage
  const fetchExistingPhotoUrlsFromStorage = async () => {
    try {
      const storageRef = storage.ref().child(`eventPhotos/${eventId}`);
      const listResult = await storageRef.listAll();
      const photoUrls = listResult.items.map((item) => item.getDownloadURL());
      return Promise.all(photoUrls);
    } catch (error) {
      console.error("Error fetching existing photo URLs from Storage:", error);
      return [];
    }
  };

  const createQRCode = () => {
    const qrData = "Event: " + eventName + "\nDescription: " + eventDescription;
    setGeneratedQRCode(qrData);
    setModalVisible(false);
  };

  // Remove deleted photos from AsyncStorage
  useEffect(() => {
    removeDeletedPhotosFromAsyncStorage();
  }, [eventId]);

  const removeDeletedPhotosFromAsyncStorage = async () => {
    try {
      const storedImages = await AsyncStorage.getItem(
        `selectedImages_${eventId}`
      );
      if (storedImages) {
        const storedImageUris = JSON.parse(storedImages);

        // Check each stored image URI if it exists in Firestore or Storage
        const existingPhotos = await fetchExistingPhotosFromFirestore();
        const existingPhotoUrls = existingPhotos.map((photo) => photo.url);
        const storagePhotoUrls = await fetchExistingPhotoUrlsFromStorage();

        // Combine existing photo URLs from Firestore and Storage
        const allExistingPhotoUrls = [
          ...existingPhotoUrls,
          ...storagePhotoUrls,
        ];

        // Filter out images that exist in either Firestore or Storage
        const filteredImages = storedImageUris.filter((uri) =>
          allExistingPhotoUrls.includes(uri)
        );

        await AsyncStorage.setItem(
          `selectedImages_${eventId}`,
          JSON.stringify(filteredImages)
        );
        setSelectedImages(filteredImages);
      }
    } catch (error) {
      console.error("Error removing deleted photos from AsyncStorage:", error);
    }
  };

  // Store photo URLs in Firestore
  const storePhotoUrlsInFirestore = async (urls) => {
    try {
      const eventRef = doc(db, `users/${userId}/events/${eventId}`);
      if (eventRef) {
        // Get the existing document snapshot
        const eventSnapshot = await getDoc(eventRef);
        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data();
          // Get the existing photos array or initialize as empty array
          const existingPhotos = eventData.photos || [];
          // Concatenate existing photos with new URLs
          const updatedPhotos = existingPhotos.concat(urls);
          // Update the 'photos' field in Firestore document
          await updateDoc(eventRef, { photos: updatedPhotos });
          console.log("Photos uploaded and URLs stored successfully!");
        } else {
          console.error("Event document does not exist!");
        }
      } else {
        console.error("Event reference is undefined!");
      }
    } catch (error) {
      console.error("Error storing photo URLs in Firestore:", error);
    }
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
      console.log("Selected Images:", selectedImages);
      await handlePhotoSelection(selectedPhotos);
    }
  };
  const handleDownload = async () => {
    try {
      const downloadDir = FileSystem.documentDirectory + 'downloaded_photos'; // Directory to store downloaded photos
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true }); // Ensure the directory exists
  
      // Loop through selectedImages and download each photo
      for (let i = 0; i < selectedImages.length; i++) {
        const photoUrl = selectedImages[i];
        const fileName = photoUrl.substring(photoUrl.lastIndexOf('/') + 1);
        const downloadPath = downloadDir + '/' + fileName;
  
        // Download the photo
        await FileSystem.downloadAsync(photoUrl, downloadPath);
  
        // Save the photo to the device's camera roll
        if (Platform.OS === 'ios') {
          const cameraDir = FileSystem.documentDirectory + 'camera';
          await FileSystem.makeDirectoryAsync(cameraDir, { intermediates: true }); // Ensure the camera directory exists
          await FileSystem.downloadAsync(photoUrl, cameraDir + '/' + fileName);
        } else if (Platform.OS === 'android') {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === 'granted') {
            await MediaLibrary.saveToLibraryAsync(downloadPath);
          } else {
            Alert.alert('Permission Required', 'Please grant permission to save photos.');
            return;
          }
        }
  
        console.log('Downloaded:', fileName);
      }
  
      Alert.alert(
        'Download Complete',
        'All photos have been downloaded and saved to your device.'
      );
    } catch (error) {
      console.error('Error downloading photos:', error);
      Alert.alert('Download Error', 'Failed to download photos. Please try again.');
    }
  };
  
  
  return (
    <View style={styles.container}>
      {/* INFO PART TITLE DESCRIPTION PHOTO ETC. */}

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.triggerButton}
      >
        <Text style={styles.triggerButtonText}>Show Popup</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Updated onPress event handler */}
            <Button title="Create QR" onPress={() => createQRCode()} />

            <Button
              title="Copy Invitation"
              onPress={() => console.log("Copy Invitation Pressed")}
            />
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
      {generatedQRCode && (
        <View style={styles.qrCodeContainer}>
          <QRCode value={generatedQRCode} size={200} />
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: eventPhoto }} style={styles.image} />
        </View>
        <View style={styles.eventDesc}>
          <Text style={styles.title}>{eventName}</Text>
          <Text style={styles.description}>{eventDescription}</Text>
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
            name="apps-outline"
            size={35}
            color="black"
            style={{ paddingLeft: 30 }}
          />
          <Icon name="folder-open-outline" size={35} color="black" />
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
  style={{
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  }}
>
  <TouchableOpacity onPress={handleDownload}>
    <Icon
      name="download-outline"
      size={15}
      color="black"
      style={{ paddingRight: 2 }}
    />
    <Text>Download</Text>
  </TouchableOpacity>
</View>
        </View>
      </View>

      {/* GRID LAYOUT FOR PHOTOS */}
      <View style={styles.gridContainer}>
        {selectedImages.map((imageUri, index) => (
          <Image
            key={index}
            source={{ uri: imageUri }}
            style={styles.selectedImage}
          />
        ))}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="home" size={30} color="blue" />
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.circleButton]}
          onPress={pickImage}
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goToProfile}>
          <Icon name="person" size={30} color="blue" />
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
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
  },
  eventDesc: {
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
  },
  description: {
    width: 150,
    fontSize: 14,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },

  gridContainer: {
    width: "100%",
    marginHorizontal: "auto",
    flexDirection: "row",
    flexWrap: "wrap",
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
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "rgba(36, 96, 253, 0.10)",
  },
  navButton: {
    alignItems: "center",
  },
  circleButton: {
    margin: 0,
    padding: 0,
    width: 65,
    height: 65,
    backgroundColor: "rgba(36, 96, 253, 1)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 90,
  },
  selectedImage: {
    width: "31%",
    height: 135,
    resizeMode: "cover",
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
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

  // Add these to your StyleSheet object
  triggerButton: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "blue", // Feel free to change the color
    padding: 8,
    borderRadius: 20,
    zIndex: 10, // Make sure the button is above other elements
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
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
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
