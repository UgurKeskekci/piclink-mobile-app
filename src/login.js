import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import React, {useState} from 'react'
import { useNavigation } from '@react-navigation/native'
import { firebase } from '../config'

const login = () => {
    const navigation = useNavigation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    loginUser = async (email, password) => {
        try{
            await firebase.auth().signInWithEmailAndPassword(email,password)

        }catch (error){
            alert(error.message)

        }
    }

    return (
        <View style={styles.container}>
            <Text style={{fontWeight: 'bold', fontSize:26}}>
            Login
            </Text>
            <View style={{marginTop:40}}>
                <TextInput
                    style={styles.TextInput}
                    placeholder='Email'
                    onChangeText={(email) => setEmail(email)}
                    autoCorrect={false}
                    autoCapitalize='none'
                />
                <TextInput
                    style={styles.TextInput}
                    placeholder='Password'
                    onChangeText={(password) => setPassword(password)}
                    autoCorrect={false}
                    autoCapitalize='none'
                    secureTextEntry={true}
                />
            </View>
            <TouchableOpacity
            onPress={() => loginUser(email, password)}
            style={styles.button}
            >
                <Text style={{fontWeight:'bold', fontSize:22}}>
                    Login
                </Text>               
            </TouchableOpacity>
            <TouchableOpacity
            onPress={()=>navigation.navigate('registration')}
            style={{marginTop:20}}
            >
                <Text style={{fontWeight:'bold', fontSize:16}}>
                    Don't have an account? Register now
                </Text>               
            </TouchableOpacity>
       </View>
    )
}

export default login

const styles = StyleSheet.create({

})