import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import firebase from 'firebase/compat'

const registration = () => {
    const [email, setEmail] = useState('') // State for email input
    const [password, setPassword] = useState('') // State for password input
    const [firstName, setFirstName] = useState('') // State for first name input
    const [lastName, setLastName] = useState('') // State for last name input

    // Function to register user
    registerUser = async(email,password,firstName,lastName)=>{

        // Creating user with email and password
        await firebase.auth().createUserWithEmailAndPassword(email,password).then(()=>{
            // Sending email verification
            firebase.auth().currentUser.sendEmailVerification({
                handleCodeInApp: true,
                url:'https://deneme-e322e.firebaseapp.com',
            })
            .then(() =>{
                alert('Verification email sent') // Alerting user about verification email
            }).catch((error) =>{
                alert(error.message) // Alerting user if sending verification email fails
            })
            .then(()=>{
                // Adding user details to Firestore after successful registration
                firebase.firestore().collection('users')
                .doc(firebase.auth().currentUser.uid)
                .set({
                    firstName,
                    lastName,
                    email
                })
            })
            .catch((error)=>{
                alert(error.message) // Alerting user if adding user details to Firestore fails
            })
        })
        .catch((error)=>{
            alert(error.message) // Alerting user if user registration fails
        })
    }

    return(
        <View style={styles.container}>
            <Text style={{fontWeight:'bold'}}>
                Register Here!!!
            </Text>
            <View>
                <TextInput
                    placeholder='First Name'
                    onChangeText={(firstName)=> setFirstName(firstName)} // Updating first name state
                    autoCorrect={false}
                />
                <TextInput
                    placeholder='Last Name'
                    onChangeText={(lastName)=> setLastName(lastName)} // Updating last name state
                    autoCorrect={false}
                />
                <TextInput
                    placeholder='Email'
                    onChangeText={(email)=> setEmail(email)} // Updating email state
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    placeholder='Password'
                    onChangeText={(password)=> setPassword(password)} // Updating password state
                    autoCorrect={false}
                    autoCapitalize='none'
                    secureTextEntry={true}
                />
            </View>
            <TouchableOpacity
                onPress={() =>  registerUser(email,password,firstName,lastName)} // Calling registerUser function on button press
                style={styles.button}
            >
                <Text style={{fontWeight:'bold'}}>Register</Text>
            </TouchableOpacity>
        </View>
    )
}

export default registration

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        marginTop: 20,
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5
    }
})
