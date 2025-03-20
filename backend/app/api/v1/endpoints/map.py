from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

@router.post("/upload/")
async def upload_map(file: UploadFile = File()):
  """ Get webditor-based transformed data by uploaded map. """
  try:
    ...
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))