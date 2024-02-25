import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState,useEffect } from 'react'
import {firebase } from '../config'

const dashboard = () => {
    const [name, setName] = useState('')

    useEffect(()=>{
        firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid).get()
        .then((snapshot) =>{
            if(snapshot.exists){
                setName(snapshot.data())
            }
            else{
                console.log('User does not exist')
            }
        })
    }, [])

    return (
        <SafeAreaView>
            <Text> 
                hello, {name.firstName}
            </Text>
            <TouchableOpacity
                onPress={()=> firebase.auth().signOut()}
            >
                <Text>
                    Sign Out
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    )

}

export default dashboard