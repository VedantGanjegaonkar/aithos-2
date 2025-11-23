// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQNOyAmFU4czWrXTh31GMlOPayOH_gY80",
  authDomain: "aithos-mock.firebaseapp.com",
  projectId: "aithos-mock",
  storageBucket: "aithos-mock.firebasestorage.app",
  messagingSenderId: "631693912656",
  appId: "1:631693912656:web:e3c65ad5d66967658dff55",
  measurementId: "G-DY1PVGXXH1",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
