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
} from "react-native";
import { AuthContext } from "../store/auth-context";
import Icon from "react-native-vector-icons/Ionicons";

function WelcomeScreen() {
  const [fetchedMessage, setFetchedMesssage] = useState("");
  const authCtx = useContext(AuthContext);
  const token = authCtx.token;

  const [isModalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");

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

  const createEvent = () => {
    // Validate input and perform event creation logic here
    const newEvent = {
      id: events.length + 1,
      name: eventName,
      description: eventDescription,
    };

    setEvents([...events, newEvent]);
    toggleModal();
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
          <TextInput
            style={styles.input}
            placeholder="Event Name"
            onChangeText={(text) => setEventName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Event Description"
            onChangeText={(text) => setEventDescription(text)}
          />
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
    alignItems: "center",
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
