from dataclasses import dataclass
from enum import IntFlag
from typing import Optional
from app.types.spatial import Position, Size
from app.types.race import PlayerType, Race
from app.types.tileset import Tileset


@dataclass
class Cost:
  mineral: int
  gas: int
  time: int


@dataclass
class Stat:
  hit_points: int
  shield_points: int
  armor_points: Optional[int] = None
  energy_points: Optional[int] = None


@dataclass
class Damage:
  amount: int
  bonus: int


@dataclass
class String:
  id: int
  content: str


@dataclass
class UnitSetting:
  id: int
  name: str
  use_default: bool
  stat: Stat
  cost: Cost
  string: String


class RelationFlag(IntFlag):
  NYDUS_LINK = 1 << 8
  ADDON_LINK = 1 << 9


class SpecialPropertiesFlag(IntFlag):
  CLOACK = 1 << 0
  BURROW = 1 << 1
  IN_TRANSIT = 1 << 2
  HALLUCINATED = 1 << 3
  INVINCIBLE = 1 << 4


class ValidPropertiesFlag(IntFlag):
  OWNER = 1 << 0
  HP = 1 << 1
  SHIELD = 1 << 2
  ENERGY = 1 << 3
  RESOURCE_AMOUNT = 1 << 4
  HANGAR_AMOUNT = 1 << 5


class UnitStateFlag(IntFlag):
  CLOACKED = 1 << 0
  BURROWED = 1 << 1
  IN_TRANSIT = 1 << 2
  HALLUCINATED = 1 << 3
  INVINCIBLE = 1 << 4


@dataclass
class Unit:
  serial_number: int
  position: Position
  unit_id: int
  relation_type: RelationFlag
  special_properties: SpecialPropertiesFlag
  valid_properties: ValidPropertiesFlag
  owner: "Player"
  stat: Stat
  """Current unit stat, not max."""
  resource_amount: int
  hangar: int
  unit_state: UnitStateFlag
  related_unit: int


@dataclass
class UnitProperty:
  special_properties: SpecialPropertiesFlag
  valid_properties: ValidPropertiesFlag
  owner: int
  stats: Stat
  """Percentage of stats, not number."""
  resource_amount: int
  hangar: int
  flags: SpecialPropertiesFlag


@dataclass
class UnitRestriction:
  id: int
  availability: list[bool]
  global_availability: bool
  uses_defaults: list[bool]


@dataclass
class Weapon:
  damage: Damage


@dataclass
class Terrain:
  size: Size
  tileset: Tileset


@dataclass
class Tile:
  group: int
  id: int
  position: Position


class ForceProperties(IntFlag):
  RANDOM_START_LOCATION = 1 << 0
  ALLIES = 1 << 1
  ALLIED_VICTORY = 1 << 2
  SHARED_VISION = 1 << 3


@dataclass
class Force:
  id: int
  name: String
  properties: ForceProperties


@dataclass
class Player:
  id: int
  color: int
  rgb_color: tuple[int, int, int]
  player_type: PlayerType
  race: Race
  force: Force


class ElevationFlag(IntFlag):
  LOW_ELEVATION = 1 << 0
  MEDIUM_ELEVATION = 1 << 1
  HIGH_ELEVATION = 1 << 2
  LOW_AIR = 1 << 3
  MEDIUM_AIR = 1 << 4
  HIGH_AIR = 1 << 5


@dataclass
class Location:
  id: int
  string: String
  position: Position
  size: Size
  elevation_flag: ElevationFlag


class SpriteFlag(IntFlag):
  DRAW_AS_SPRITE = 1 << 12


@dataclass
class Sprite:
  sprite_id: int
  position: Position
  owner: Player
  flags: SpriteFlag


@dataclass
class ScenarioProperty:
  name: String
  description: String


@dataclass
class Validation:
  ver: bytes
  vcod: bytes


class MaskFlag(IntFlag):
  P1 = 1 << 0
  P2 = 1 << 1
  P3 = 1 << 2
  P4 = 1 << 3
  P5 = 1 << 4
  P6 = 1 << 5
  P7 = 1 << 6
  P8 = 1 << 7


@dataclass
class Mask:
  position: Position
  flags: MaskFlag


@dataclass
class UpgradeRestriction:
  id: int
  player_maximum_level: list[int]
  player_minimum_level: list[int]
  default_maximum_level: int
  default_minimum_level: int
  uses_default: list[bool]


@dataclass
class TechRestriction:
  id: int
  player_availability: list[bool]
  player_already_researched: list[bool]
  default_availability: bool
  default_already_researched: bool
  uses_default: list[bool]


@dataclass
class Upgrade:
  id: int
  use_default: bool
  base_cost: Cost
  factor_cost: Cost


@dataclass
class CostWithEnergy(Cost):
  energy: int


@dataclass
class Technology:
  id: int
  use_default: list[bool]
  cost: CostWithEnergy


@dataclass
class Trigger:
  raw_data: bytes
