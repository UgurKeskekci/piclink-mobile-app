import firebase from 'firebase/compat/app'; // Importing Firebase app
import 'firebase/compat/auth'; // Importing Firebase authentication module
import 'firebase/compat/firestore'; // Importing Firestore module

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyCigtHebWYDdLCvhJqjZqwHHOX1cYk_j4Y",
    authDomain: "deneme-e322e.firebaseapp.com",
    projectId: "deneme-e322e",
    storageBucket: "deneme-e322e.appspot.com",
    messagingSenderId: "442970372751",
    appId: "1:442970372751:web:c947b39b46d093f9748efa",
    measurementId: "G-PJG2FK8EK3"
};

// Initializing Firebase app if not already initialized
if (!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
}

export { firebase }; // Exporting Firebase for use in other files



