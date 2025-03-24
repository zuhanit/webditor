from firebase_admin import auth
from fastapi import  Header, HTTPException

def get_current_user(authorization: str = Header(...)):
  """Current user authentication by Firebase Authentication"""
  try:
    token = authorization.split("Bearer ")[1]  # "Bearer <토큰>" 형식에서 토큰 추출
    decoded_token = auth.verify_id_token(token)
    return decoded_token
  except Exception:
    raise HTTPException(status_code=401, detail="Invalid token")