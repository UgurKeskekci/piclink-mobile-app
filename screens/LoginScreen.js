import { useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { StyleSheet, View, Text } from 'react-native';
import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { AuthContext } from '../store/auth-context';
import { login } from '../util/auth';
import { getAuth,createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

function LoginScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const user = getAuth().currentUser;
      if (user) { 
          await user.reload();
          if (user.emailVerified) {
            const token = await login(user.email, user.password);
            authCtx.authenticate(token);
          } else {
            console.log('Email is not verified');
          }
      }
    }, 1000); // Check every 5 seconds

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  async function loginHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      console.log('Logging in with email:', email); // Log email for debugging
      const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
      const user = userCredential.user;
      console.log(user)
      if (!user) {
        throw new Error('User not found');
      }
  
      if (!user.emailVerified) {
        Alert.alert(
          'Email not verified!',
          'Please verify your email before logging in.'
        );
        setIsAuthenticating(false);
        return;
      }

      const token = await user.getIdToken();
      authCtx.authenticate(token);
    } catch (error) {
      console.error('Login failed:', error); // Log detailed error message for debugging
      Alert.alert(
        'Authentication failed!',
        'Could not log you in. Please check your credentials or try again later!'
      );
      setIsAuthenticating(false);
    }
  }
  
  
  


  if (isAuthenticating) {
    return <LoadingOverlay message="Logging you in..." />;
  }

  return <AuthContent isLogin onAuthenticate={loginHandler} />;
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Example background color
  },
  exampleText: {
    fontSize: 20,
    color: '#333', // Example text color
  },
  // You can define more styles here
});


export default LoginScreen;
