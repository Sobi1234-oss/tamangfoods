// src/firebase.js
import { initializeApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBBmsVGZGSZ_kkujv19EF3Coz-hwTvda0o", // Replace with your actual API key
  authDomain: "tamangoapp-cb5dc.firebaseapp.com",
  projectId: "tamangoapp-cb5dc",
  storageBucket: "tamangoapp-cb5dc.appspot.com",
  messagingSenderId: "557569452996",
  appId: "1:557569452996:android:fe6e8e41da052799505291" // Get from Firebase console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = firestore();
const fcm = messaging();

// Set background message handler
fcm.setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

export { db, fcm };