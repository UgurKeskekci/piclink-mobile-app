import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Alert, Button, TextInput } from "react-native";
import { AuthContext } from "../store/auth-context";
import Icon from "react-native-vector-icons/Ionicons";
import { getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfilePage = () => {
  const authCtx = useContext(AuthContext);
  const [userEmail, setUserEmail] = useState("");
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user email and UID on component mount
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        // User is signed in
        setUserEmail(user.email);
        // Get UID asynchronously
        const uid = await fetchUserUID(user);
        if (uid) {
          // Store UID in AsyncStorage
          await AsyncStorage.setItem("uid", uid);
        }
        setIsLoading(false);
      } else {
        // No user is signed in
        console.log("No user is signed in.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoading(false);
      Alert.alert("Error", "Failed to fetch user data. Please try again later.");
    }
  };

  const fetchUserUID = async (user) => {
    try {
      // Simulate fetching UID from some asynchronous source (e.g., Firebase)
      // Here you would replace this with actual code to fetch the UID
      return new Promise((resolve) => {
        // Simulating async operation
        setTimeout(() => {
          resolve(user.uid); // Resolve with the user's UID
        }, 1000); // Simulate 1 second delay
      });
    } catch (error) {
      console.error("Error fetching UID:", error);
      return null;
    }
  };

  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");

  const handleChangePassword = () => {
    if (!changePasswordMode) {
      setChangePasswordMode(true);
    } else {
      if (newPassword !== repeatNewPassword) {
        Alert.alert("Error", "New password and repeat new password do not match.");
      } else {
       
        console.log("New Password:", newPassword);
        Alert.alert("Success", "Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setRepeatNewPassword("");
        setChangePasswordMode(false);
      }
    }
  };

  const handleCancelChangePassword = () => {
    // Reset fields and exit change password mode
    setCurrentPassword("");
    setNewPassword("");
    setRepeatNewPassword("");
    setChangePasswordMode(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Icon name="person-add-outline" size={80} color="blue" />
      <Text style={styles.userInfo}>Email: {userEmail}</Text>
      {!changePasswordMode && (<Button title="Change Password" onPress={handleChangePassword} />)}
      {changePasswordMode && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Repeat New Password"
            value={repeatNewPassword}
            onChangeText={setRepeatNewPassword}
            secureTextEntry
          />
          <View style={styles.buttonContainer}>
            <Button title="Save" onPress={handleChangePassword} />
            <Button title="Cancel" onPress={handleCancelChangePassword} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  userInfo: {
    fontSize: 18,
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default ProfilePage;
