import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "../config";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const EventDetailScreen = ({ route }) => {
  // Destructure route parameters
  const { eventId, eventDescription, eventName, eventPhoto } = route.params;
  
  // Initialize navigation
  const navigation = useNavigation();
  
  // State variables
  const [userId, setUserId] = useState(null); // Replace 'user_id' with actual user ID
  const [selectedImages, setSelectedImages] = useState([]);

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

  // Fetch selected images from Firestore and Firebase Storage
  const fetchPhotos = async () => {
    try {
      const firestorePhotos = await fetchExistingPhotosFromFirestore();
      const storagePhotos = await fetchExistingPhotoUrlsFromStorage();
      // Combine and return both sets of photos
      return [...firestorePhotos, ...storagePhotos];
    } catch (error) {
      console.error("Error fetching photos:", error);
      return [];
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
      const photoUrls = [];
      await Promise.all(listResult.items.map(async (item) => {
        const downloadURL = await item.getDownloadURL();
        photoUrls.push(downloadURL);
      }));
      return photoUrls;
    } catch (error) {
      console.error("Error fetching existing photo URLs from Storage:", error);
      return [];
    }
  };

  // Fetch photos when component mounts
  useEffect(() => {
    const fetchPhotosAndUpdateState = async () => {
      const photos = await fetchPhotos();
      setSelectedImages(photos);
    };
    fetchPhotosAndUpdateState();
  }, []);

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
    console.log("Handling photo selection...");
    try {
      const photoUrls = await uploadPhotosToStorage(selectedPhotos);
      await storePhotoUrlsInFirestore(photoUrls);
      const updatedImages = [...selectedImages, ...photoUrls];
      setSelectedImages(updatedImages);
    } catch (error) {
      console.error("Error handling photo selection:", error);
    }
  };

  // Upload photos to Firebase Storage
  const uploadPhotosToStorage = async (photos) => {
    try {
      const photoUrls = [];
      for (const photoUri of photos) {
        const imageName = photoUri.substring(photoUri.lastIndexOf('/') + 1);
        const response = await fetch(photoUri);
        const blob = await response.blob();
        // Update storage path to include event ID
        const storageRef = storage.ref().child(`eventPhotos/${eventId}/${imageName}`);
        await storageRef.put(blob);
        const downloadURL = await storageRef.getDownloadURL();
        photoUrls.push(downloadURL);
      }
      return photoUrls;
    } catch (error) {
      console.error("Error uploading photos to Firebase Storage:", error);
      throw error;
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
  // Render selected images
  const renderSelectedImages = () => {
    return selectedImages.map((imageUri, index) => (
      <Image
        key={index}
        source={{ uri: imageUri }}
        style={styles.selectedImage}
      />
    ));
  };
  
  return (
    <View style={styles.container}>
      {/* INFO PART TITLE DESCRIPTION PHOTO ETC. */}
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
            borderBottomWidth: 1,
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
            size={40}
            color="black"
            style={{ paddingLeft: 30 }}
          />
          <Icon name="folder-open-outline" size={40} color="black" />
          <Icon
            name="pricetag-outline"
            size={40}
            color="black"
            style={{ paddingRight: 30 }}
          />
        </View>
      </View>

      <View style={styles.separator2}>
        <View
          style={{
            height: 20,
            borderBottomWidth: 1,
            borderBottomColor: "black",
            backgroundColor: "rgba(36, 96, 253, 0.1)",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
        
          <Icon
            name="search-outline"
            size={15}
            color="black"
            style={{ paddingRight: 2, paddingLeft:10 }}
          />
         <Text style={{ paddingRight: 40 }}>Search</Text>


          <Icon
            name="funnel-outline"
            size={15}
            color="black"
            style={{ paddingRight: 2 }}
          />
          <Text style={{ paddingRight: 20 }}>Sort</Text>
        </View>
      </View>

      {/* GRID LAYOUT FOR PHOTOS */}
      <View style={styles.gridContainer}>
        {renderSelectedImages()}
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
    backgroundColor: "gray",
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
    width: 100,
    height: 100,
    resizeMode: "cover",
    borderRadius: 8,
    margin: 4,
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
});

export default EventDetailScreen;
