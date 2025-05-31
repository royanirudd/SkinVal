import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyxNgRe-Db5p9IbW_O7tPomv88PCZEdCY",
  authDomain: "skinval.firebaseapp.com",
  projectId: "skinval",
  storageBucket: "skinval.firebasestorage.app",
  messagingSenderId: "452637631200",
  appId: "1:452637631200:web:cc4dc07a9a72ce2a212685",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const auth = getAuth(app); // Export the Firebase authentication instance
export const db = getFirestore(app); // Export the Firestore database instance
