import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
 
const envConfig = {
  REACT_APP_FIREBASE_API_KEY: process.env.REACT_APP_FIREBASE_API_KEY,
  REACT_APP_FIREBASE_AUTH_DOMAIN: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  REACT_APP_FIREBASE_PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  REACT_APP_FIREBASE_STORAGE_BUCKET: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  REACT_APP_FIREBASE_APP_ID: process.env.REACT_APP_FIREBASE_APP_ID,
};
 
const missingKeys = Object.entries(envConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);
 
let app = null;
 
if (missingKeys.length > 0) {
  console.warn(
    `[Firebase] Authentication is disabled because these environment variables are missing: ${missingKeys.join(
      ", "
    )}. Add them to your .env file to enable login.`
  );
} else {
  const firebaseConfig = {
  apiKey: "AIzaSyA1gGqKyv1Lo_wH5SNsVqPB92SW1GgGPa8",
  authDomain: "allora-serice-hub.firebaseapp.com",
  projectId: "allora-serice-hub",
  storageBucket: "allora-serice-hub.firebasestorage.app",
  messagingSenderId: "47437060835",
  appId: "1:47437060835:web:768f0a66e5d142776c43d6"
  };
 
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}
 
export const isFirebaseConfigured = Boolean(app);
export const auth = app ? getAuth(app) : null;
export default app;
 