import React, { useState } from "react";
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
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import QRCode from "react-native-qrcode-svg"; // Import QRCode

const EventDetailScreen = ({ route }) => {
  const { eventDescription, eventName, eventPhoto } = route.params;
  const navigation = useNavigation();

  const [selectedImages, setSelectedImages] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [photoDescription, setPhotoDescription] = useState("");
  const [gridImages, setGridImages] = useState([]); 
  const [generatedQRCode, setGeneratedQRCode] = useState(null);

  const goToProfile = () => {
    navigation.navigate("Profile");
  };

  const createQRCode = () => {
    const qrData = "Event: " + eventName + "\nDescription: " + eventDescription;
    setGeneratedQRCode(qrData);
    setModalVisible(false);
  };
  
  
  const pickImage = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      multiple: true, 
    });

    if (!pickerResult.cancelled) {
      const newSelectedImages = pickerResult.assets.map((asset) => asset.uri);
      setSelectedImages([...selectedImages, ...newSelectedImages]);
    }
  };

  return (

    <View style={styles.container}>
      {/* INFO PART TITLE DESCRIPTION PHOTO ETC. */}


      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.triggerButton}
      >
        <Text style={styles.triggerButtonText}>Show Popup</Text>
      </TouchableOpacity>
      <Modal
  animationType="slide"
  transparent={true}
  visible={isModalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.centeredView}>
    <View style={styles.modalView}>
      {/* Updated onPress event handler */}
      <Button title="Create QR" onPress={() => createQRCode()} />
      
      <Button title="Copy Invitation" onPress={() => console.log('Copy Invitation Pressed')} />
      {/* Close Button */}
      {/* Close Button as "X" */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
{generatedQRCode && (
        <View style={styles.qrCodeContainer}>
          <QRCode
            value={generatedQRCode}
            size={200}
          />
        </View>
      )}

    

      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: eventPhoto }} style={styles.image} />
        </View>
        <View style={styles.eventDesc}>
          <Text style={styles.title}>{eventName}</Text>
          <Text style={styles.description}>{eventDescription}</Text>
        </View>
      </View>

      {/* BUTTONS SECTION UNDER INFO PART */}
      <View style={styles.separator}>
        <View
          style={{
            height: 60,
            borderBottomColor: "black",
            backgroundColor: "rgba(36, 96, 253, 0.30)",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Icon
            name="apps-outline"
            size={35}
            color="black"
            style={{ paddingLeft: 30 }}
          />
          <Icon name="folder-open-outline" size={35} color="black" />
          <Icon
            name="pricetag-outline"
            size={35}
            color="black"
            style={{ paddingRight: 30 }}
          />
        </View>
      </View>

      <View style={styles.separator2}>
        <View
          style={{
            height: 40,
            borderBottomWidth: 1,
            borderBottomColor: "black",
            backgroundColor: "rgba(36, 96, 253, 0.1)",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
            <Icon
                name="search-outline"
                size={15}
                color="black"
                style={{ paddingRight: 2, paddingLeft:10 }}
              />
             <Text style={{ paddingRight: 40 }}>Search</Text>
        </View>
         

        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
            <Icon
                name="funnel-outline"
                size={15}
                color="black"
                style={{ paddingRight: 2 }}
              />
              <Text style={{ paddingRight: 20 }}>Sort</Text>
        </View>
         
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
             <Icon
                 name="download-outline"
                 size={15}
                 color="black"
                 style={{ paddingRight: 2 }}
               />
              <Text style={{ paddingRight: 20 }}>Download</Text>
        </View>
        
        </View>
      </View>

      {/* GRID LAYOUT FOR PHOTOS */}
      <View style={styles.gridContainer}>
        {selectedImages.map((imageUri, index) => (
          <Image
            key={index}
            source={{ uri: imageUri }}
            style={styles.selectedImage}
          />
        ))}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="home" size={30} color="blue" />
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.circleButton]}
          onPress={pickImage}
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goToProfile}>
          <Icon name="person" size={30} color="blue" />
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    margin: 10,
    height: 150,
  },
  imageContainer: {
    justifyContent: "center",
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: "cover",
    borderRadius: 100,
    marginLeft: 10,
    marginTop: 10,
  },
  eventDesc: {
    flexDirection: "column",
    justifyContent: "center",
    paddingLeft: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
  },
  description: {
    width: 150,
    fontSize: 14,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  
  gridContainer: {
    width: "100%",
    marginHorizontal: "auto",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  item: {
    width: "32%",
    height: 130,
    backgroundColor: "#d9d9d9",
    margin: 2,
    justifyContent: "center",
    alignItems: "center",
  },
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
    width: 65,
    height: 65,
    backgroundColor: "rgba(36, 96, 253, 1)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 90,
  },
  selectedImage: {
    width: "31%",
    height: 135,
    resizeMode: "cover",
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },

  // Add these to your StyleSheet object
triggerButton: {
  position: 'absolute',
  right: 10,
  top: 10,
  backgroundColor: 'blue', // Feel free to change the color
  padding: 8,
  borderRadius: 20,
  zIndex: 10, // Make sure the button is above other elements
},
triggerButtonText: {
  color: '#fff',
  fontSize: 20,
},
centeredView: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 22
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
    height: 2
  },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5
},
closeButton: {
  position: 'absolute',
  top: 10,
  right: 10,
  backgroundColor: 'transparent',
  padding: 8,
},
closeButtonText: {
  color: 'blue',
  fontSize: 24,
},

});

export default EventDetailScreen;
