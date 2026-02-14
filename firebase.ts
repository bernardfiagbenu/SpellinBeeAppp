import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration using the provided credentials
const firebaseConfig = {
  apiKey: "AIzaSyBFH2sxGbE5YaHqCYQpMsQhKzSG_8RRX30",
  authDomain: "portfolio-pro-39cd8.firebaseapp.com",
  projectId: "portfolio-pro-39cd8",
  storageBucket: "portfolio-pro-39cd8.appspot.com",
  messagingSenderId: "700775517479",
  appId: "1:700775517479:web:placeholder" // App ID is usually required but basic Auth/Firestore often works with just API/ProjectID in web
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();