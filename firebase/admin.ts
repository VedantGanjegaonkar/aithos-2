import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Define a type for our singleton to keep TypeScript happy
interface FirebaseAdmin {
  app: App;
  auth: Auth;
  db: Firestore;
}

// Check if we've already initialized to prevent "Cold Start" lag
let cachedAdmin: FirebaseAdmin = (global as any).firebaseAdmin;

function initFirebaseAdmin(): FirebaseAdmin {
  if (cachedAdmin) return cachedAdmin;

  const apps = getApps();
  let app: App;

  if (!apps.length) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("🔥 Firebase Admin Initialized (New Connection)");
  } else {
    app = apps[0];
  }

  const adminObj = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };

  // Store in global object to persist across HMR and Serverless invocations
  if (process.env.NODE_ENV !== "production") {
    (global as any).firebaseAdmin = adminObj;
  }

  return adminObj;
}

const admin = initFirebaseAdmin();
export const db = admin.db;
export const auth = admin.auth;