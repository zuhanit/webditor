from fastapi import APIRouter
from fastapi.responses import FileResponse
from pathlib import Path


router = APIRouter()


@router.get("/megatile/{tileset_name}")
async def send_tileset(tileset_name: str):
  file_path = (
    Path(__file__).resolve().parent.parent.parent.parent.parent.parent
    / "preprocess"
    / "output"
    / "terrain"
    / tileset_name
    / "megatile_color.gz"
  )

  return FileResponse(
    file_path,
    media_type="application/octet-stream",
  )


@router.get("/cv5/{tileset_name}")
async def send_cv5_group(tileset_name: str):
  file_path = (
    Path(__file__).resolve().parent.parent.parent.parent.parent.parent
    / "preprocess"
    / "output"
    / "terrain"
    / tileset_name
    / "cv5_group.json"
  )

  return FileResponse(file_path, media_type="application/json")
