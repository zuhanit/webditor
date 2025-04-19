from .wobject import WObject
from .components.transform import TransformComponent
from .spatial import Position2D


class Entity(WObject):
  """
  Placeable `object`.
  """

  transform: TransformComponent = TransformComponent(position=Position2D(x=0, y=0))
