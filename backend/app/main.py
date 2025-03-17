from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import map

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

app.include_router(map.router, prefix="/api/v1/maps", tags=["Maps"])

@app.get("/")
async def root():
  return { "message": "Webditor API is running" }