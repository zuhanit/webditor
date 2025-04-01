from pydantic import BaseModel
from app.services.hex_validator import HexBytes

class Validation(BaseModel):
  vcod: HexBytes 
  ver: HexBytes 