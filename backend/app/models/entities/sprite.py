from .entity import Entity, EntityKind
from ..definitions.sprite import SpriteDefinition
from ..player import Player


class Sprite(Entity):
  """Placed Sprite Entity."""

  kind: EntityKind = "Sprite"
  owner: Player
  flags: int
  definition: SpriteDefinition
