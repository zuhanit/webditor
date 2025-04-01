from pydantic import BaseModel, Field
from .player import Player
from .object import Object
from .components.weapon import Weapon
from .entity import Entity
from .cost import Cost
from enum import Flag


class Stat(Object):
  current: int = Field(default=0, ge=0)
  max: int = Field(default=0, ge=0)


class Unit(Entity):
  serial_number: int = -1
  """Identical number when unit placed on map. -1 When non-placed unit."""
  cost: Cost
  hit_points: Stat = Stat(name="Hit Points")
  shield_points: Stat = Stat(name="Shield Points")
  energy_points: Stat = Stat(name="Energy Points")
  armor_points: int = Field(default=0, lt=256)
  build_time: int
  weapon: Weapon
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
