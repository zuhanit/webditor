from typing import Optional
from ..definitions.flingy import FlingyDefinition
from pydantic import Field
from .struct import Struct
from .required_and_provided import RequiredAndProvided
from .spatial import Position2D, RectPosition, Size
from .stat import Stat
from .cost import Cost
from ..definitions.weapon import WeaponDefinition


class UnitSpecification(Struct):
  name: str = "Unit Specification"
  graphics: FlingyDefinition
  subunit1: int
  subunit2: int
  infestation: Optional[int]
  """ID 106-201 only"""
  construction_animation: int
  unit_direction: int
  portrait: int
  label: int


class UnitStatus(Struct):
  name: str = "Unit Status"
  hit_points: Stat
  shield_enable: bool
  shield_points: Stat
  energy_points: Stat
  armor_points: int = Field(default=0, lt=256)
  armor_upgrade: int
  rank: int
  elevation_level: int


class UnitAI(Struct):
  name: str = "Unit AI"
  computer_idle: int
  human_idle: int
  return_to_idle: int
  attack_unit: int
  attack_and_move: int
  internal: int
  right_click: int


class UnitSound(Struct):
  name: str = "Unit Sound"
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


class UnitSize(Struct):
  name: str = "Unit Size"
  size_type: int
  placement_box_size: Size
  bounds: RectPosition
  addon_position: Optional[Position2D]  # noqa: F821
  """ID 106-201 only"""


class UnitCost(Struct):
  name: str = "Unit Cost"
  cost: Cost
  build_score: int
  destroy_score: int
  is_broodwar: bool
  supply: RequiredAndProvided
  space: RequiredAndProvided


class UnitWeapon(Struct):
  ground_weapon: Optional[WeaponDefinition]
  max_ground_hits: int
  air_weapon: Optional[WeaponDefinition]
  max_air_hits: int
  target_acquisition_range: int
  sight_range: int
  special_ability_flags: int
