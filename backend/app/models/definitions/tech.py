from pydantic import Field
from .definition import Definition
from ..structs.cost import Cost


class UpgradeRestriction(Definition):
  player_maximum_level: list[int] = Field(min_length=12, max_length=12)
  player_minimum_level: list[int] = Field(min_length=12, max_length=12)
  default_maximum_level: int
  default_minimum_level: int
  uses_default: list[bool] = Field(min_length=12, max_length=12)


class TechRestriction(Definition):
  player_availability: list[bool] = Field(min_length=12, max_length=12)
  player_already_researched: list[bool] = Field(min_length=12, max_length=12)
  default_availability: bool
  default_already_researched: bool
  uses_default: list[bool] = Field(min_length=12, max_length=12)


class TechCost(Cost):
  energy: int = Field(default=0, ge=0)


class Technology(Definition):
  use_default: bool
  cost: TechCost
  energy_required: bool
  icon: int
  label: int
  race: int


class UpgradeSetting(Definition):
  uses_default: bool
  base_cost: Cost
  factor_cost: Cost


class Upgrade(Definition):
  use_default: bool
  base_cost: Cost
  factor_cost: Cost
  icon: int
  label: int
  race: int
