import io
from app.services.rawdata.dat import DAT
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from firebase_admin import storage, firestore
from app.core.firebase.auth import get_current_user
from app.models.project import Map, Project
from app.services.mapdata.io import build_map, get_chkt, get_map
from app.services.mapdata.chk import CHK
from io import BytesIO
import uuid
import datetime


router = APIRouter()


@router.post("/upload/")
async def upload_map(file: UploadFile = File(...), user=Depends(get_current_user)):
  """Get webditor-based transformed data by uploaded map."""
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

    return {"url": download_url, "path": filename, "raw_map": raw_map}

  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


@router.get("/test_map")
async def get_test_map(): 
  with open("./example/hello12345.scx", "rb") as f:
    chkt = get_chkt(BytesIO(f.read()))
    chk = CHK(chkt)
    dat = DAT()
    map = get_map(chk, dat)
    
    return map.model_dump(mode="json")
  
  
@router.post("/build")
def get_build_map(map: Map):
  try: 
    map_bytes = build_map(map)
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

  buffer = io.BytesIO(map_bytes)
  buffer.seek(0)
  
  return StreamingResponse(
    buffer,
    media_type="application/octet-stream",
    headers={"content-Disposition": "attachment; filename=generated_map.scx"}
  )