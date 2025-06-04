from typing import Literal, TypeAlias


Race: TypeAlias = Literal[
  "Zerg",
  "Terran",
  "Protoss",
  "Invalid (Independant)",
  "Invalid (Neutral)",
  "User Selectable",
  "Random",
  "Inactive",
]

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
