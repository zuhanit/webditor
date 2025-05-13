from typing import Literal
from ..wobject import WObject


class Definition(WObject):
  """Object for saving data to class."""

  name: str = "Definition"
  ref_type: Literal["Definition"] = "Definition"
