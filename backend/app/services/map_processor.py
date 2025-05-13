from fastapi import UploadFile
from services.mapdata.loadmap import get_chkt


async def process_map(file: UploadFile):
  content = await file.read()
  transformed_data = convert_to_project_format(content)
  return transformed_data


def convert_to_project_format(content: bytes):
  get_chkt(content)
  return {"map_name": "example", "size": "128x128"}
