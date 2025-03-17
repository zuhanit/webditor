from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

@router.post("/upload/")
async def upload_map(file: UploadFile = File()):
  """ 맵 파일을 업로드하면 변환된 맵 데이터를 반환 """
  try:
    ...
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))