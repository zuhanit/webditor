from firebase_admin import auth
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
  """Current user authentication by Firebase Authentication"""
  try:
    token = credentials.credentials
    decoded_token = auth.verify_id_token(token)
    return decoded_token
  except Exception:
    raise HTTPException(status_code=401, detail="Invalid token")
