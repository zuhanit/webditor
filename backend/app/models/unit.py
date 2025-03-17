from pydantic import BaseModel
from typing import NamedTuple


class Cost(NamedTuple):
  mineral: int
  gas: int


class Unit(BaseModel):
  hit_points: int
  "Note the displayed value is this value / 256, with the low byte being a fractional HP value"
  shield_points: int
  armor_points: int
  build_time: int
  "1/60 seconds"
  name: str
  cost: Cost
  id: int
