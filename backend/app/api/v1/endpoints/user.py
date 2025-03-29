from fastapi import FastAPI, Depends, APIRouter
from app.core.firebase.auth import get_current_user

router = APIRouter()

@router.get("/login")
def login(user=Depends(get_current_user)):
  return {
    "uid": user["uid"],
    "email": user.get("email"),
    "name": user.get("name")
  }