from pydantic import BaseModel, Field


class WObject(BaseModel):
  id: int = 0
  name: str = Field(default="Object")
