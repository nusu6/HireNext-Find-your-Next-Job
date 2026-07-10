// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBtQZNHVRp7tv_vtCj9yvzgPzhnzVPOE68",
  authDomain: "hirenext-2a66f.firebaseapp.com",
  projectId: "hirenext-2a66f",
  storageBucket: "hirenext-2a66f.firebasestorage.app",
  messagingSenderId: "816698723875",
  appId: "1:816698723875:web:bbc27b5fcd5f5998f22b96",
  measurementId: "G-K3V1MPSY5L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);