from pydantic import BaseModel
from .definitions.weapon_definition import WeaponDefinition
from .location import Location
from .player import Force, Player
from .sprite import Sprite
from .string import String
from .terrain import RawTerrain
from .unit import Unit, UnitProperty, UnitRestriction
from .validation import Validation
from .mask import Mask
from .tech import TechRestriction, Technology, Upgrade, UpgradeRestriction
from .rawtrigger import RawTriggerSection
from .flingy import Flingy
from .images import Image
from .order import Order
from .portrait import Portrait
import datetime

class ScenarioProperty(BaseModel):
  name: String
  description: String
  
class Map(BaseModel):
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
  unit: list[Unit]
  placed_unit: list[Unit]
  technologies: list[Technology]
  weapons: list[WeaponDefinition]
  upgrades: list[Upgrade]
  sprite: list[Sprite]
  placed_sprite: list[Sprite]
  images: list[Image]
  flingy: list[Flingy]
  orders: list[Order]
  portrait: list[Portrait]

class Project(BaseModel):
  filename: str
  path: str
  uid: str
  uploadedAt: datetime.datetime
  url: str