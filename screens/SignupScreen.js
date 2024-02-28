import React, { useContext, useState } from 'react';
import { Alert } from 'react-native';
import firebase from 'firebase/app'; // Import Firebase
import 'firebase/auth'; // Import Firebase Auth
import 'firebase/firestore'; // Import Firestore

import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { AuthContext } from '../store/auth-context';
import { createUser } from '../util/auth';

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authCtx = useContext(AuthContext);

  const signupHandler = async ({ email, password }) => {
    setIsAuthenticating(true);
    try {
      // Create user with email and password
      const token = await createUser(email, password);
      authCtx.authenticate(token);
      
      // Sending email verification
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      await userCredential.user.sendEmailVerification();

      Alert.alert('Success', 'Verification email sent');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsAuthenticating(false);
      Alert.alert(
        'Authentication failed',
        'Could not create user, please check your input and try again later.'
      );
    }
  };

  if (isAuthenticating) {
    return <LoadingOverlay message="Creating user..." />;
  }

  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;
