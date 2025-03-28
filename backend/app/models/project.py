from pydantic import BaseModel
import datetime

from .location import Location
from .player import Player
from .sprite import Sprite
from .string import String
from .terrain import RawTerrain
from .unit import Unit


class RawMap(BaseModel):
  unit: list[Unit]
  terrain: RawTerrain
  player: list[Player]
  location: list[Location]
  placed_unit: list[Unit]
  sprite: list[Sprite]
  string: list[String]


class Project(BaseModel):
  filename: str
  path: str
  uid: str
  uploadedAt: datetime.datetime
  url: str
