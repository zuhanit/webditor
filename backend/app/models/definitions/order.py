from .definition import Definition


class OrderDefinition(Definition):
  label: int
  use_weapon_targeting: bool
  can_be_interrupted: bool
  can_be_queued: bool
  targeting: int
  energy: int
  animation: int
  highlight: int
  obscured_order: int
