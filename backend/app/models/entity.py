from typing import Literal, TypeAlias
from pydantic import Field
from .wobject import WObject
from .components.transform import TransformComponent

EntityKind: TypeAlias = Literal["Unit", "Sprite", "Location", "Terrain"]


class Entity(WObject):
  """
  Placeable `object`.
  """

  transform: TransformComponent = Field(
    ..., description="Spatial transform is mandatory"
  )
  kind: EntityKind
