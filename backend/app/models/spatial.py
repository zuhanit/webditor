from pydantic import BaseModel

class Size(BaseModel):
  height: int
  width: int

class RectPosition(BaseModel):
  Left: int
  Top: int
  Right: int
  bottom: int
  
class Position2D(BaseModel):
  x: int
  y: int