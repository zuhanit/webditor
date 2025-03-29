# Frontend

- Next.js

# Setup

1. Add Web App on your firebase project.
2. Create .env file in /frontend, then copy and paste `firebaseConfig` following properties below. If you want to change environmental variable name you must change config key in `/frontend/lib/firebase/config.ts` too.

```jsx
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Note: Is it safe to expose Firebase apiKey to the public?

See this Q&A: [Is it safe to expose Firebase apiKey to the public?](https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public)

Summary: **Yes**. But I’d like to convert `firebaseConfig` into `.env` because simplification, readability, reusability. In other to save your project from vulnerabilities, you **must** protect your Firebase Project by setting [Firebase security rules](https://firebase.google.com/docs/rules).

## Storage

## Firestore

## Authentication

1. Setup Firebase Authentication on your project.
2. Add login method. Webditor supports email, Google, Github by default.
