from eudplib import GetChkTokenized, b2i1, b2i2, b2i4
from pydantic import BaseModel
from ...models.unit import Unit


class Terrain(BaseModel):
  def __init__(self, terrain_data: dict):
    self.terrain_data = terrain_data


class CHK(BaseModel):
  units: list[Unit]

  def __init__(self):
    self.chk = GetChkTokenized()
    self.placed_units = self.chk.getsection("UNIT")

  def unit_bytes_to_unit(self, unit_bytes: bytes) -> Unit:
    id = b2i4(unit_bytes, 0)
    return Unit(
      hit_points=b2i1(unit_bytes, 0),
      shield_points=b2i1(unit_bytes, 1),
      build_time=b2i2(unit_bytes, 2),
    )
