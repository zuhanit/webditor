from pydantic import BaseModel


class Weapon(BaseModel):
  id: int
  damage: int
  upgrade_damage: int
