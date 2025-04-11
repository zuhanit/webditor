from typing import Optional
from pydantic import BaseModel, Field

from .spatial import Position2D, Size, RectPosition
from .player import Player
from .object import Object
from .components.component import EntityComponent
from .components.weapon_component import WeaponComponent
from .entity import Entity
from .cost import Cost
from enum import Flag


class Stat(Object):
  current: int = Field(default=0, ge=0)
  max: int = Field(default=0, ge=0)

class RequiredAndProvided(BaseModel):
  required: int
  provided: int

class CHKUnit(Entity):
  serial_number: int = -1
  """Identical number when unit placed on map. -1 When non-placed unit."""
  cost: Cost
  hit_points: Stat = Stat(name="Hit Points")
  shield_points: Stat = Stat(name="Shield Points")
  energy_points: Stat = Stat(name="Energy Points")
  armor_points: int = Field(default=0, lt=256)
  owner: Player = Player(player_type="Inactive", race="Inactive", color=0)
  resource_amount: int = 0
  hangar: int = 0
  unit_state: int = 0
  relation_type: int = 0
  related_unit: int = 0
  special_properties: int = 0
  valid_properties: int = 0
  use_default: bool = True

class UnitSpecificationComponent(EntityComponent):
  id: int = 0
  name: str = "Unit Basic Specification"
  
  # DAT file related properties 
  graphics: int
  subunit1: int
  subunit2: int
  infestation: Optional[int]
  """ID 106-201 only"""
  construction_animation: int
  unit_direction: int
  portrait: int
  label: int
  
class UnitStatComponent(EntityComponent):
  hit_points: Stat = Stat(name="Hit Points")
  shield_enable: bool
  shield_points: Stat = Stat(name="Shield Points")
  energy_points: Stat = Stat(name="Energy Points")
  armor_points: int = Field(default=0, lt=256)
  armor_upgrade: int
  rank: int
  elevation_level: int
  
class UnitAIComponent(EntityComponent):
  computer_idle: int
  human_idle: int
  return_to_idle: int
  attack_unit: int
  attack_and_move: int
  internal: int
  right_click: int

class UnitSoundComponent(EntityComponent):
  ready: Optional[int]
  "ID 0-105 Only"
  what_start: int
  what_end: int
  piss_start: Optional[int]
  "ID 0-105 Only"
  piss_end: Optional[int]
  "ID 0-105 Only"
  yes_start: Optional[int]
  "ID 0-105 Only"
  yes_end: Optional[int]
  "ID 0-105 Only"
  
class UnitSizeComponent(EntityComponent):
  size_type: int
  placement_box_size: Size
  bounds: RectPosition
  addon_position: Optional[Position2D]
  """ID 106-201 only"""

class UnitCostComponent(EntityComponent):
  cost: Cost
  build_score: int
  destroy_score: int
  is_broodwar: bool
  supply: RequiredAndProvided
  space: RequiredAndProvided

class Unit(Entity):
  serial_number: int = -1
  use_default: bool = True
  """Identical number when unit placed on map. -1 When non-placed unit."""
  
  basic_specification: UnitSpecificationComponent
  stats: UnitStatComponent
  weapons: WeaponComponent 
  ai: UnitAIComponent
  sound: UnitSoundComponent
  size: UnitSizeComponent
  cost: UnitCostComponent

  owner: Player = Player(player_type="Inactive", race="Inactive", color=0)
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

class UnitProperty(Object):
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
  
class UnitRestriction(Object):
  availability: list[bool]
  global_availability: bool
  uses_defaults: list[bool]