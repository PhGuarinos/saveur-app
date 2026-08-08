// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB2ypnPKtw5vtfAJ8UDfGy706I0_Tnia4g",
  authDomain: "catalogue-saveurs-1cbe3.firebaseapp.com",
  projectId: "catalogue-saveurs-1cbe3",
  storageBucket: "catalogue-saveurs-1cbe3.firebasestorage.app",
  messagingSenderId: "481473526096",
  appId: "1:481473526096:web:c042a8b7ed5e78909ad455"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };