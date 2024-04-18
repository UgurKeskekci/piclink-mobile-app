import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, Alert, Button, TextInput, TouchableOpacity, Image } from "react-native";
import { AuthContext } from "../store/auth-context";
import Icon from "react-native-vector-icons/Ionicons";
import { getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';

const ProfilePage = () => {
  const authCtx = useContext(AuthContext);
  const [userEmail, setUserEmail] = useState("");
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState(""); // New state for inputting new username
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        // User is signed in
        setUserEmail(user.email);
        // Fetch username from AsyncStorage
        const storedUsername = await AsyncStorage.getItem("username");
        setUsername(storedUsername || "User");
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.cancelled) {
      const uri = result.assets[0].uri;
      const imageName = uri.substring(uri.lastIndexOf("/") + 1);
      console.log("Selected image URI:", uri);
      console.log("Image name:", imageName);

      // Update the userProfilePic state with the selected image URI
      setUserProfilePic(uri);
    }
  };

  const handleSetUsername = () => {
    setUsername(newUsername);
    AsyncStorage.setItem("username", newUsername);
    setNewUsername("");
    console.log("Username updated successfully:", newUsername);
  };

  const handleCancelChangePassword = () => {
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
      <TouchableOpacity onPress={pickImage} style={styles.iconContainer}>
        {userProfilePic ? (
          <Image source={{ uri: userProfilePic }} style={styles.profilePicture} />
        ) : (
          <Icon name="person-add-outline" size={100} color="blue" />
        )}
      </TouchableOpacity>
      <Text style={styles.username}>Username: {username}</Text>
      <Text style={styles.userInfo}>Email: {userEmail}</Text>
      <TextInput
        style={styles.input}
        placeholder="New Username"
        value={newUsername}
        onChangeText={setNewUsername}
      />
      <View style={styles.buttonContainer}>
        <View style={styles.buttonGroup}>
          <Button title="Set Username" onPress={handleSetUsername} />
          <Button title="Change Password" onPress={handleChangePassword} />
        </View>
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
            <View style={styles.buttonGroup}>
              <Button title="Save" onPress={handleChangePassword} />
              <Button title="Cancel" onPress={handleCancelChangePassword} />
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: "absolute",
    top: 16, 
    left: "50%",
    transform: [{ translateX: -40 }], 
    padding: 8,
    marginBottom: 10, 
  },
  userInfo: {
    fontSize: 18,
    marginBottom: 5,
  },
  username: {
    fontSize: 18,
    marginBottom: 5,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  input: {
    width: "100%",
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
});

export default ProfilePage;


