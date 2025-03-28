from pydantic import BaseModel, Field
from .player import Player
from .object import Object
from .components.weapon import Weapon
from .entity import Entity
from enum import Flag
import struct

class Cost(BaseModel):
  mineral: int
  gas: int

class RawUnit(CHKModel):
  use_default: int
  hit_points: int
  shield_points: int
  armor_points: int
  build_time: int
  mineral_cost: int
  gas_cost: int
  string_number: int
  weapon_damage: int
  weapon_upgrade_damage: int
  id: int
  
  @property
  def to_webditor(self) -> "Unit":
    return Unit(
      hit_points=self.hit_points,
      shield_points=self.shield_points,
      armor_points=self.armor_points,
      build_time=self.build_time,
      name="Test", #TODO: Use string_number property and convert to unit name on STRx.
      cost=Cost(mineral=self.mineral_cost, gas=self.gas_cost),
      id=self.id,
      weapon=RawWeapon(id=1, damage=1, upgrade_damage=1) #TODO: Weapon
    )
  
  @classmethod
  def from_webditor(cls, webditor: WebditorModel) -> "RawUnit":
      if not isinstance(webditor, Unit):
        raise TypeError(f"Expected unit, got {type(webditor)}")

      return RawUnit(
        use_default=False,
        hit_points=webditor.hit_points,
        shield_points=webditor.shield_points,
        armor_points=webditor.armor_points,
        build_time=webditor.build_time,
        mineral_cost=webditor.cost.mineral,
        gas_cost=webditor.cost.gas,
        string_number=1,
        weapon_damage=webditor.weapon.damage,
        weapon_upgrade_damage=webditor.weapon.upgrade_damage,
        id=webditor.id
      )    

class Unit(WebditorModel):
  hit_points: int
  "Note the displayed value is this value / 256, with the low byte being a fractional HP value"
  shield_points: int
  armor_points: int
  build_time: int
  "1/60 seconds"
  name: str
  cost: Cost
  id: int
  weapon: RawWeapon 
  
  @property
  def to_raw(self) -> RawUnit:
    return RawUnit(
      use_default=False,
      hit_points=self.hit_points,
      shield_points=self.shield_points,
      armor_points=self.armor_points,
      build_time=self.build_time,
      mineral_cost=self.cost.mineral,
      gas_cost=self.cost.gas,
      string_number=1,
      weapon_damage=self.weapon.damage,
      weapon_upgrade_damage=self.weapon.upgrade_damage,
      id=1
    )
  
  @classmethod
  def from_raw(cls, raw: CHKModel) -> "Unit":
    if not isinstance(raw, RawUnit):
      raise TypeError(f"Expected RawUnit, got {type(raw)}")

    return Unit(
      hit_points=raw.hit_points,
      shield_points=raw.shield_points,
      armor_points=raw.armor_points,
      build_time=raw.build_time,
      name="Aa",
      cost=Cost(mineral=raw.mineral_cost, gas=raw.gas_cost),
      weapon=RawWeapon(id=1, damage=1, upgrade_damage=1),
      id=1
    )
    
class PlacedUnitRelationFlag(Flag):
  nydus_link = 0b10000000
  addon_link = 0b100000000

class SpecialPropertiesFlag(Flag):
  cloak         = 0b1
  burrow        = 0b10
  in_transit    = 0b100
  hallucinated  = 0b1000
  invincible    = 0b10000

class ValidPropertiesFlag(Flag):
  owner_player  = 0b1
  hp            = 0b10
  shields       = 0b100
  energy        = 0b1000
  resource      = 0b10000
  amount        = 0b100000  
  
class UnitStateFlag(Flag):
  cloaked       = 0b1
  burrowed      = 0b10
  is_transit    = 0b100
  hallucinated  = 0b1000
  invincible    = 0b10000 

class PlacedUnit(BaseModel):
  serial_number: int
  position: Position2D
  id: int
  relation_type: int 
  special_properties: int 
  valid_properties: int 
  owner:  int
  hp_percent: int
  shield_percent: int
  resource_amount: int
  hangar: int
  unit_state: int 
  related_unit: int 
  
  