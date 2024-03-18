import axios from "axios";
import { useContext, useEffect, useState } from "react";
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
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import "firebase/compat/auth";
import { firebase, db } from "../config";
import { getF, collection, addDoc } from "firebase/firestore";
import { Firestore, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

function WelcomeScreen() {
  const authCtx = useContext(AuthContext);
  const navigation = useNavigation();

  const token = authCtx.token;
  const userId = getAuth().currentUser ? getAuth().currentUser.uid : null; // Accessing current user's UID// Assuming you have a userId property in your authentication context
  console.log(userId);
  const [isModalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventProfilePhoto, setEventProfilePhoto] = useState(null); // New state for event profile photo
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const [eventNameError, setEventNameError] = useState(false);
  const [eventNameErrorMessage, setEventNameErrorMessage] = useState("");

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setEventProfilePhoto(result.assets[0].uri);
    }
  };

  const addEventDataToFirestore = async (eventDescription,eventName, eventPhotoURI, userId) => {
    try {
      const docRef = await addDoc(collection(db, `users/${userId}/events`), {
        name: eventName,
        description: eventDescription,
        profilePhoto: eventPhotoURI,
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

    const newEvent = {
      id: events.length + 1,
      name: eventName,
      description: eventDescription,
      profilePhoto: eventProfilePhoto,
    };
    addEventDataToFirestore(eventDescription, eventName, eventProfilePhoto, userId);    // Use setState callback to ensure the correct order of state updates
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setEventName("");
    setEventDescription("");

    // Reset selected photos and selected index after the state is updated
    setSelectedPhotos([]);
    setSelectedPhotoIndex(null);

    // Reset event profile photo state
    setEventProfilePhoto(null);

    // Log the updated state

    console.log("Selected Photo Index:", eventProfilePhoto);

    toggleModal();
  };
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsQuery = collection(db, `users/${userId}/events`); // Adjust the collection path as per your database structure
        const snapshot = await getDocs(eventsQuery);
        const loadedEvents = [];

        snapshot.forEach((doc) => {
          const eventData = doc.data();
          const eventName = eventData.name; // Accessing the eventName from the event document
          loadedEvents.push({
            id: doc.id,
            name: eventName,
            ...eventData, // Include other event data if needed
          });
        });

        setEvents(loadedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setEventProfilePhoto("");
  };

  return (
    <View style={styles.rootContainer}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
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
              {eventProfilePhoto && eventProfilePhoto.length  > 0 ? (
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
    justifyContent: "center",
    backgroundColor: "white",
    padding: 16,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
  },

  createEvent: {
    fontSize: 30,
    textAlign: "center",
    margin: 30,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 30,
    margin: 9,
    padding: 8,
    minWidth: 150,
    maxWidth: 150,
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
    fontSize: 14,
    margin: 15,
  },
  onoffInput: {
    marginLeft: 15,
  },
  eventPhotoButton: {
    width: 90,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,.1)",
    padding: 10,
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
  eventItem: {
    width: 100,
    height: 120,
    padding: 12,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "rgba(36, 96, 253, 0.10)",
    marginBottom: 8,
    margin: 10,
    backgroundColor: "rgba(36, 96, 253, 0.10)",
  },
});

export default WelcomeScreen;
