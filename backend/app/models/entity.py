from pydantic import Field
from .wobject import WObject
from .components.transform import TransformComponent


class Entity(WObject):
  """
  Placeable `object`.
  """

  transform: TransformComponent = Field(
    ..., description="Spatial transform is mandatory"
  )
