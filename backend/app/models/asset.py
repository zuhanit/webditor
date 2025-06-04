from typing import Literal, Optional
from pydantic import BaseModel


class Asset(BaseModel):
  name: str
  type: Literal["folder", "file"]
  children: Optional[list["Asset"]] = None
  data: Optional[dict] = None

  class Config:
    arbitrary_types_allowed = True


Asset.model_rebuild()
