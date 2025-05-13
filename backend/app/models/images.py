from .wobject import WObject


class Image(WObject):
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
