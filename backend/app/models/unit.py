from typing import Optional
from app.models.definitions.unit_definition import UnitDefinition
from app.models.structs.stat import Stat
from pydantic import Field
from .player import Player
from .entity import Entity
from .structs.cost import Cost
from .structs.spatial import Position2D
from .wobject import WObject
from .components.transform import TransformComponent
from enum import Flag


class CHKUnit(Entity):
  """CHK compatible Unit."""

  serial_number: Optional[int] = None
  """Identical number when unit placed on map. -1 When non-placed unit."""
  cost: Cost
  hit_points: Stat = Stat()
  shield_points: Stat = Stat()
  energy_points: Stat = Stat()
  armor_points: int = Field(default=0, lt=256)
  owner: Player = Player(
    player_type="Inactive", race="Inactive", color=0, rgb_color=(0, 0, 0)
  )
  resource_amount: int = 0
  hangar: int = 0
  unit_state: int = 0
  relation_type: int = 0
  related_unit: int = 0
  special_properties: int = 0
  valid_properties: int = 0
  use_default: bool = True
  # transform = TransformComponent(position=Position2D(x=0, y=0))


class Unit(Entity):
  """Unit placed on map.

  The entity means what placeable on map, so every `Unit` which herit `Entity` is placed unit.
  If you looking for specificaiton of unit like `Max HP`, `Size`, see `UnitDefinition`.
  """

  serial_number: Optional[int] = None
  """Identical number when unit placed on map. -1 When non-placed unit."""
  use_default: bool = True
  unit_definition: UnitDefinition

  owner: Player = Player(
    player_type="Inactive", race="Inactive", color=0, rgb_color=(0, 0, 0)
  )
  resource_amount: int = 0
  hangar: int = 0
  unit_state: int = 0
  relation_type: int = 0
  related_unit: int = 0
  special_properties: int = 0
  valid_properties: int = 0


class PlacedUnitRelationFlag(Flag):
  nydus_link = 0b10000000
  addon_link = 0b100000000


class SpecialPropertiesFlag(Flag):
  cloak = 0b1
  burrow = 0b10
  in_transit = 0b100
  hallucinated = 0b1000
  invincible = 0b10000


class ValidPropertiesFlag(Flag):
  owner_player = 0b1
  hp = 0b10
  shields = 0b100
  energy = 0b1000
  resource = 0b10000
  amount = 0b100000


class UnitStateFlag(Flag):
  cloaked = 0b1
  burrowed = 0b10
  is_transit = 0b100
  hallucinated = 0b1000
  invincible = 0b10000


class UnitProperty(WObject):
  """Create units with properties trigger used."""

  special_properties: int
  unit_data: int
  owner: int = Field(default=0, le=1)
  hit_point_percent: int = Field(default=1, le=100, ge=0)
  shield_point_percent: int = Field(default=1, le=100, ge=0)
  energy_point_percent: int = Field(default=1, le=100, ge=0)
  resource_amount: int
  units_in_hangar: int
  flags: int


class UnitRestriction(WObject):
  availability: list[bool]
  global_availability: bool
  uses_defaults: list[bool]
