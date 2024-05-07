import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, Alert, Button, TextInput, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { AuthContext } from "../store/auth-context";
import Icon from "react-native-vector-icons/Ionicons";
import { getAuth, updatePassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { Feather } from '@expo/vector-icons';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

const ProfilePage = () => {
  const authCtx = useContext(AuthContext);
  const [userEmail, setUserEmail] = useState("");
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState(""); // New state for inputting new username
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation(); // Get the navigation object
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
        // Set username to the first 6 characters of the email address
        setUsername(user.email.substring(0, 6));
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
  

  const deleteImage = () => {
    setUserProfilePic(null); // Resets the userProfilePic state, effectively removing the image
  };

  const goToHome = () => {
    navigation.navigate("Welcome");
  };

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

  const handleChangePassword = async () => {
    if (!changePasswordMode) {
      setChangePasswordMode(true);
    } else {
      if (newPassword !== repeatNewPassword) {
        Alert.alert("Error", "New password and repeat new password do not match.");
      } else {
        const auth = getAuth();
        const user = auth.currentUser;

        try {
          await updatePassword(user, newPassword);
          Alert.alert("Success", "Password changed successfully.");
          setCurrentPassword("");
          setNewPassword("");
          setRepeatNewPassword("");
          setChangePasswordMode(false);
        } catch (error) {
          console.error("Error updating password:", error);
          Alert.alert("Error", "Failed to update password. Please try again later.");
        }
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
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
     <View style={styles.topBar}>
      <TouchableOpacity onPress={pickImage} style={styles.iconContainer}>
        {userProfilePic ? (
          <View>
            <TouchableOpacity onPress={deleteImage} style={styles.deleteButton}>
              <AntDesign name="closecircleo" size={18} color="black" style={{alignSelf: 'flex-end',}}/>
            </TouchableOpacity>
            <Image source={{ uri: userProfilePic }} style={styles.profilePicture} />
          </View>
        ) : (
          <View style={styles.profilePhotoContainer}>
            <Icon name="person-add-outline" size={80} color="#6b92ed"  style={styles.personIcon} />
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={styles.username}>Username: {username}</Text>
        <Text style={styles.userInfo}>Email: {userEmail}</Text>
      </View>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Preferred Username"
          value={newUsername}
          onChangeText={setNewUsername}
        />
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonGroup}>
          <Button title="Set Username" onPress={handleSetUsername} />
          <Button title="Change Password" onPress={handleChangePassword} />
        </View>
        {changePasswordMode && (
          <View style={styles.changeGroup}>
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
            </View>
        )}
      </View>
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton} onPress={goToHome}>
          <Entypo name="home" size={35} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.circleButton]}
          onPress={pickImage}
        >
          {/* Add icon here if needed */}
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goToProfile}>
          <Icon name="person" size={35} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  topBar: {
    flexDirection: "row",
  },
  iconContainer: {
    alignItems: "flex-start",
    padding: 30,
  },

  profilePhotoContainer: {
    borderWidth: 1,
    padding: 20,
    borderRadius: 100,
    borderColor: "#6b92ed",
  },
  textContainer:{
    margin: 15,
    justifyContent: "center",
  },
  userInfo: {
    fontSize: 18,
    marginBottom: 15,
  },
  username: {
    fontSize: 18,
    marginBottom: 5,
    left: 0,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  inputContainer: {
    alignItems: "center",
    
  },
  input: {
    width: "85%",
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
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  changeGroup: {
    width: "100%",
    alignItems: "center",
    marginTop: 30,

  },
  personIcon: {
    alignItems: "center",
    justifyContent: "center",
  },

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
  profilePhoto: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfilePage;