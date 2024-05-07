import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "../../config";
import FlatButton from "../ui/FlatButton";
import AuthForm from "./AuthForm";
import { Colors } from "../../constants/styles";
import QRScanner from "../../screens/QRScanner"; // Import your QRScanner component
import GuestScreen from "../../screens/GuestScreen";
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

function AuthContent({ isLogin, onAuthenticate }) {
  const navigation = useNavigation();

  const [credentialsInvalid, setCredentialsInvalid] = useState({
    email: false,
    password: false,
    confirmEmail: false,
    confirmPassword: false,
  });
  function handleRemoveEvents() {
    // Assuming you have the user ID stored in a variable
    const userId = "xHEwt6Q7Q9diJoCCpfRdLgP9aIw1";
    
    // Reference to the events under the specific user
    const eventsRef = db.collection(`/users/${userId}/events`);
    
    // Get all documents under the events collection
    eventsRef.get()
      .then(querySnapshot => {
        // Iterate through each document
        querySnapshot.forEach(doc => {
          // Delete the document
          doc.ref.delete()
            .then(() => {
              console.log("Event deleted successfully");
            })
            .catch(error => {
              console.error("Error deleting event:", error);
              // Handle error if needed
            });
        });
      })
      .catch(error => {
        console.error("Error getting documents:", error);
        // Handle error if needed
      });
  }
  function switchAuthModeHandler() {
    if (isLogin) {
      navigation.replace("Signup");
    } else {
      navigation.replace("Login");
    }
  }

  function submitHandler(credentials) {
    let { email, confirmEmail, password, confirmPassword } = credentials;

    email = email.trim();
    password = password.trim();

    const emailIsValid = email.includes("@");
    const passwordIsValid = password.length > 6;
    const emailsAreEqual = email === confirmEmail;
    const passwordsAreEqual = password === confirmPassword;

    if (
      !emailIsValid ||
      !passwordIsValid ||
      (!isLogin && (!emailsAreEqual || !passwordsAreEqual))
    ) {
      Alert.alert("Invalid input", "Please check your entered credentials.");
      setCredentialsInvalid({
        email: !emailIsValid,
        confirmEmail: !emailIsValid || !emailsAreEqual,
        password: !passwordIsValid,
        confirmPassword: !passwordIsValid || !passwordsAreEqual,
      });
      return;
    }
    onAuthenticate({ email, password });
  }

  // FORGOT PASSWORD SECTION===========================================

  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] =
    useState(false);
  const [email, setEmail] = useState("");
  const [isExistingEventModalVisible, setExistingEventModalVisible] =
    useState(false);
  function handleForgotPassword() {
    setForgotPasswordModalVisible(true);
  }

  function handleSendButton() {
    Alert.alert(
      "Reset Password",
      "The reset link has been sent to your email address."
    );
    setForgotPasswordModalVisible(false);
  }

  const [existingEventInput, setExistingEventInput] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const toggleExistingEventModal = () => {
    handleRemoveEvents();
    setExistingEventModalVisible(!isExistingEventModalVisible);
  };

  const [scannedEventId, setScannedEventId] = useState(null);



  const generateRandomUserId = () => {
    return Math.random().toString(36).substring(2);
  };

  function handleQRScanned(data) {
    setScannedEventId(data);
   
  }

  useEffect(() => {
    if (scannedEventId) {
      // Navigate to the EventDetailScreen within the current stack
      navigation.navigate('Guest', { eventId: scannedEventId });
      setExistingEventModalVisible(false);
    }
  }, [scannedEventId]);
  

  function handleContinueAsGuest() {
    toggleExistingEventModal();
  }



  return (
    <View style={styles.authContent}>
      <Image
        style={styles.welcomeLogo}
        source={require("../../assets/welcome.png")}
      />
      <AuthForm
        isLogin={isLogin}
        onSubmit={submitHandler}
        credentialsInvalid={credentialsInvalid}
      />
      <View style={styles.buttons}>
        <FlatButton onPress={switchAuthModeHandler}>
          {isLogin ? "Create a new user" : "Log in instead"}
        </FlatButton>
        <FlatButton onPress={handleForgotPassword}>Forgot password?</FlatButton>
        <TouchableOpacity
          onPress={toggleExistingEventModal}
          style={styles.continueGuest}
        >
          <Text style={{ textDecorationLine: "underline" }}>
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isExistingEventModalVisible}
        onRequestClose={toggleExistingEventModal}
      >
        <View style={styles.addEventModal}>
          <QRScanner onQRScanned={handleQRScanned} />

          <View style={styles.addEventButtons}>
            <TouchableOpacity
              onPress={toggleExistingEventModal}
              style={styles.cancelButton}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={forgotPasswordModalVisible}
        onRequestClose={() => {
          setForgotPasswordModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => setForgotPasswordModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text>Enter your email address:</Text>
              <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                placeholder="Email Address"
              />
              <Button title="Send" onPress={handleSendButton} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

export default AuthContent;

const styles = StyleSheet.create({
  authContent: {
    marginTop: "10%",
    marginHorizontal: 32,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "black",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  buttons: {
    marginTop: 8,
  },
  continueGuest: {
    position: "absolute",
    bottom: -100, // Adjust the value to move the text up or down
    alignSelf: "center", // Center the text horizontally
  },
  welcomeLogo: {
    width: 300,
    height: 200,
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
  input: {
    height: 40,
    width: "100%",
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },

  addEventModal: {
    marginTop: 100,
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#EFECEC",
    padding: 12,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#EFECEC",
    padding: 16,
  },
  addEventButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },

  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 20,
  },
  input: {
    width: "90%", // Width without units in React Native
    height: "7%", // Height without units in React Native
    flexGrow: 0, // Use flexGrow property directly
    marginVertical: 9, // Margin for vertical spacing
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    margin: 15,
    padding: 15,
    fontSize: 18,
  },
  inputText: {
    fontSize: 20,
    margin: 15,
  },
});
