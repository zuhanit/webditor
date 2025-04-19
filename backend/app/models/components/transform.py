from .component import EntityComponent
from ..structs.spatial import Position2D


class TransformComponent(EntityComponent):
  """
  An entity component can have spatial data.
  """

  position: Position2D
