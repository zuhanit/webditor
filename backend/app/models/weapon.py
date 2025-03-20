from pydantic import BaseModel


class RawWeapon(BaseModel):
  id: int
  damage: int
  upgrade_damage: int