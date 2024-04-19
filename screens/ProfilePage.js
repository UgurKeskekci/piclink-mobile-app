import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Alert } from "react-native";
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
});

export default ProfilePage;
