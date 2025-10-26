// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlia1ssOaH0kgEACGX8dse3riP_Ox17yU",
  authDomain: "the-daren-nexus-db.firebaseapp.com",
  projectId: "the-daren-nexus-db",
  storageBucket: "the-daren-nexus-db.appspot.com",
  messagingSenderId: "516365825771",
  appId: "1:516365825771:web:8b19c202789f962b0f70ae",
  measurementId: "G-ZX564HPKY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
