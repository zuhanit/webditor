from dataclasses import dataclass
from typing import Optional


@dataclass
class Image:
  id: int
  name: str
  graphic: int
  turnable: bool
  clickable: bool
  use_full_iscript: bool
  draw_if_cloaked: bool
  draw_function: int
  remapping: int
  iscript_id: int
  shield_overlay: int
  attack_overlay: int
  damage_overlay: int
  special_overlay: int
  landing_dust_overlay: int
  lift_off_overlay: int


@dataclass
class Flingy:
  id: int
  name: str
  sprite: int
  top_speed: int
  acceleration: int
  halt_distance: int
  turn_radius: int
  unused: int
  move_control: int


@dataclass
class Order:
  id: int
  name: str
  label: int
  use_weapon_targeting: bool
  can_be_interrupted: bool
  can_be_queued: bool
  targeting: int
  energy: int
  animation: int
  highlight: int
  obscured_order: int


@dataclass
class Portrait:
  id: int
  name: str
  portrait_file: int
  smk_change: int
  unknown1: int


@dataclass
class Sprite:
  id: int
  name: str
  owner: int
  flags: int
  image: int
  health_bar: Optional[int]
  selection_circle_image: Optional[int]
  selection_circle_offset: Optional[int]
