from __future__ import annotations
from typing import Union
from pydantic import Field
from .tree import Node
from .entities.entity import Entity
from .entities.sprite import Sprite
from .entities.tile import Tile
from .entities.location import Location
from .entities.unit import Unit
from .entities.mask import Mask


class EntityNode(Node[Union[Entity, Sprite, Tile, Location, Unit, Mask]]):
  children: list[EntityNode] = Field(default_factory=list)


EntityNode.model_rebuild()
