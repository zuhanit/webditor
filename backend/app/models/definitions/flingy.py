from .definition import Definition
from .sprite import SpriteDefinition


class FlingyDefinition(Definition):
  sprite: SpriteDefinition
  top_speed: int
  acceleration: int
  halt_distance: int
  turn_radius: int
  unused: int
  move_control: int
