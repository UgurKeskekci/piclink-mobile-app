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

function WelcomeScreen() {
  const [fetchedMessage, setFetchedMesssage] = useState("");
  const authCtx = useContext(AuthContext);
  const token = authCtx.token;

  const [isModalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventProfilePhoto, setEventProfilePhoto] = useState(null); // New state for event profile photo

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (result && !result.cancelled && result.uri) {
        // Update selected photos first
        setSelectedPhotos((prevPhotos) => [...prevPhotos, { uri: result.uri }]);
        setSelectedPhotoIndex((prevIndex) => prevIndex === null ? 0 : prevIndex);
  
        console.log("Selected Photos after choosing:", selectedPhotos);
        console.log("Selected Photo Index after choosing:", selectedPhotoIndex);
  
        // Update event profile photo state
        setEventProfilePhoto(result.uri);
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
    }
  };
  
  const createEvent = () => {
    const newEvent = {
      id: events.length + 1,
      name: eventName,
      description: eventDescription,
      profilePhoto: eventProfilePhoto,
    };
  
    // Use setState callback to ensure the correct order of state updates
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setEventName("");
    setEventDescription("");
  
    // Reset selected photos and selected index after the state is updated
    setSelectedPhotos([]);
    setSelectedPhotoIndex(null);
  
    // Reset event profile photo state
    setEventProfilePhoto(null);
  
    // Log the updated state
    console.log("Creating Event with Photos:", selectedPhotos);
    console.log("Selected Photo Index:", selectedPhotoIndex);
  
    toggleModal();
  };
  
  useEffect(() => {
    axios
      .get(
        "https://piclink-app-default-rtdb.europe-west1.firebasedatabase.app/message.json?auth=" +
          token
      )
      .then((response) => {
        setFetchedMesssage(response.data);
      });
  }, [token]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  

  return (
    <View style={styles.rootContainer}>
      {/*  main content  */}
      <Text>Welcome to the App!</Text>

      {/* Events in a Grid */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text>{item.name}</Text>
            <Text>{item.description}</Text>
            {item.profilePhoto ? (
              <Image
                source={{ uri: item.profilePhoto }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
            ) : (
              <Text>No Photo</Text>
            )}
          </View>
        )}
      />

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="home" size={30} color="blue" />
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={toggleModal}>
          <Icon name="add" size={30} color="blue" />
          <Text></Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="person" size={30} color="blue" />
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <Text>Create Event</Text>
          <Text>Event Title</Text>
          <TextInput
            style={styles.input}
            placeholder="GetTogether, wedding, meeting"
            onChangeText={(text) => setEventName(text)}
          />
          <Text>Event Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Share your moments!"
            onChangeText={(text) => setEventDescription(text)}
          />

          <View style={styles.switchContainer}>
            <Text>Private Event</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>

          <View>
            <Text>Add Event Profile Photo</Text>
            <TouchableOpacity
            
              style={styles.eventPhoto}
              onPress={() => {
                console.log("TouchableOpacity Pressed");
                handleImagePicker();
              }}
            >
              {selectedPhotos.length > 0 ? (
                <Image
                  source={{ uri: selectedPhotos[selectedPhotoIndex].uri }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                />
              ) : (
                <Icon name="add" size={30} color="blue" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtonsContainer}>
            <Button title="Create" onPress={createEvent} />
            <Button title="Cancel" onPress={toggleModal} />
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
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    minWidth: 150,
    maxWidth: 150,
  },
  bottomNavBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(36, 96, 253, 0.10)",
  },
  navButton: {
    alignItems: "center",
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
