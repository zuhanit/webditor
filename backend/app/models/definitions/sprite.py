from typing import Optional
from .definition import Definition
from .image import ImageDefinition
from enum import IntFlag


class SpriteFlag(IntFlag):
  DRAW_AS_SPRITE = 1 << 12
  DISABLED = 1 << 15


class SpriteDefinition(Definition):
  image: ImageDefinition
  health_bar_id: Optional[int]
  selection_circle_image_id: Optional[int]
  selection_circle_offset: Optional[int]
