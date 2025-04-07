// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXtsCDGjI7FZ3uWzfYYwx0v62wczny0t8",
  authDomain: "football-app-2206e.firebaseapp.com",
  projectId: "football-app-2206e",
  storageBucket: "football-app-2206e.firebasestorage.app",
  messagingSenderId: "545729619865",
  appId: "1:545729619865:web:2f7646ebe04d67a2ff5508",
  measurementId: "G-E0SY9KMS2W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);      // <-- dit is belangrijk
const db = getFirestore(app);   // <-- dit gebruik je straks voor coins

export { auth, db };