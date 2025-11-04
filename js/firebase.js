// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8WauCKutQwzK2kkBPprzwWoy7p9cAXVE",
  authDomain: "akiya-app-e7a9b.firebaseapp.com",
  projectId: "akiya-app-e7a9b",
  storageBucket: "akiya-app-e7a9b.firebasestorage.app",
  messagingSenderId: "665091929996",
  appId: "1:665091929996:web:720cedd79b1ba1e4c748a9",
  measurementId: "G-JV28SYR2NL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, doc, getDoc, getDocs };
