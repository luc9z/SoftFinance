// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC21RfzMS-OH5BNJGmgE9hxHKdC213lWJY",
  authDomain: "projetopiii.firebaseapp.com",
  projectId: "projetopiii",
  storageBucket: "projetopiii.appspot.com",
  messagingSenderId: "436200556169",
  appId: "1:436200556169:web:dd2cdad0b3f7fe95062858",
};

const firebaseApp = initializeApp(firebaseConfig)

const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)
const storage = getStorage(firebaseApp)

export { db, auth, storage }