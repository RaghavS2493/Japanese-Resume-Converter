/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  collection, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Detect if we are running in local mock mode
export const isFirebaseMock = 
  !firebaseConfig || 
  firebaseConfig.projectId === "mock-project-id" || 
  firebaseConfig.apiKey.includes("placeholder") ||
  firebaseConfig.apiKey === "mock_api_key_placeholder";

let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;

if (!isFirebaseMock) {
  try {
    appInstance = initializeApp(firebaseConfig);
    dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
    authInstance = getAuth(appInstance);
  } catch (err) {
    console.warn("Firebase failed to load. Operating in local mode.", err);
  }
}

export const db = dbInstance;
export const auth = authInstance;

// Error Handling Specification matching Eight Pillars ABAC
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Global authentication wrapper
export async function loginWithGoogle(): Promise<User | null> {
  if (isFirebaseMock || !auth) {
    console.log("Mock Login Triggered");
    return null;
  }
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Auth Login Error:", error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseMock || !auth) {
    return;
  }
  await signOut(auth);
}

// Test Connection function on start
export async function testConnection() {
  if (isFirebaseMock || !db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
  }
}

if (!isFirebaseMock) {
  testConnection();
}
