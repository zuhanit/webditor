from app.models.asset import Asset
from pydantic import BaseModel
from .player import Force, Player
from .string import String
from .entities.unit import UnitProperty
from .validation import Validation
from .rawtrigger import RawTriggerSection
from .terrain import RawTerrain
from .entity_node import EntityNode
import datetime


class ScenarioProperty(BaseModel):
  name: String
  description: String


class Usemap(BaseModel):
  terrain: RawTerrain
  player: list[Player]
  string: list[String]
  validation: Validation
  unit_properties: list[UnitProperty]
  raw_triggers: RawTriggerSection
  raw_mbrf_triggers: RawTriggerSection
  force: list[Force]
  scenario_property: ScenarioProperty
  entities: list[EntityNode]
  assets: Asset


class Project(BaseModel):
  filename: str
  path: str
  uid: str
  uploadedAt: datetime.datetime
  url: str
