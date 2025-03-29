from .component import EntityComponent
from ..spatial import Position2D


class Transform(EntityComponent):
  """
  An entity component can have spatial data.
  """

  position: Position2D
