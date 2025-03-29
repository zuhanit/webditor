from .object import Object
from .components.transform import Transform
from .spatial import Position2D


class Entity(Object):
  """
  Placeable `object`.
  """

  transform: Transform = Transform(position=Position2D(x=0, y=0))
