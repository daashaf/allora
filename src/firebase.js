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
    apiKey: envConfig.REACT_APP_FIREBASE_API_KEY,
    authDomain: envConfig.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: envConfig.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: envConfig.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envConfig.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: envConfig.REACT_APP_FIREBASE_APP_ID,
  };

  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const isFirebaseConfigured = Boolean(app);
export const auth = app ? getAuth(app) : null;
export default app;
