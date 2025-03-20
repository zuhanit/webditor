from fastapi import UploadFile 
from services.mapdata.loadmap import load_map

async def process_map(file: UploadFile):
  content = await file.read()
  transformed_data = convert_to_project_format(content)
  return transformed_data
  
def convert_to_project_format(content: bytes):
  chkt = load_map(content)
  return {"map_name": "example", "size": "128x128"}