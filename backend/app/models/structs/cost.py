from pydantic import Field
from .struct import Struct

class Cost(Struct):
  mineral: int = Field(default=0, ge=0)
  gas: int = Field(default=0, ge=0)
  time: int = Field(default=0, ge=0)