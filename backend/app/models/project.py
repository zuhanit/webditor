from typing import Any
from pydantic import BaseModel
import datetime

from app.models.location import Location
from app.models.player import Player
from app.models.sprite import Sprite
from app.models.string import String
from app.models.terrain import RawTerrain, Terrain
from app.models.unit import PlacedUnit, RawUnit, Unit

class RawMap(BaseModel):
  unit: list[RawUnit]
  terrain: RawTerrain
  player: list[Player]
  location: list[Location]
  placed_unit: list[PlacedUnit]
  sprite: list[Sprite]
  string: list[String]

class Project(BaseModel):
  filename: str
  path: str
  uid: str
  uploadedAt: datetime.datetime
  url: str
  raw_map: RawMap
  