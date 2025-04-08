from .object import Object

class Order(Object): 
  label: int
  use_weapon_targeting: bool
  can_be_interrupted: bool
  can_be_queued: bool
  targeting: int
  energy: int
  animation: int
  highlight: int
  obscured_order: int