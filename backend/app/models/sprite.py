from typing import Optional
from .entity import Entity
from enum import IntFlag


class SpriteFlag(IntFlag):
  DRAW_AS_SPRITE = 0b0001000000000000  # Bit 12 (4096, 0x1000)
  DISABLED = 0b1000000000000000  # Bit 15 (32768, 0x8000)
  
class CHKSprite(Entity):
  owner: int
  flags: int

class Sprite(Entity):
  owner: int
  flags: int
  image: int
  health_bar: Optional[int]
  selection_circle_image: Optional[int]
  selection_circle_offset: Optional[int]