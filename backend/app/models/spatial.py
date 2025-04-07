from pydantic import BaseModel

class Size(BaseModel):
  height: int
  width: int

class RectPosition(BaseModel):
  left: int
  top: int
  right: int
  bottom: int
  
class Position2D(BaseModel):
  x: int = 0
  y: int = 0