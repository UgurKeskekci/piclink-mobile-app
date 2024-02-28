import React, { useContext, useState } from 'react';
import { Alert } from 'react-native';
import firebase from 'firebase/app'; // Import Firebase
import 'firebase/auth'; // Import Firebase Auth
import 'firebase/firestore'; // Import Firestore
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { AuthContext } from '../store/auth-context';
import { createUser } from '../util/auth';
import { firebaseConfig } from '../config';

firebase.initializeApp(firebaseConfig);

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authCtx = useContext(AuthContext);

  const signupHandler = async ({ email, password }) => {
    setIsAuthenticating(true);
    try {
      // Create user with email and password
      const token = await createUser(email, password);
      authCtx.authenticate(token);

      // Send email verification
      const user = firebase.auth().currentUser;
      await user.sendEmailVerification();

      Alert.alert('Success', 'Verification email sent');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (isAuthenticating) {
    return <LoadingOverlay message="Creating user..." />;
  }

  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;
