import React, { useContext, useState } from 'react';
import { Alert } from 'react-native';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { AuthContext } from '../store/auth-context';
import { createUser } from '../util/auth';
import { firebase } from '../config';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authCtx = useContext(AuthContext);

  const signupHandler = async ({ email, password }) => {
    setIsAuthenticating(true);
    try {
      // Create user with email and password

      // Send email verification
      const auth = getAuth(); // Get the Firebase auth instance
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Create user
      const user = userCredential.user; // Get the user object from userCredential
      await sendEmailVerification(user); // Send email verification

      Alert.alert('Success', 'Verification email sent');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsAuthenticating(false);
    }
    const token = await createUser(email, password);
    authCtx.authenticate(token);
  };

  if (isAuthenticating) {
    return <LoadingOverlay message="Creating user..." />;
  }

  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;
