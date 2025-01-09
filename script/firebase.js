import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBf6kLxq8QB1w9HwNM3Max-yPv0BXxw68I",
    authDomain: "tp-ccr.firebaseapp.com",
    projectId: "tp-ccr",
    storageBucket: "tp-ccr.firebasestorage.app",
    messagingSenderId: "677817697897",
    appId: "1:677817697897:web:abfac8c79afb90718c44f8"
  };
// Initialisation Firebase
const app =initializeApp(firebaseConfig);
const database = getDatabase(app);

