from pydantic import BaseModel
from .spatial import Position2D
from enum import IntFlag


class SpriteFlag(IntFlag):
  DRAW_AS_SPRITE = 0b0001000000000000  # Bit 12 (4096, 0x1000)
  DISABLED = 0b1000000000000000  # Bit 15 (32768, 0x8000)


class Sprite(BaseModel):
  id: int
  position: Position2D
  player: int
  flags: int
