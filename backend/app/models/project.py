from pydantic import BaseModel
import datetime

from .definitions.weapon_definition import CHKWeapon, WeaponDefinition
from .location import Location
from .player import Force, Player
from .sprite import CHKSprite, Sprite
from .string import String
from .terrain import RawTerrain
from .unit import Unit, CHKUnit, UnitProperty, UnitRestriction
from .validation import Validation
from .mask import Mask
from .tech import TechRestriction, CHKTechnology, Technology, Upgrade, UpgradeRestriction, UpgradeSetting
from .rawtrigger import RawTriggerSection

class ScenarioProperty(BaseModel):
  name: String
  description: String
  
class _Map(BaseModel):
  terrain: RawTerrain 
  player: list[Player]
  location: list[Location]
  string: list[String]
  validation: Validation
  mask: list[Mask]
  unit_properties: list[UnitProperty]
  upgrade_restrictions: list[UpgradeRestriction]
  tech_restrictions: list[TechRestriction]
  unit_restrictions: list[UnitRestriction]
  raw_triggers: RawTriggerSection
  raw_mbrf_triggers: RawTriggerSection
  force: list[Force]
  scenario_property: ScenarioProperty

class CHKMap(_Map):
  unit: list[CHKUnit]
  placed_unit: list[CHKUnit]
  technologies: list[CHKTechnology]
  weapons: list[CHKWeapon]
  upgrades: list[UpgradeSetting]
  sprite: list[CHKSprite]
  
class Map(_Map):
  unit: list[Unit]
  placed_unit: list[Unit]
  technologies: list[Technology]
  weapons: list[WeaponDefinition]
  upgrades: list[Upgrade]
  sprite: list[Sprite]
  placed_sprite: list[Sprite]

class Project(BaseModel):
  filename: str
  path: str
  uid: str
  uploadedAt: datetime.datetime
  url: str