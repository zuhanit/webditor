from typing import Union
from app.models.asset import Asset
from pydantic import BaseModel
from .player import Force, Player
from .string import String
from .entities.unit import UnitProperty
from .validation import Validation
from .rawtrigger import RawTriggerSection
from .terrain import RawTerrain
from .entities.unit import Unit
from .entities.sprite import Sprite
from .entities.tile import Tile
from .entities.location import Location
from .entities.mask import Mask
from .entities.entity import Entity
from .definitions import (
  Definition,
  Technology,
  Upgrade,
  UpgradeRestriction,
  TechRestriction,
  UnitRestriction,
  FlingyDefinition,
  SpriteDefinition,
  ImageDefinition,
  WeaponDefinition,
  UnitDefinition,
  OrderDefinition,
  PortraitDefinition,
)

import datetime

AssetType = Union[
  Definition,
  UnitDefinition,
  WeaponDefinition,
  SpriteDefinition,
  Technology,
  FlingyDefinition,
  OrderDefinition,
  ImageDefinition,
  UpgradeRestriction,
  TechRestriction,
  UnitRestriction,
  Upgrade,
  Technology,
  PortraitDefinition,
  Unit,
  Sprite,
]


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
  entities: list[Asset[Union[Entity, Unit, Sprite, Tile, Location, Mask]]]
  assets: list[Asset[AssetType]]


class Project(BaseModel):
  filename: str
  path: str
  uid: str
  uploadedAt: datetime.datetime
  url: str
