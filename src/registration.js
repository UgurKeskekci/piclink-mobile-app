import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import firebase from 'firebase/compat'


const registration = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    registerUser = async(email,password,firstName,lastName)=>{

        await firebase.auth().createUserWithEmailAndPassword(email,password).then(()=>{
            firebase.auth().currentUser.sendEmailVerification({
                handleCodeInApp: true,
                url:'https://deneme-e322e.firebaseapp.com',
            })
            .then(() =>{
                alert('Verification email sent')
            }).catch((error) =>{
                alert(error.message)
            })
            .then(()=>{
                firebase.firestore().collection('users')
                .doc(firebase.auth().currentUser.uid)
                .set({
                    firstName,
                    lastName,
                    email
                })
            })
            .catch((error)=>{
                alert(error.message)
            })
        })
        .catch((error)=>{
            alert(error.message)
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
                    onChangeText={(firstName)=> setLastName(firstName)}
                    autoCorrect={false}
                />
                <TextInput
                    placeholder='Last Name'
                    onChangeText={(lastName)=> setLastName(lastName)}
                    autoCorrect={false}
                />
                <TextInput
                    placeholder='Email'
                    onChangeText={(email)=> setLastName(email)}
                    autoCorrect={false}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    placeholder='Password'
                    onChangeText={(password)=> setLastName(password)}
                    autoCorrect={false}
                    autoCapitalize='none'
                    secureTextEntry={true}
                />
            </View>
            <TouchableOpacity
                onPress={() =>  registerUser(email,password,firstName,lastName)}
                style={styles.button}
            >
                <Text style={{fontWeight:'bold'}}>Register</Text>
            </TouchableOpacity>
        </View>
    )
}

export default registration