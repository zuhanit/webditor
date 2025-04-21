from typing import Literal
from pydantic import Field, BaseModel
from .definition import Definition

class Damage(BaseModel):
  amount: int = Field(le=65536, ge=0)
  """Default damage."""
  bonus: int = Field(le=65536, ge=0)
  """Additional damage when weapon upgrade completed."""
  factor: int
  """How many weapon shoot."""
  
class Range(BaseModel):
  min: int
  max: int
  
class Splash(BaseModel):
  inner: int
  medium: int
  outer: int

class Bullet(BaseModel):
  behaviour: int
  remove_after: int
  attack_angle: int
  launch_spin: int
  x_offset: int
  y_offset: int

class WeaponDefinition(Definition):
  damage: Damage
  bullet: Bullet
  splash: Splash
  cooldown: int
  upgrade: int
  weapon_type: int
  explosion_type: int
  target_flags: int
  error_message: int
  icon: int
  graphics: int
  
class CHKWeapon(BaseModel):
  damage: Damage