import React from 'react';
import { View, Text, Image, Button, TouchableOpacity, StyleSheet } from 'react-native';

const MyScreen = ({ navigation }) => {
  const imageUrl = require('../assets/homePage.png'); // Update the path with your image

  return (
    <View style={styles.container}>
      {/* Image */}
      <Image source={imageUrl} style={styles.image} />

   
      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <View style={styles.button}>
          <Button title="Login" onPress={() => navigation.navigate('LoginScreen')} />
        </View>
        <View style={styles.button}>
          <Button title="Signup" onPress={() => navigation.navigate('SignupScreen')} />
        </View>
      </View>

      {/* Clickable Text */}
      <TouchableOpacity onPress={() => console.log('')} style={styles.textContainer}>
        <Text style={styles.text}>Continue as a guess...</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    resizeMode: 'cover',
    width: '100%',
    height: '50%',
  },
  buttonsContainer: {
    position: 'absolute',
    top: '50%', 
    width: '100%',
    alignItems: 'center',
  },
  button: {
    marginVertical: 10,
  },
  textContainer: {
    position: 'absolute',
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textDecorationLine: 'underline',
    color: 'blue',
  },
});

export default MyScreen;
