import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// This function acts as a safety wrapper
function getAdmin() {
  const apps = getApps();
  
  const app = apps.length ? apps[0] : initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

// Exporting them as results of the function call
export const { auth, db } = getAdmin();