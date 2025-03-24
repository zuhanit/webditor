from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import firebase_admin
import os

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))  # backend/
ENV_FIREBASE_KEY_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH")

if not(ENV_FIREBASE_KEY_PATH):
  raise RuntimeError("Invalid FIREBASE_CREDENTIALS_PATH. Guess forgot setting .env?")

firebase_key_path = os.path.join(BASE_DIR, ENV_FIREBASE_KEY_PATH)

if not firebase_admin._apps: 
  cred = credentials.Certificate(firebase_key_path)
  firebase_app = firebase_admin.initialize_app(cred, {
    "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET")
  })