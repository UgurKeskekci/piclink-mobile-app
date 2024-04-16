import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { getFirestore, FirestoreSettings, Firestore  } from 'firebase/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCFbrOkpltGJabMYcPnzJ7RDxN67IWjXiM",
  authDomain: "piclink-app.firebaseapp.com",
  databaseURL: "https://piclink-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "piclink-app",
  storageBucket: "piclink-app.appspot.com",
  messagingSenderId: "595788129992",
  appId: "1:595788129992:web:8878d54692495cd509a7fd",
  measurementId: "G-FV44LB1KGG"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

export { app, db, storage };