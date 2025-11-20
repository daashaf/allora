import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const envConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Optional fallback values for local development
const fallbackConfig = {
  apiKey: "AIzaSyA1gGqKyv1Lo_wH5SNsVqPB92SW1GgGPa8",
  authDomain: "allora-serice-hub.firebaseapp.com",
  projectId: "allora-serice-hub",
  storageBucket: "allora-serice-hub.firebasestorage.app",
  messagingSenderId: "47437060835",
  appId: "1:47437060835:web:768f0a66e5d142776c43d6",
};

const firebaseConfig = Object.fromEntries(
  Object.entries(envConfig).map(([key, value]) => [key, value || fallbackConfig[key]])
);

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const app =
  missingKeys.length > 0 ? null : getApps().length ? getApp() : initializeApp(firebaseConfig);

if (missingKeys.length > 0) {
  console.warn(
    `[Firebase] Authentication is disabled because these values are missing: ${missingKeys.join(
      ", "
    )}. Add them to your .env file to enable login.`
  );
}

export const isFirebaseConfigured = Boolean(app);
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

