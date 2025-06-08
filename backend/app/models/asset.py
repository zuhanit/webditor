from __future__ import annotations
from typing import Literal, Optional
from pydantic import Field
from .tree import Node


class Asset(Node[dict]):
  type: Literal["folder", "file"]
  preview: Optional[int] = None
  children: list["Asset"] = Field(default_factory=list)


Asset.model_rebuild()
