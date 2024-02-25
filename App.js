import { NavigationContainer } from '@react-navigation/native';
import { Header, createStackNavigator } from '@react-navigation/stack';
import React, {useState, useEffect} from 'react';
import {firebase} from "./config"

import login from './src/login';
import registration from './src/registration';
import dashboard from './src/dashboard';
import header from './components/header';
import {Stack} from "@react-navigation/stack";
import { TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

/*const Home = () => {
    const todoRef = firebase.firestore().collection('newData');
    const [addData, setAddData] = useState('');

    const addField = () => {
      if(addData && addData.length > 0){
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const data = {
          heading: addData,
          createdAt: timestamp
        };
        todoRef
          .add(data)
          .then(()=>{
            setAddData('');
            Keyboard.dismiss();
          })
          .catch((erorr) => {
            alert(error);
          })

      }
    }

    return(
      <View style={{flex:1, justifyContent:'center'}}>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder='Add some text'
            placeholderTextColor='#aaaaaa'
            onChangeText={(heading) => setAddData()}
            value={addData}
            multiline={true}
            underlineColorAndroid='transparent'
            autoCapitalize='none'
          />
          <TouchableOpacity style={styles.button} onPress={addField}>
              <Text style={styles.buttonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
}
*/


function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  function onAuthStateChanged(user){
    setUser(user);
    if (initializing) setInitializing(false)
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) return null;

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

  return(
    <Stack.Navigator>
      <Stack.Screen
          name='dashboard'
          component={dashboard}
        />
    </Stack.Navigator>
  );
  
}
export default() => {
  return (
    <NavigationContainer>
      <App/>
    </NavigationContainer>
  )
}
