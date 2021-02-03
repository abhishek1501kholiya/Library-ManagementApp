import * as firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyDCzOAifiPyw4Iq8SLS-FWfADlrPfxFv30",
    authDomain: "wily-39fdc.firebaseapp.com",
    projectId: "wily-39fdc",
    storageBucket: "wily-39fdc.appspot.com",
    messagingSenderId: "559138065231",
    appId: "1:559138065231:web:2b0ce8c7c1a86f6dc0533a"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();