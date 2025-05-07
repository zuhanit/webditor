from pydantic import BaseModel
from enum import Flag
from .structs.spatial import RectPosition


class ElevationFlag(Flag):
  low_elevation = 0b0000000000000001
  medium_elevation = 0b0000000000000010
  high_elevation = 0b0000000000000100
  low_air = 0b0000000000001000
  medium_air = 0b0000000000010000
  high_air = 0b0000000000100000
  unused0 = 0b0000000001000000
  unused1 = 0b0000000010000000
  unused2 = 0b0000000100000000
  unused3 = 0b0000001000000000
  unused4 = 0b0000010000000000
  unused5 = 0b0000100000000000
  unused6 = 0b0001000000000000
  unused7 = 0b0010000000000000
  unused8 = 0b0100000000000000
  unused9 = 0b1000000000000000


class Location(BaseModel):
  id: int
  position: RectPosition
  name_id: int
  elevation_flags: int
  name: str
