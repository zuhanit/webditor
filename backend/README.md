# Backend

- API Gateway: FastAPI
- BaaS: Firebase

# Why use Firebase instead of using standalone server?

- **Security**. I’m not security specialist, therefore save sensitive information(like Map data, User Privacy) can have several vulnerability attacked by hacker. Google Firebase can setup various security rules that can fully restrict read/write access to Firebase data.
- **Efficiency**. I’m not familiar with SQL languages. Firebase provide NoSQL databases(Cloud Firestore, Realtime Database, Storage) can save many time.

For sure you can setup your own backend instead of Firebase, then you have to customize whole entire code. Webditor is based on Firebase, using FastAPI as API Gateway.

# Setup

## Preprocess

1. `pnpm run preprocess` to generate required preprocessed file(ex: terrain data)
2. pnpm run gen-types to convert Pydantic Model to TypeScript type definition file(.d.ts)
   - In this script, Pydantic Models in /backend/models will be converted to JSON Schema. And those converted to .d.ts by json2ts.

## Firebase

1. Create your own [Firebase Project](https://firebase.google.com/).
2. Download Firebase Admin SDK private key, then Copy & Paste to [backend folder](https://github.com/zuhanit/webditor/tree/master/backend).

<aside>
💡

Webditor process secret file path based relatively on where executed file exists(e.g. backend/app/firebase/…). Finally, processed file path will be backend/_your_file_path_on_env_ by default. See core/firebase/config for example.

</aside>

1. Specify file path in .env file.
