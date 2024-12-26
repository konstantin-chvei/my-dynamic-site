// Import the functions you need from the SDKs you need
// (Если используете модули, но в данном случае используем совместимую версию)

const firebaseConfig = {
    apiKey: "AIzaSyD1XQWwRmkWLCBmezazlux5b4K1RPi4cfE",
  authDomain: "wheel-a8ccf.firebaseapp.com",
  databaseURL: "https://wheel-a8ccf-default-rtdb.firebaseio.com",
  projectId: "wheel-a8ccf",
  storageBucket: "wheel-a8ccf.firebasestorage.app",
  messagingSenderId: "760902703815",
  appId: "1:760902703815:web:668ba6010141c8dded3ce2",
  measurementId: "G-MQPY3ERRJ0"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();