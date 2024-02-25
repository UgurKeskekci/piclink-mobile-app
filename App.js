import { NavigationContainer } from '@react-navigation/native';
import { Header, createStackNavigator } from '@react-navigation/stack';
import React, {useState, useEffect} from 'react';
import {firebase} from "./config" // Assuming config file contains firebase initialization

// Importing components and screens
import login from './src/login';
import registration from './src/registration';
import dashboard from './src/dashboard';
import header from './components/header'; // Assuming this is a custom header component
import {Stack} from "@react-navigation/stack"; // Unused import
import { TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const Stack = createStackNavigator(); // Creating a stack navigator

// Main app component
function App() {
  const [initializing, setInitializing] = useState(true); // State to manage initialization
  const [user, setUser] = useState(); // State to manage user authentication status

  // Function to handle authentication state changes
  function onAuthStateChanged(user){
    setUser(user);
    if (initializing) setInitializing(false)
  }

  // Effect hook to subscribe to authentication state changes
  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Unsubscribing when component unmounts
  }, []);

  // If still initializing, return null
  if (initializing) return null;

  // If no user is authenticated, show login and registration screens
  if (!user){
    return(
      <Stack.Navigator>
        <Stack.Screen
          name='login'
          component={login}
        />
        <Stack.Screen
          name='registration'
          component={registration}
        />
      </Stack.Navigator>
    )
  }

  // If user is authenticated, show dashboard
  return(
    <Stack.Navigator>
      <Stack.Screen
          name='dashboard'
          component={dashboard}
        />
    </Stack.Navigator>
  );
  
}

// Root component wrapping App with NavigationContainer
export default() => {
  return (
    <NavigationContainer>
      <App/>
    </NavigationContainer>
  )
}
