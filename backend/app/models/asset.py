from __future__ import annotations
from pydantic import BaseModel
from pydantic.generics import GenericModel
from typing import Generic, Literal, Optional, TypeVar

T = TypeVar("T", bound=BaseModel)


class Asset(GenericModel, Generic[T]):
  name: str
  id: int
  type: Literal["folder", "file"]
  preview: Optional[int] = None
  parent_id: int = 0
  data: Optional[T] = None
