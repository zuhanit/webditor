from .object import Object
from enum import Flag

class MaskFlag(Flag):
  player_1 = 0b00000001
  player_2 = 0b00000010
  player_3 = 0b00000100
  player_4 = 0b00001000
  player_5 = 0b00010000
  player_6 = 0b00100000
  player_7 = 0b01000000
  player_8 = 0b10000000

class Mask(Object):
  """Fog of War"""
  flags: int