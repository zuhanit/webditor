"use client";

import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "./config";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(firebaseApp);

export let analytics: ReturnType<typeof getAnalytics> | null = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(firebaseApp);
  }
});
