
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB77-1learNlTj05Slhk5F_6YBJnIVUrtg",
  authDomain: "nationaljuniorspelling.firebaseapp.com",
  projectId: "nationaljuniorspelling",
  storageBucket: "nationaljuniorspelling.firebasestorage.app",
  messagingSenderId: "988629062367",
  appId: "1:988629062367:web:863dab363aae14f3358f6a",
  measurementId: "G-BFSBQ7XB5P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
