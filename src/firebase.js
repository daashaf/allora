import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

const envConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Fallbacks keep local development working even if .env is missing.
const fallbackConfig = {
  apiKey: "AIzaSyA1gGqKyv1Lo_wH5SNsVqPB92SW1GgGPa8",
  authDomain: "allora-serice-hub.firebaseapp.com",
  projectId: "allora-serice-hub",
  storageBucket: "allora-serice-hub.appspot.com",
  messagingSenderId: "47437060835",
  appId: "1:47437060835:web:768f0a66e5d142776c43d6",
};

const firebaseConfig = Object.fromEntries(
  Object.entries(envConfig).map(([key, value]) => [key, value || fallbackConfig[key]])
);

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const appInstance =
  missingKeys.length > 0 ? null : getApps().length ? getApp() : initializeApp(firebaseConfig);

if (missingKeys.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `[Firebase] Authentication is disabled because these values are missing: ${missingKeys.join(
      ", "
    )}. Add them to your .env file to enable login.`
  );
}

export const isFirebaseConfigured = Boolean(appInstance);
export const app = appInstance;
export const auth = appInstance ? getAuth(appInstance) : null;
export const db = appInstance ? getFirestore(appInstance) : null;

export const ensureUserRole = async (uid, email) => {
  if (!db || !uid) return null;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      email: email || "",
      role: "Customer",
      createdAt: serverTimestamp(),
    });
    return "Customer";
  }

  const data = snap.data();
  const existingRole = data?.role || data?.Role || data?.userType;
  if (existingRole) {
    return existingRole;
  }

  await updateDoc(userRef, { role: "Customer" });
  return "Customer";
};

const serviceEmail = process.env.REACT_APP_FIREBASE_SERVICE_EMAIL;
const servicePassword = process.env.REACT_APP_FIREBASE_SERVICE_PASSWORD;
const enableServiceLogin = (process.env.REACT_APP_ENABLE_SERVICE_LOGIN || "").toLowerCase() === "true";

const fallbackUser = { uid: "unauthenticated-client", isAnonymous: true, fromFallback: true };

let resolveAuthReady = null;
export const authReady = appInstance
  ? new Promise((resolve) => {
      resolveAuthReady = resolve;
    })
  : Promise.resolve(fallbackUser);

const tryServiceCredentials = async () => {
  if (!enableServiceLogin || !auth || !serviceEmail || !servicePassword) return false;
  try {
    await signInWithEmailAndPassword(auth, serviceEmail, servicePassword);
    // eslint-disable-next-line no-console
    console.info("[Firebase] Signed in with service credentials.");
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.warn(
      "[Firebase] No authenticated user is available. Firestore writes will only work if your rules allow unauthenticated access or if you enable email/password or anonymous auth."
    );
    warnedUnauthenticated = true;
  }
  return user;
};
