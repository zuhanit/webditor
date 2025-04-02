from pydantic import BaseModel
import datetime

from .location import Location
from .player import Force, Player
from .sprite import Sprite
from .string import String
from .terrain import RawTerrain
from .unit import Unit, UnitProperty, UnitRestriction
from .validation import Validation
from .mask import Mask
from .tech import TechRestriction, Technology, UpgradeRestriction, UpgradeSetting
from .rawtrigger import RawTriggerSection

class ScenarioProperty(BaseModel):
  name: String
  description: String

class RawMap(BaseModel):
  unit: list[Unit]
  terrain: RawTerrain
  player: list[Player]
  location: list[Location]
  placed_unit: list[Unit]
  sprite: list[Sprite]
  string: list[String]
  validation: Validation
  mask: list[Mask]
  unit_properties: list[UnitProperty]
  upgrade_restrictions: list[UpgradeRestriction]
  tech_restrictions: list[TechRestriction]
  upgrades: list[UpgradeSetting]
  technologies: list[Technology]
  unit_restrictions: list[UnitRestriction]
  raw_triggers: RawTriggerSection
  raw_mbrf_triggers: RawTriggerSection
  force: list[Force]
  scenario_property: ScenarioProperty

class Project(BaseModel):
  filename: str
  path: str
  uid: str
  uploadedAt: datetime.datetime
  url: str