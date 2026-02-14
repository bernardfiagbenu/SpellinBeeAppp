
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFH2sxGbE5YaHqCYQpMsQhKzSG_8RRX30",
  authDomain: "portfolio-pro-39cd8.firebaseapp.com",
  projectId: "portfolio-pro-39cd8",
  storageBucket: "portfolio-pro-39cd8.appspot.com",
  messagingSenderId: "700775517479",
  appId: "1:700775517479:web:12345abcde67890" // Standardized placeholder
};

let app;
try {
  // Ensure we don't initialize multiple times (common in HMR/Production)
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.error("Firebase Initialization Error:", e);
  // Create a dummy app object to prevent downstream exports from being undefined
  app = { name: "fallback" } as any;
}

export const auth = app.name !== "fallback" ? getAuth(app) : null as any;
export const db = app.name !== "fallback" ? getFirestore(app) : null as any;
export const googleProvider = new GoogleAuthProvider();
