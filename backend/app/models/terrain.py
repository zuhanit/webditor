from app.types.tileset import Tileset
from pydantic import BaseModel
from .structs.spatial import Size


class RawTerrain(BaseModel):
  """Raw terrain model.

  `RawTerrain` only have non converted tile data(e.g. tile image), because chk doesn't need
  to know how tile renders.
  """

  size: Size
  tileset: Tileset
