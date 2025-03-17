from pydantic import BaseModel


class Weapon(BaseModel):
  weapon_id: int
  damage: int
