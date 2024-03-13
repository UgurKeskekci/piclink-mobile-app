import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const EventDetailScreen = ({ route }) => {
  const { eventName, eventPhoto } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: eventPhoto }} style={styles.image} />
        <Text style={styles.title}>{eventName}</Text>
        <Text style={styles.description}>Event Description Place</Text>
      </View>
     
      <View style={styles.separator} />
      <View style={styles.separator} />
      <View style={styles.gridContainer}>
        <View style={styles.item}>
        <Text>Aloo</Text> 
        </View>
        <View style={styles.item}>
        <Text>Aloo</Text> 
        </View>
        <View style={styles.item}>
        <Text>Aloo</Text> 
        </View>
        <View style={styles.item}>
        <Text>Aloo</Text> 
        </View>
        <View style={styles.item}>
        <Text>Aloo</Text> 
        </View>
     
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 4,
    flexDirection: "column",
  },
  header: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
   
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: "cover",
    borderRadius: 100,
    marginLeft: 10,
    marginTop:10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  description: {
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 10,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginBottom: 20,
  },
  gridContainer: {
    marginHorizontal: "auto",
    width: 400,
    flexDirection: "row",
    flexWrap: "wrap"
  },
  item: {
    flex: 1,
    minWidth: 100,
    maxWidth: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",

    padding: 10,
    backgroundColor: "rgba(249, 180, 45, 0.25)",
    borderWidth: 1.5,
    borderColor: "#fff"
  },
});

export default EventDetailScreen;
