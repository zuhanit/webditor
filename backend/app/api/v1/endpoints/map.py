from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from firebase_admin import storage, firestore
from app.core.firebase.auth import get_current_user
from app.models.project import Project
from app.services.mapdata.loadmap import get_chk_data, get_chkt
from app.services.mapdata.chk import CHK
from io import BytesIO
import uuid
import datetime



router = APIRouter()

@router.post("/upload/")
async def upload_map(file: UploadFile = File(...), user=Depends(get_current_user)):
  """ Get webditor-based transformed data by uploaded map. """
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
    
    chkt = await get_chkt(BytesIO(content))
    chk = CHK(chkt)
    
    raw_map = get_chk_data(chk)
    
    db = firestore.client()
    project = Project(
      uid=uid,
      filename=file.filename,
      path=filename,
      url=download_url,
      uploadedAt=datetime.datetime.now(datetime.UTC),
      raw_map=raw_map
    )
    
    print(project.model_dump())
    db.collection("projects").add(project.model_dump(mode="json"))
    
    return {"url": download_url, "path": filename}
    ...
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))