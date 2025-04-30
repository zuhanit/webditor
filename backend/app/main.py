from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.endpoints import map, user, tileset
from app.core.firebase import config  # Automatically initialized by importing `config`.
from app.core.w_logging import get_logger, setup_logging
from fastapi.responses import JSONResponse
import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin._auth_utils import InvalidIdTokenError

setup_logging()

app = FastAPI(
  title="Webditor API",
  description="A FastAPI backend for the Webditor project",
  version="1.0.0",
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

logger = get_logger("fastapi")


@app.middleware("http")
async def log_reqeust(request: Request, call_next):
  logger.info(f"Request: {request.method} {request.url}")

  user_id = "anonymous"
  auth_header = request.headers.get("authorization")
  if auth_header and auth_header.startswith("Bearer "):
    token = auth_header.removeprefix("Bearer ").strip()
    try:
      decoded_token = firebase_auth.verify_id_token(token)
      user_id = decoded_token.get("uid", "unknown")
    except InvalidIdTokenError:
      user_id = "invalid-token"
    except Exception as e:
      user_id = f"error:{e.__class__.__name__}"

  logger.info(f"User ID: {user_id}")

  try:
    response = await call_next(request)
  except Exception as e:
    logger.exception("🔥 Unhandled exception occurred during request")
    return JSONResponse(
      status_code=500,
      content={"detail": "Internal Server Error"},
    )
  logger.info(f"Response: {response.status_code}")
  return response


app.include_router(map.router, prefix="/api/v1/maps", tags=["Maps"])
app.include_router(user.router, prefix="/api/v1/user", tags=["User"])
app.include_router(tileset.router, prefix="/api/v1/tileset", tags=["Tileset"])


@app.get("/")
async def root():
  return {"message": "Webditor API is running"}
