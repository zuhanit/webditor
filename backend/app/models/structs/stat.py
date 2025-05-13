from pydantic import Field
from .struct import Struct


class Stat(Struct):
  current: int = Field(default=0, ge=0)
  max: int = Field(default=0, ge=0)
