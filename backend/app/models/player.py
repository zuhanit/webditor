from enum import Flag
from pydantic import Field
from .wobject import WObject
from app.types.race import PlayerType, Race


class Player(WObject):
  color: int
  rgb_color: tuple[int, int, int]
  player_type: PlayerType
  race: Race
  force: int = Field(default=0, lt=4, ge=0)


class ForcePropertyFlag(Flag):
  random_start_location = 0b00000001
  allies = 0b00000010
  allied_victory = 0b00000100
  shared_vision = 0b00001000


class Force(WObject):
  properties: int
