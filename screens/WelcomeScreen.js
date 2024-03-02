
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { AuthContext } from '../store/auth-context';
import styles from './WelcomeScreen.scss' 

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
      <Text style={styles.title}>Welcome!</Text>
      <Text>You authenticated successfully!</Text>

      {/* Search Bar */}
      <TextInput style={styles.searchBar} placeholder="Search events" />

      {/* Grid Layout */}
      <View style={styles.gridContainer}>
        {/* Add your grid items here based on the number of events */}
        <View style={styles.gridItem}>
          {/* Content for the first grid item */}
        </View>
        <View style={styles.gridItem}>
          {/* Content for the second grid item */}
        </View>
        <View style={styles.gridItem}>
          {/* Content for the third grid item */}
        </View>
        {/* Add more grid items as needed */}
      </View>

      {/* Navigator */}
      <View style={styles.navigatorContainer}>
        <TouchableOpacity style={[styles.navigatorButton, styles.navigatorButtonDisabled]} disabled>
          <Text>Main Page</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navigatorButton, styles.navigatorButtonDisabled]} disabled>
          <Text>+ Button</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navigatorButton, styles.navigatorButtonDisabled]} disabled>
          <Text>Profile Button</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default WelcomeScreen;