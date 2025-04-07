from typing import Optional
from .component import EntityComponent
from ..definitions.weapon_definition import WeaponDefinition

class WeaponComponent(EntityComponent):
  ground_weapon: Optional[WeaponDefinition]
  max_ground_hits: int
  air_weapon: Optional[WeaponDefinition]
  max_air_hits: int
  target_acquisition_range: int
  sight_range: int
  special_ability_flags: int