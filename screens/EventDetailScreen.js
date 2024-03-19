import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const EventDetailScreen = ({ route }) => {
  const { eventDescription, eventName, eventPhoto } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: eventPhoto }} style={styles.image} />
      </View>
        <View style={styles.eventDesc}>
        <Text style={styles.title}>{eventName}</Text>
        <Text style={styles.description}>{eventDescription}</Text>
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
    flexDirection: 'row',
    margin: 10,    
    height: 150,
  },
  imageContainer: {
    justifyContent: 'center', 
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: "cover",
    borderRadius: 100,
    marginLeft: 10,
    marginTop:10,
    backgroundColor: 'gray',
  },
  eventDesc: {
    flexDirection: 'column',
    justifyContent: 'center', 
    paddingLeft: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
  },
  description: {
    width: 150,
    fontSize: 14,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginBottom: 20,
  },
  gridContainer: {
    width: '100%',
    marginHorizontal: "auto",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  item: {
    width: '32%',
    height: 130,
    backgroundColor: '#d9d9d9',
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventDetailScreen;
