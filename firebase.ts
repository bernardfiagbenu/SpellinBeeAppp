
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Configuration using the provided credentials
const firebaseConfig = {
  apiKey: "AIzaSyBFH2sxGbE5YaHqCYQpMsQhKzSG_8RRX30",
  authDomain: "portfolio-pro-39cd8.firebaseapp.com",
  projectId: "portfolio-pro-39cd8",
  storageBucket: "portfolio-pro-39cd8.appspot.com",
  messagingSenderId: "700775517479",
  appId: "1:700775517479:web:placeholder" 
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented-state') {
      // The current browser doesn't support all of the features required to enable persistence
      console.warn('Firestore persistence failed: Browser not supported');
    }
  });
}
