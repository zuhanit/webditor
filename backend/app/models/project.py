from app.models.definitions.definition import Definition
from pydantic import BaseModel
from .player import Force, Player
from .string import String
from .entities.unit import UnitProperty
from .validation import Validation
from .rawtrigger import RawTriggerSection
from .entities.entity import Entity
from .terrain import RawTerrain
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
  entities: list[Entity]
  assets: list[Definition]


class Project(BaseModel):
  filename: str
  path: str
  uid: str
  uploadedAt: datetime.datetime
  url: str
