import React, { useContext, useState, useEffect } from 'react';
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

const EMAIL_VERIFICATION_TIMEOUT = 300000 * 1000;


function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authCtx = useContext(AuthContext);
  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const user = getAuth().currentUser;
        console.log('Current User:', user);
        if (user) {
          await user.reload(); // Reload user data to get the latest email verification status
          console.log('User Reloaded:', user);
          if (user.emailVerified) {
            // Email is verified
            console.log('Email is verified');
            Alert.alert('Success', 'Email verified!');
            // Trigger user creation here
            const token = await createUser(user.email, user.password);
            authCtx.authenticate(token);
          } else {
            console.log('Email is not verified');
          }
        }
      } catch (error) {
        console.error('Error checking email verification status:', error);
      }
    };
    handleEmailVerification();
  }, []);

  const signupHandler = async ({ email, password }) => {
    setIsAuthenticating(true);
    try {
      // Create user with email and password
      const auth = getAuth(); // Get the Firebase auth instance
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Create user
      const user = userCredential.user; // Get the user object from userCredential
      console.log('User created:', user);
      await sendEmailVerification(user); // Send email verification

      console.log('Verification email sent');
      Alert.alert('Success', 'Verification email sent');

        // Set timeout for email verification
        setTimeout(async () => {
          const currentUser = getAuth().currentUser;
          if (currentUser && !currentUser.emailVerified) {
            // Delete user if email is not verified after timeout
            await currentUser.delete();
            console.log('User deleted due to email verification timeout');
    
            await AsyncStorage.removeItem('token')
            await auth.signOut();
            console.log('User logged out due to email verification timeout');
            
          }
        }, EMAIL_VERIFICATION_TIMEOUT);

    } catch (error) {
      console.error('Error signing up:', error.message);
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
