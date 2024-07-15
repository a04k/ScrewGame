// firebase.ts
import { initializeApp } from "firebase/app";
// import firebase from "firebase/compat/app";
// import 'firebase/firestore';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBOYpuDUX6vcxPTN1_YpcZIDcgPJm4h1w0",
    authDomain: "screwgame-1e4df.firebaseapp.com",
    projectId: "screwgame-1e4df",
    storageBucket: "screwgame-1e4df.appspot.com",
    messagingSenderId: "634045390198",
    appId: "1:634045390198:web:7361344893fd8dcbdeae57",
    measurementId: "G-KTPX2K9JMV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export {db};
