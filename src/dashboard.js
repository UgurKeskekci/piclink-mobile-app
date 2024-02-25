import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { firebase } from '../config'

const dashboard = () => {
    const [name, setName] = useState('') // State to store user's name

    useEffect(()=>{
        // Fetching user data from Firestore when component mounts
        firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid).get()
        .then((snapshot) =>{
            if(snapshot.exists){
                setName(snapshot.data()) // Setting user's name in state if data exists
            }
            else{
                console.log('User does not exist') // Logging if user data does not exist
            }
        })
    }, []) // Empty dependency array to run effect only once when component mounts

    return (
        <SafeAreaView>
            <Text> 
                hello, {name.firstName} {/* Displaying user's name */}
            </Text>
            <TouchableOpacity
                onPress={()=> firebase.auth().signOut()} // Signing out user on button press
            >
                <Text>
                    Sign Out
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    )

}

export default dashboard
