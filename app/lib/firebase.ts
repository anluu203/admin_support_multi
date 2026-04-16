import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

let _app: FirebaseApp | null = null;
let _db: Database | null = null;

export function getApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return _app;
}

/**
 * Returns the Firebase Database instance.
 * Returns null if NEXT_PUBLIC_FIREBASE_DATABASE_URL is not configured,
 * so callers can skip Firebase operations gracefully.
 */
export function getDb(): Database | null {
  if (!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
    console.warn("[Firebase] ❌ NEXT_PUBLIC_FIREBASE_DATABASE_URL chưa được set — realtime bị tắt.");
    return null;
  }
  if (!_db) {
    try {
      _db = getDatabase(getApp(), process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
      console.info("[Firebase] ✅ Kết nối thành công:", process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
    } catch (e) {
      console.error("[Firebase] ❌ Khởi tạo Database thất bại:", e);
      return null;
    }
  }
  return _db;
}
