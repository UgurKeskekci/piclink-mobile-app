// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);