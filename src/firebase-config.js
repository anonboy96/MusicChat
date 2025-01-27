import { initializeApp } from "firebase/app";
import {getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
const firebaseConfig = {
  apiKey: "AIzaSyCalyX7ABhCmY3JCXfKsCR1B3qxv1G-PeM",
  authDomain: "musictogether-ecc51.firebaseapp.com",
  databaseURL: "https://musictogether-ecc51-default-rtdb.firebaseio.com",
  projectId: "musictogether-ecc51",
  storageBucket: "musictogether-ecc51.firebasestorage.app",
  messagingSenderId: "1067952705472",
  appId: "1:1067952705472:web:b92ba68647a4b9c5d64225",
  measurementId: "G-PPTK3L3LMN"
  };
  

  const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth(app)
export {db,auth}