// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDK1aP5xB8vJ2mK9nL3oP4qR5sT6uV7wX8",
  authDomain: "catalogue-saveurs.firebaseapp.com",
  projectId: "catalogue-saveurs-1cbe3",
  storageBucket: "catalogue-saveurs-1cbe3.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890ghijkl"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };