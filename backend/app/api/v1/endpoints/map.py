import io
import os
from app.core.w_logging import get_logger
from app.services.rawdata.dat import DAT
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from firebase_admin import storage, firestore
from app.core.firebase.auth import get_current_user
from app.models.project import Usemap, Project
from app.services.io import build_map, get_chkt, get_map
from app.services.rawdata.chk import CHK
from io import BytesIO
import uuid
import datetime


router = APIRouter()

upload_logger = get_logger("upload")


@router.post("/upload/")
async def upload_map(file: UploadFile = File(...), user=Depends(get_current_user)):
  """Get webditor-based transformed data by uploaded map."""
  user_id = user["user_id"]
  upload_logger.info(f"User {user_id} requested to upload {file.filename}.")
  if not file.filename:
    raise HTTPException(status_code=403, detail="Invalid filename")

  try:
    uid = user["uid"]
    filename = f"{uid}/{uuid.uuid4()}_{file.filename}"
    content = await file.read()

    bucket = storage.bucket()
    blob = bucket.blob(filename)
    blob.upload_from_file(BytesIO(content), content_type=file.content_type)
    blob.make_public()
    download_url = blob.public_url

    chkt = get_chkt(BytesIO(content))
    chk = CHK(chkt)
    dat = DAT()

    raw_map = get_map(chk, dat)

    db = firestore.client()
    project = Project(
      uid=uid,
      filename=file.filename,
      path=filename,
      url=download_url,
      uploadedAt=datetime.datetime.now(datetime.UTC),
    )

    db.collection("projects").add(project.model_dump(mode="json"))

    upload_logger.info(f"Upload {file.filename} was succesful.")
    return {"url": download_url, "path": filename, "raw_map": raw_map}

  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


@router.post("/open")
async def open_map(file: UploadFile = File(...)):
  try:
    content = await file.read()
    chkt = get_chkt(BytesIO(content))
    chk = CHK(chkt)
    dat = DAT()

    raw_map = get_map(chk, dat)
    return {"file_name": file.filename, "raw_map": raw_map}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


@router.get("/test_map")
async def get_test_map():
  with open("./example/various_units.scx", "rb") as f:
    chkt = get_chkt(BytesIO(f.read()))
    chk = CHK(chkt)
    dat = DAT()
    map = get_map(chk, dat)

    return map.model_dump(mode="json")


build_logger = get_logger("build")


@router.post("/build")
def get_build_map(map: Usemap):
  build_logger.info("Started to building map.")

  try:
    map_bytes = build_map(map)
  except Exception as e:
    build_logger.critical(f"Building map was failed, because of {e}.")
    timestamp = datetime.datetime.now(datetime.UTC).strftime("%Y%m%d_%H%M%S")
    json_path = f"logs/map_{timestamp}.json"
    os.makedirs("logs", exist_ok=True)

    with open(json_path, mode="a", newline="") as f:
      import json

      json.dump(map.model_dump(mode="json"), f, indent=2)
      build_logger.info(f"Map structure saved in {json_path}")
    raise HTTPException(status_code=500, detail=str(e))

  buffer = io.BytesIO(map_bytes)
  buffer.seek(0)

  build_logger.info("Building was succesful.")

  return StreamingResponse(
    buffer,
    media_type="application/octet-stream",
    headers={"content-Disposition": "attachment; filename=generated_map.scx"},
  )
