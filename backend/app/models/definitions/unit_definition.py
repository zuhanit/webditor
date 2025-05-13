from .definition import Definition
from ..structs.unit_structs import (
  UnitSpecification,
  UnitStatus,
  UnitWeapon,
  UnitAI,
  UnitSound,
  UnitSize,
  UnitCost,
)


class UnitDefinition(Definition):
  """
  Definition of unit specification.
  """

  use_default: bool = True
  specification: UnitSpecification
  stats: UnitStatus
  weapons: UnitWeapon
  ai: UnitAI
  sound: UnitSound
  size: UnitSize
  cost: UnitCost
