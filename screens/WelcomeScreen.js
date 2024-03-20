import React, { useContext, useEffect, useState } from "react";
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
} from "react-native";
import { AuthContext } from "../store/auth-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, storage } from "../config";
import { collection, addDoc, getDocs } from "firebase/firestore";

function WelcomeScreen() {
  const authCtx = useContext(AuthContext);
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventProfilePhoto, setEventProfilePhoto] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [eventNameError, setEventNameError] = useState(false);
  const [eventNameErrorMessage, setEventNameErrorMessage] = useState("");

  useEffect(() => {
    const fetchAndLogUid = async () => {
      try {
        const uid = await AsyncStorage.getItem('uid');
        console.log('UID retrieved from AsyncStorage:', uid);
        if (!userId && uid) {
          setUserId(uid);
        }
      } catch (error) {
        console.error('Error retrieving UID from AsyncStorage:', error);
      }
    };
    fetchAndLogUid();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchEvents = async () => {
        try {
          const eventsQuery = collection(db, `users/${userId}/events`);
          const snapshot = await getDocs(eventsQuery);
          const loadedEvents = snapshot.docs.map(doc => ({
            id: doc.id,
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

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setEventProfilePhoto("");
  };

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.cancelled) {
      const uri = result.assets[0].uri;
      const imageName = uri.substring(uri.lastIndexOf('/') + 1);
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = storage.ref().child(`eventProfilePhotos/${imageName}`);
        await storageRef.put(blob);
        const downloadURL = await storageRef.getDownloadURL();
        setEventProfilePhoto(downloadURL);
      } catch (error) {
        console.error('Error uploading image to Firebase Storage:', error);
      }
    }
  };
  

  const addEventDataToFirestore = async () => {
    try {
      const docRef = await addDoc(collection(db, `users/${userId}/events`), {
        name: eventName,
        description: eventDescription,
        profilePhoto: eventProfilePhoto,
      });
      console.log("Event added with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };
  

  const createEvent = () => {
    if (!eventName.trim()) {
      setEventNameError(true);
      setEventNameErrorMessage("Event title cannot be empty");
      return;
    } else {
      setEventNameError(false);
      setEventNameErrorMessage("");
    }

    addEventDataToFirestore();
    const newEvent = {
      id: events.length + 1,
      name: eventName,
      description: eventDescription,
      profilePhoto: eventProfilePhoto,
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setEventName("");
    setEventDescription("");
    setSelectedPhotos([]);
    setSelectedPhotoIndex(null);
    setEventProfilePhoto(null);
    toggleModal();
  };
  return (
    <View style={styles.rootContainer}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) =>
          item ? (
            <TouchableOpacity
              style={styles.eventItem}
              onPress={() =>
                navigation.navigate("EventDetail", {
                  eventName: item.name,
                  eventDescription: item.description,
                  eventPhoto: item.profilePhoto,
                })
              }
            >
              
              <Text>{item.name}</Text>
              <Text>{item.description}</Text>
              <View style={styles.subheading}></View> 
            
                <Image
                  source={{ uri: item.profilePhoto }}
                  style={{ width: 98, height: 50, marginLeft: -12 }}
                />
           
           
            </TouchableOpacity>
          ) : (
            <View />
          )
        }
      />

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="home" size={30} color="blue" />
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.circleButton]}
          onPress={toggleModal}
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="person" size={30} color="blue" />
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Event Creation Modal ----------------------------------------------------------------------------*/}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.createEvent}>Create Event</Text>
          <Text style={styles.inputText}>Event Title</Text>
          {eventNameError && (
            <Text style={styles.errorMessage}>{eventNameErrorMessage}</Text>
          )}
          <TextInput
            style={[styles.input, eventNameError && styles.inputError]}
            placeholder="GetTogether, wedding, meeting"
            placeholderTextColor="rgba(0, 0, 0, 0.5)" 
            onChangeText={(text) => {
              setEventName(text);
              setEventNameError(false); // Reset error state when user starts typing
              setEventNameErrorMessage(""); // Reset error message when user starts typing
            }}
          />

          <Text style={styles.inputText}>Event Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Share your moments!"
            placeholderTextColor="rgba(0, 0, 0, 0.5)" 
            onChangeText={(text) => setEventDescription(text)}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.inputText}>Private Event</Text>
            <Switch
              style={styles.onoffInput}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>

          <View>
            <Text style={styles.inputText}>Add Event Profile Photo</Text>
            <TouchableOpacity
              style={styles.eventPhotoButton}
              onPress={handleImagePicker}
            >
              {eventProfilePhoto && eventProfilePhoto.length > 0 ? (
                <Image
                  source={{ uri: eventProfilePhoto }}
                  style={{ width: 70, height: 70, borderRadius: 50 }}
                />
              ) : (
                <Icon name="add" size={30} color="blue" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtonsContainer}>
            <Button
              style={styles.button}
              title="Cancel"
              onPress={toggleModal}
            />
            <Button
              style={styles.button}
              title="Create"
              onPress={createEvent}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "white",
    padding: 16,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
  },

  eventItem: {
    width: 165,
    height: 150,
    padding: 12,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#cbd7f3",
    marginBottom: 8,
    margin: 5,
    backgroundColor: "#cbd7f3",
  },
  subheading: {
    width: 166,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    position: 'absolute',
    left: -2,
    bottom: -2, // Align the subheading box at the bottom of the parent box
  },
  createEvent: {
    fontSize: 30,
    textAlign: "center",
    margin: 50,
  },
  input: {
    width: 330, // Width without units in React Native
    height: 45, // Height without units in React Native
    flexGrow: 0, // Use flexGrow property directly
    marginVertical: 9, // Margin for vertical spacing
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    margin: 15,
    padding: 15,
  },
  inputError: {
    borderColor: "red", // Change border color to red when there's an error
  },
  errorMessage: {
    color: "red",
    fontSize: 12,
    marginLeft: 10, // Adjust spacing as needed
  },
  inputText: {
    fontSize: 16,
    margin: 15,
  },
  
  onoffInput: {
    marginLeft: 15,
  },
  eventPhotoButton: {
    width: 90,
    height: 90,
    flexGrow: 0,
    margin: '8.8px 167px 0 0', // Margin top, right, bottom, left
    padding: '30px 7px 18px', // Padding top, right, bottom
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    margin: 15,
  },
  eventPhoto: {},
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
    width: 65, // Example width
    height: 65, // Example height
    backgroundColor: "rgba(36, 96, 253, 1)",
    borderRadius: 30, // Half of width and height to create a circle
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 90,
  },
});

export default WelcomeScreen;
