import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { AuthContext } from '../store/auth-context';
import Icon from 'react-native-vector-icons/Ionicons';

function WelcomeScreen() {
  const [fetchedMessage, setFetchedMesssage] = useState('');
  const authCtx = useContext(AuthContext);
  const token = authCtx.token;

  useEffect(() => {
    axios
      .get(
        'https://piclink-app-default-rtdb.europe-west1.firebasedatabase.app/message.json?auth=' +
          token
      )
      .then((response) => {
        setFetchedMesssage(response.data);
      });
  }, [token]);

  return (
    <View style={styles.rootContainer}>
      {/*  main content  */}
      <Text>Welcome to the App!</Text>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="home" size={30} color="blue" />
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="add" size={30} color="blue" />
          <Text></Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="person" size={30} color="blue" />
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },


  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(36, 96, 253, 0.10)',
  },
  navButton: {
    alignItems: 'center',
  },
});

export default WelcomeScreen;
