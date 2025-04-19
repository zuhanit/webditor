from pydantic import BaseModel
from typing import TypeAlias, Literal
from .structs.spatial import Size


class Tile(BaseModel):
  group: int
  id: int


Tileset: TypeAlias = Literal[
  "Ashworld",
  "Badlands",
  "Desert",
  "Ice",
  "Installation",
  "Jungle",
  "Platform",
  "Twilight",
]

EraTilesetDict: dict[int, Tileset] = {
  0: "Ashworld",
  1: "Badlands",
  2: "Desert",
  3: "Ice",
  4: "Installation",
  5: "Jungle",
  6: "Platform",
  7: "Twilight",
}

EraTilesetReverseDict: dict[Tileset, int] = {
  v: k for k, v in EraTilesetDict.items()
}


class RawTerrain(BaseModel):
  """Raw terrain model.

  `RawTerrain` only have non converted tile data(e.g. tile image), because chk doesn't need
  to know how tile renders.
  """

  size: Size
  tileset: Tileset
  tile_id: list[list[Tile]]


class Terrain(BaseModel):
  size: Size
  tileset: Tileset
  tile_id: list[list[Tile]]
