from app.types.tileset import Tileset


EraTilesetDict: dict[int, Tileset] = {
  0: "Ashworld",
  1: "Badlands",
  2: "Desert",
  3: "Ice",
  4: "Installation",
  5: "Jungle",
  6: "Platform",
  7: "Twilight",
}
EraTilesetReverseDict: dict[Tileset, int] = {v: k for k, v in EraTilesetDict.items()}
