from dataclasses import dataclass


@dataclass
class Position:
  x: int
  y: int


@dataclass
class Size:
  width: int
  height: int
