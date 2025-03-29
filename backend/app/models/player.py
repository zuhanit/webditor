from pydantic import BaseModel
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


class Player(Object):
  color: int
  player_type: PlayerType
  race: PlayerRace
