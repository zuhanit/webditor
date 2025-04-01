from enum import Flag
from pydantic import BaseModel, Field
from typing import TypeAlias, Literal
from .object import Object

PlayerType: TypeAlias = Literal[
  "Inactive",
  "Computer (game)",
  "Occupied By Human Player",
  "Rescue",
  "Unused",
  "Computer",
  "Human (Open Slot)",
  "Neutral",
  "Closed Slot",
]

OwnrPlayerTypeDict: dict[int, PlayerType] = {
  0: "Inactive",
  1: "Computer (game)",
  2: "Occupied By Human Player",
  3: "Rescue",
  4: "Unused",
  5: "Computer",
  6: "Human (Open Slot)",
  7: "Neutral",
  8: "Closed Slot",
}

OwnrPlayerTypeReverseDict: dict[PlayerType, int] = {
    v: k for k, v in OwnrPlayerTypeDict.items()
}

PlayerRace: TypeAlias = Literal[
  "Zerg",
  "Terran",
  "Protoss",
  "Invalid (Independant)",
  "Invalid (Neutral)",
  "User Selectable",
  "Random",
  "Inactive",
]

SidePlayerRaceDict: dict[int, PlayerRace] = {
  0: "Zerg",
  1: "Terran",
  2: "Protoss",
  3: "Invalid (Independant)",
  4: "Invalid (Neutral)",
  5: "User Selectable",
  6: "Random",
  7: "Inactive",
}

SidePlayerRaceReverseDict: dict[PlayerRace, int] = {
  v: k for k, v in SidePlayerRaceDict.items()
}


class Player(Object):
  color: int
  player_type: PlayerType
  race: PlayerRace
  force: int = Field(default=0, lt=4, ge=0)


class ForcePropertyFlag(Flag):
  random_start_location = 0b00000001
  allies = 0b00000010
  allied_victory = 0b00000100
  shared_vision = 0b00001000

class Force(Object):
  properties: int