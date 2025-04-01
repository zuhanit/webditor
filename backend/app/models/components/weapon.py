from pydantic import Field
from .component import EntityComponent


class Weapon(EntityComponent):
  base_damage: int = Field(default=0)
  damage_factor: int = Field(default=0)
  pass
