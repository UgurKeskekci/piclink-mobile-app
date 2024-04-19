import React, { useContext, useEffect, useState, useRef } from "react";
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
  ScrollView,
} from "react-native";
import { AuthContext } from "../store/auth-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, storage } from "../config";
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import {
  collection,
  collectionGroup,
  addDoc,
  getDoc,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import firebase from "firebase/app";
import "firebase/firestore";

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
  const [isExistingEventModalVisible, setExistingEventModalVisible] =
    useState(false);
  const [existingEventInput, setExistingEventInput] = useState("");
  const [addEventError, setAddEventError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const scrollViewRef = useRef(null);
  const [userEmail, setUserEmail] = useState(null);

  const toggleExistingEventModal = () => {
    setExistingEventModalVisible(!isExistingEventModalVisible);
  };
  const [searchText, setSearchText] = useState(""); // Define setSearchText here

  useEffect(() => {
    const fetchAndLogUid = async () => {
      try {
        const uid = await AsyncStorage.getItem("uid");
        console.log("UID retrieved from AsyncStorage:", uid);
        if (!userId && uid) {
          setUserId(uid);
        }
      } catch (error) {
        console.error("Error retrieving UID from AsyncStorage:", error);
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
      const imageName = uri.substring(uri.lastIndexOf("/") + 1);
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = storage
          .ref()
          .child(`eventProfilePhotos/${imageName}`);
        await storageRef.put(blob);
        const downloadURL = await storageRef.getDownloadURL();
        setEventProfilePhoto(downloadURL);
      } catch (error) {
        console.error("Error uploading image to Firebase Storage:", error);
      }
    }
  };

  const addEventDataToFirestore = async () => {
    try {
      const docRef = await addDoc(collection(db, `users/${userId}/events`), {
        eventId: Math.random().toString(36).substring(2), // Generate unique eventId
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
      eventId: Math.random().toString(36).substring(2), // Generate unique eventId
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

  const goToProfile = () => {
    navigation.navigate("Profile");
  };

  // SearchBarRelated
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

  

  const scrollViewStyle = StyleSheet.compose(
    styles.rootContainer,
    // Add any additional styles specific to ScrollView here
  );


  const handleSearch = (text) => {
    setSearchText(text); // Update the local state with the current search text
  
    if (text.trim() === "") {
      // If the search text is empty, fetch all events
      fetchEvents();
    } else {
      const formattedSearchText = text.toLowerCase();
  
      const filteredEvents = events.filter((event) => {
        const eventName = event.name.toLowerCase();
        return eventName.includes(formattedSearchText);
      });
      setEvents(filteredEvents); // Update the events state with filtered events
    }
  };


  const addExistingEvent = async () => {
    try {
      const enteredEventId = existingEventInput.trim();
  
      // Fetch events from all users
      const eventsQuery = collectionGroup(db, 'events');
      const snapshot = await getDocs(eventsQuery);
      const allEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.ref.parent.parent.id, // Get the user ID
        ...doc.data(),
      }));
  
      // Search for the event by ID
      const matchingEvent = allEvents.find(event => event.id === enteredEventId);
      if (matchingEvent) {
        console.log(matchingEvent.id);
        // Rest of your code...
      } else {
        // Handle the case when no matching event is found
        console.log("No matching event found with ID:", enteredEventId);
      }
      if (matchingEvent) {
        // Add the event to the current user's database with the same ID
        const newDocRef = await setDoc(doc(collection(db, `users/${userId}/events`), matchingEvent.id), {
          ...matchingEvent, // Include all properties of the existing event
          // You can add additional properties here if needed
        });
        console.log("Event added with ID:", newDocRef.id);
      
        // Update the events state with the newly added event
        setEvents(prevEvents => [...prevEvents, matchingEvent]);
      
        setAddEventError("");
        toggleExistingEventModal();
      } else {
        setAddEventError("Event not found. Please enter a valid event ID.");
      }      
    } catch (error) {
      console.error("Error adding existing event:", error);
      setAddEventError("Error adding existing event. Please try again.");
    }
  };
  
  


  return (
    <View style={scrollViewStyle}>
    <ScrollView ref={scrollViewRef} contentContainerStyle={{ paddingBottom: 90 }}>
    <Text>User Email: {userEmail}</Text>
      <TouchableOpacity onPress={toggleExistingEventModal} style={styles.addButton}>
        <Text>Add Existing Event</Text>
      </TouchableOpacity>

      {/* Existing Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isExistingEventModalVisible}
        onRequestClose={toggleExistingEventModal}
      >
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter event ID "
            value={existingEventInput}  // Ensure that the value is bound to existingEventInput
            onChangeText={setExistingEventInput}  // Ensure that onChangeText updates existingEventInput
          />


          <TouchableOpacity onPress={addExistingEvent} style={styles.addButton}>
            <Text>Add Event</Text>
          </TouchableOpacity>
          {addEventError !== "" && <Text style={styles.errorText}>{addEventError}</Text>}
          <TouchableOpacity onPress={toggleExistingEventModal} style={styles.cancelButton}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <TextInput
        style={styles.inputSearch}
        placeholder="Search events..."
        placeholderTextColor="rgba(0, 0, 0, 0.5)"
        onChangeText={handleSearch}
        value={searchText} // Bind the value to searchText state
      />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) =>
          item ? (
            <TouchableOpacity
              style={[
                styles.eventItem,
              ]}
              onPress={() =>
                navigation.navigate("EventDetail", {
                  eventId: item.id,
                  eventName: item.name,
                  eventDescription: item.description,
                  eventPhoto: item.profilePhoto,
                })
              }
            >
              <View style={styles.subheading}>
                <View style={styles.eventBoxTitle}>
                  <Text>{item.name}</Text>
                </View>
              </View>

              <View style={styles.eventBoxImage}>
                <Image
                  source={{ uri: item.profilePhoto }}
                  style={{ width: '100%', height: '100%', borderRadius: 20 }}
                  
                />
              </View>
            </TouchableOpacity>
          ) : (
            <View />
          )
        }
      />

     

      {/* Event Creation Modal ----------------------------------------------------------------------------*/}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        
        <View style={styles.modalContainer}>
          <Text style={styles.createEvent}>Create Event</Text>
          <Text style={styles.inputText}>
              Event Title <Text style={{ color: "red" }}>*</Text>
          </Text>

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
              <Text style={styles.inputText}>Preferences <Text  style={{  fontSize: 16, fontWeight: '300' }}> (Public or Private)</Text></Text>
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
                
                <Feather name="upload" size={30} color="black" style={{ marginVertical: 7 }} />

                
              )}
              <Text style={styles.uploadText}>
                   <Text style={{ fontWeight: '500' }}>Browse</Text> to Begin Upload
              </Text>
            </TouchableOpacity>
            
          </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                onPress={toggleModal}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.buttonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createEvent}
                style={[styles.button, styles.createButton]}
              >
                <Text style={styles.buttonTextCreateEvent}>Create Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() =>
            scrollViewRef.current.scrollTo({ y: 0, animated: true })
          }
        >
          <Entypo name="home" size={35} color="white" />
         {/* <Text>Home</Text> */}
         
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.circleButton]}
          onPress={toggleModal}
        >
          <AntDesign name="pluscircleo" size={55} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goToProfile}>
          <Icon name="person" size={35} color="white" />
          
          {/* <Text>Profile</Text> */}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#EFECEC",
    padding: 16,

  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 40,
    
  },

  eventItem: {
    width: "43%",
    height: 150,
    borderWidth: 1,
    borderColor: "#cbd7f3",
    borderRadius: 20,
    marginBottom: 8,
    margin: 12,
    backgroundColor: "rgba(224, 174, 208, 0)",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  subheading: {
    position: 'absolute', // Resmin üzerine yerleştirin
    width: '100%', // Resmin genişliğine eşit olacak şekilde ayarlayın
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
    position: 'relative', // Subheading'in altında olmasını sağlamak için
    flex: 1, // Resmi genişletmek için flex kullanın
    width: '100%', // Set width to fill parent container
    height: '100%', // Set height to fill parent container
    justifyContent: "center",
    alignItems: "center",
    zIndex: -1,
  },
  createEvent: {
    fontSize: 30,
    textAlign: "center",
    margin: 30,
    marginTop: 90,
  },
  input: {
    width: "90%", // Width without units in React Native
    height: 65, // Height without units in React Native
    flexGrow: 0, // Use flexGrow property directly
    marginVertical: 9, // Margin for vertical spacing
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    margin: 15,
    padding: 15,
    fontSize: 20,
  },
  inputSearch: {
    height: 60, // Height without units in React Native
    flexGrow: 0, // Use flexGrow property directly
    marginVertical: 9, // Margin for vertical spacing
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    margin: 10,
    padding: 15,
    fontSize: 20,
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
    fontSize: 24,
    margin: 15,
  },

  onoffInput: {
    marginLeft: 15,
  },
  eventPhotoButton: {
    width: "90%",
    height: 150,
    flexGrow: 0,
    margin: "8.8px 167px 0 0",
    padding: "30px 7px 18px",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    margin: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  uploadText: {
    fontSize: 20,
    marginVertical: 7,
    fontWeight: "200",
  },
  eventPhoto: {},


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
  cancelButton: {
    width: "48%",
    height: 60,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#2460fd",
    justifyContent: "center",
    alignItems: "center",
    margin:30,
  },
  createButton: {
    width: "48%",
    height: 60,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#2460fd",
    justifyContent: "center",
    alignItems: "center",
    
  },
  buttonTextCancel: {
    color: "black",
    fontSize: 18,
  },
  buttonTextCreateEvent: {
    color: "white",
    fontSize: 18,
  },
});

export default WelcomeScreen;
