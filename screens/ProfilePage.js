import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { AuthContext } from "../store/auth-context";
import Icon from "react-native-vector-icons/Ionicons";

const ProfilePage = () => {
  const authCtx = useContext(AuthContext);
  const [userEmail, setUserEmail] = useState("");
  const [userProfilePic, setUserProfilePic] = useState(null);

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
