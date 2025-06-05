from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Generic, Optional, TypeVar


T = TypeVar("T")


class Node(BaseModel, Generic[T]):
  name: str
  children: list["Node[T]"] = Field(default_factory=list)
  data: Optional[T] = None


Node.model_rebuild()
