import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const envConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Optional fallback values for local development (match the real project, not the typo)
const fallbackConfig = {
  apiKey: "AIzaSyA1gGqKyv1Lo_wH5SNsVqPB92SW1GgGPa8",
  authDomain: "allora-service-hub.firebaseapp.com",
  projectId: "allora-service-hub",
  storageBucket: "allora-service-hub.appspot.com",
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

const serviceEmail = process.env.REACT_APP_FIREBASE_SERVICE_EMAIL;
const servicePassword = process.env.REACT_APP_FIREBASE_SERVICE_PASSWORD;

const fallbackUser = { uid: "unauthenticated-client", isAnonymous: true, fromFallback: true };

let resolveAuthReady = null;
export const authReady = app
  ? new Promise((resolve) => {
      resolveAuthReady = resolve;
    })
  : Promise.resolve(fallbackUser);

const tryServiceCredentials = async () => {
  if (!auth || !serviceEmail || !servicePassword) return false;
  try {
    await signInWithEmailAndPassword(auth, serviceEmail, servicePassword);
    console.info("[Firebase] Signed in with service credentials.");
    return true;
  } catch (error) {
    console.warn(
      "[Firebase] Service credential login failed. Verify REACT_APP_FIREBASE_SERVICE_EMAIL/REACT_APP_FIREBASE_SERVICE_PASSWORD or reset the password.",
      error
    );
    return false;
  }
};

if (auth) {
  const resolveReady = (user) => {
    if (resolveAuthReady) {
      resolveAuthReady(user || fallbackUser);
      resolveAuthReady = null;
    }
  };

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      resolveReady(user);
      unsubscribe();
      return;
    }
    const loggedIn = await tryServiceCredentials();
    if (loggedIn) return;
    signInAnonymously(auth)
      .then((cred) => {
        resolveReady(cred.user);
        unsubscribe();
      })
      .catch((error) => {
        console.warn(
          "[Firebase] Anonymous authentication failed. Enable anonymous sign-in or provide credentials. Proceeding without auth (Firestore rules must allow this).",
          error
        );
        resolveReady(fallbackUser);
        unsubscribe();
      });
  });
}

let warnedUnauthenticated = false;
export const ensureFirebaseAuth = async () => {
  const user = await authReady;
  if (user?.fromFallback && !warnedUnauthenticated) {
    console.warn(
      "[Firebase] No authenticated user is available. Firestore writes will only work if your rules allow unauthenticated access or if you enable email/password or anonymous auth."
    );
    warnedUnauthenticated = true;
  }
  return user;
};
