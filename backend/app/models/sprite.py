from pydantic import BaseModel
from .spatial import Position2D
from .entity import Entity
from .components.transform import Transform
from enum import IntFlag


class SpriteFlag(IntFlag):
  DRAW_AS_SPRITE = 0b0001000000000000  # Bit 12 (4096, 0x1000)
  DISABLED = 0b1000000000000000  # Bit 15 (32768, 0x8000)

class Sprite(Entity):
  owner: int
  flags: int
