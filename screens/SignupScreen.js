import { useContext, useState } from 'react';
import { Alert } from 'react-native';

import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { AuthContext } from '../store/auth-context';
import { createUser } from '../util/auth';

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authCtx = useContext(AuthContext);

  async function signupHandler({ email, password }) {
    setIsAuthenticating(true);
    try {
      

      registerUser = async(email,password)=>{
      const token = await createUser(email, password);
      authCtx.authenticate(token);
        // Creating user with email and password
        await firebase.auth().createUserWithEmailAndPassword(email,password).then(()=>{
            // Sending email verification
            firebase.auth().currentUser.sendEmailVerification({
                handleCodeInApp: true,
                url:'https://piclink-app.firebaseapp.com',
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

    } catch (error) {
      Alert.alert(
        'Authentication failed',
        'Could not create user, please check your input and try again later.'
      );
      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="Creating user..." />;
  }

  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;
