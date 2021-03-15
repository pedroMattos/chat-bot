var firebase = require('firebase');
var app = firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.M_SENDING_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
});

console.log(app)