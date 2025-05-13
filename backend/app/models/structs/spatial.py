from .struct import Struct


class Size(Struct):
  height: int
  width: int


class RectPosition(Struct):
  left: int
  top: int
  right: int
  bottom: int


class Position2D(Struct):
  x: int = 0
  y: int = 0
