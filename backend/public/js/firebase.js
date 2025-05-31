// public/js/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_pRP-irU8nTE9nbrvODcHRvjBk2Q1OtM",
  authDomain: "bestmatch-ai.firebaseapp.com",
  projectId: "bestmatch-ai",
  storageBucket: "bestmatch-ai.firebasestorage.app",
  messagingSenderId: "542013478730",
  appId: "1:542013478730:web:0322018d75a5e42ebcd3b3",
  measurementId: "G-XGHHX6QD7W"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
