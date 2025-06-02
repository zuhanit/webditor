from app.types.race import PlayerType, Race


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

SidePlayerRaceDict: dict[int, Race] = {
  0: "Zerg",
  1: "Terran",
  2: "Protoss",
  3: "Invalid (Independant)",
  4: "Invalid (Neutral)",
  5: "User Selectable",
  6: "Random",
  7: "Inactive",
}

SidePlayerRaceReverseDict: dict[Race, int] = {
  v: k for k, v in SidePlayerRaceDict.items()
}

OwnrPlayerTypeReverseDict: dict[PlayerType, int] = {
  v: k for k, v in OwnrPlayerTypeDict.items()
}
